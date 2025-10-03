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
