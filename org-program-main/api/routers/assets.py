import hashlib
import mimetypes
import os
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session

from ..deps import get_db_session
from ..db import get_upload_dir, reset_fts_for_item
from ..models import Asset, Item
from ..services.exif import extract_exif
from ..services.ocr import extract_ocr_stub


router = APIRouter(prefix="/items", tags=["assets"])
def _infer_subjects(filename: str, exif: dict, ocr: dict) -> list[str]:
    """
    Very simple, rule-based subject inference using filename tokens, EXIF hints, and OCR text.
    This is intentionally conservative and capped to a handful of tags.
    """
    subjects: set[str] = set()

    try:
        base = os.path.splitext(os.path.basename(filename or ""))[0].lower()
        tokens = {t for t in base.replace("_", " ").replace("-", " ").split() if len(t) > 2}

        # Filename-driven categories
        if any(t in tokens for t in {"library","museum","building","architecture","church","bridge","tower","castle"}):
            subjects.add("architecture")
            subjects.add("places")
        if any(t in tokens for t in {"fan","art","drawing","sketch","illustration"}):
            subjects.add("art")
            subjects.add("fan art")

        raw = (exif or {}).get("raw", {})

        # EXIF Artist -> subject hint
        artist = raw.get("Artist")
        if isinstance(artist, (bytes, bytearray)):
            try:
                artist = artist.decode("utf-16-le", errors="ignore")
            except Exception:
                artist = str(artist)
        if artist:
            subjects.add("artist:" + str(artist).strip())

        software = str(raw.get("Software") or "").lower()
        if "scanner" in software:
            subjects.add("scanned")

        # OCR text keyword hints
        text = (ocr or {}).get("text") or ""
        if any(k in text.lower() for k in ["library","archive","museum"]):
            subjects.add("places")

    except Exception as e:
        print(f"[DEBUG][assets._infer_subjects] inference failed: {e}")

    # Limit number to keep UI tidy
    return sorted(list(subjects))[:10]


@router.post("/{item_id}/assets", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_asset(
    item_id: uuid.UUID,
    file: UploadFile = File(...),
    session: Session = Depends(get_db_session),
):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    upload_root = Path(get_upload_dir())
    upload_root.mkdir(parents=True, exist_ok=True)
    item_dir = upload_root / str(item.id)
    item_dir.mkdir(parents=True, exist_ok=True)

    original_name = os.path.basename(file.filename or "upload.bin")
    dest_path = item_dir / original_name

    # Save to disk and compute checksum and bytes
    sha256 = hashlib.sha256()
    size = 0
    with dest_path.open("wb") as out_f:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            out_f.write(chunk)
            size += len(chunk)
            sha256.update(chunk)

    mime_type = file.content_type or mimetypes.guess_type(str(dest_path))[0] or "application/octet-stream"
    checksum = sha256.hexdigest()

    # Extract metadata
    exif = extract_exif(str(dest_path))
    ocr = extract_ocr_stub(str(dest_path))

    asset = Asset(
        item_id=item.id,
        file_path=str(dest_path.relative_to(Path.cwd())) if str(dest_path).startswith(str(Path.cwd())) else str(dest_path),
        mime_type=mime_type,
        bytes=size,
        checksum=checksum,
        exif_json=exif,
        ocr_json=ocr,
        is_primary=False,
    )
    session.add(asset)
    session.commit()
    session.refresh(asset)

    # Auto-populate item fields from EXIF if they're empty
    item_updated = False
    
    # Set title from filename (no extension) if empty
    if not item.title or item.title.strip() == "":
        filename_without_ext = os.path.splitext(original_name)[0]
        item.title = filename_without_ext
        item_updated = True
    
    # Set format from MIME type if empty
    if not item.format or item.format.strip() == "":
        item.format = mime_type
        item_updated = True
    
    # Set date from EXIF if empty and available
    if (not item.date or item.date.strip() == "") and exif.get("date"):
        item.date = exif["date"]
        item_updated = True
    
    # Set coverage from GPS if empty and available
    if (not item.coverage or item.coverage.strip() == "") and exif.get("gps"):
        gps = exif["gps"]
        item.coverage = f"{gps['lat']},{gps['lon']}"
        item_updated = True
    
    # Subjects/category inference (rule-based)
    suggested = _infer_subjects(original_name, exif, ocr)
    if suggested:
        before_subjects = set(item.subjects or [])
        after_subjects = sorted(list(before_subjects.union(suggested)))
        if after_subjects != item.subjects:
            print(f"[DEBUG][assets.upload] inferred subjects add={suggested}")
            item.subjects = after_subjects
            item_updated = True

    # Set high-level type from MIME
    if not item.type:
        if (mime_type or '').startswith('image/'):
            item.type = 'photo'
            item_updated = True
        elif (mime_type or '').startswith('application/pdf'):
            item.type = 'document'
            item_updated = True

    # Map EXIF raw to DC-like fields if empty
    raw = (exif or {}).get("raw", {})

    # description
    if (not item.description or item.description.strip() == ""):
        desc = raw.get("ImageDescription") or raw.get("XPComment")
        if isinstance(desc, (bytes, bytearray)):
            try:
                desc = desc.decode("utf-16-le", errors="ignore")
            except Exception:
                desc = str(desc)
        if desc and isinstance(desc, str) and desc.strip():
            item.description = desc.strip()
            item_updated = True

    # creators
    artist = raw.get("Artist") or raw.get("XPAuthor")
    if artist:
        if isinstance(artist, (bytes, bytearray)):
            try:
                artist = artist.decode("utf-16-le", errors="ignore")
            except Exception:
                artist = str(artist)
        names = [n.strip() for n in str(artist).replace("|", ";").split(";") if n.strip()]
        before = set(item.creators or [])
        after = sorted(list(before.union(names)))
        if after != item.creators:
            item.creators = after
            item_updated = True

    # subjects from XPKeywords
    xp_kw = raw.get("XPKeywords")
    if xp_kw:
        if isinstance(xp_kw, (bytes, bytearray)):
            try:
                xp_kw = xp_kw.decode("utf-16-le", errors="ignore")
            except Exception:
                xp_kw = str(xp_kw)
        kw = [k.strip() for k in str(xp_kw).replace(",", ";").split(";") if k.strip()]
        before = set(item.subjects or [])
        after = sorted(list(before.union(kw)))
        if after != item.subjects:
            item.subjects = after
            item_updated = True

    # identifier as checksum
    if checksum:
        before_ids = set(item.identifiers or [])
        after_ids = sorted(list(before_ids.union([checksum])))
        if after_ids != item.identifiers:
            item.identifiers = after_ids
            item_updated = True

    # source from Make/Model
    if (not item.source or item.source.strip() == ""):
        make = str(raw.get("Make") or "").strip()
        model = str(raw.get("Model") or "").strip()
        src = (make + " " + model).strip()
        if src:
            item.source = src
            item_updated = True

    # Commit item updates if any were made
    if item_updated:
        session.commit()
        session.refresh(item)

    # Update FTS with OCR text if any
    ocr_text = str(ocr.get("text", "") or "")
    from ..models import Item as ItemModel

    # refresh item for most recent values
    session.refresh(item)
    reset_fts_for_item(session, str(item.id), item.title, item.description or "", ocr_text)
    session.commit()

    return {
        "id": str(asset.id),
        "item_id": str(asset.item_id),
        "file_path": asset.file_path,
        "mime_type": asset.mime_type,
        "bytes": asset.bytes,
        "checksum": asset.checksum,
        "exif_json": asset.exif_json,
        "ocr_json": asset.ocr_json,
        "is_primary": asset.is_primary,
    }
