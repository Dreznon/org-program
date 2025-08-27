import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select

from ..deps import get_db_session
from ..models import Item
from ..services.dc_xml import items_to_dc_xml


router = APIRouter(prefix="/export", tags=["export"])


@router.get("/dc")
def export_dc(ids: str = Query(..., description="Comma-separated UUIDs"), session: Session = Depends(get_db_session)):
    if not ids.strip():
        raise HTTPException(status_code=400, detail="ids is required")
    try:
        id_list = [uuid.UUID(x.strip()) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID in ids")

    items: List[Item] = session.exec(select(Item).where(Item.id.in_(id_list))).all()
    # Serialize items as dicts suitable for XML builder
    items_payload = []
    for it in items:
        items_payload.append(
            {
                "title": it.title,
                "description": it.description,
                "date": it.date,
                "type": it.type,
                "format": it.format,
                "coverage": it.coverage,
                "rights": it.rights,
                "publisher": it.publisher,
                "language": it.language,
                "source": it.source,
                "creators": it.creators or [],
                "contributors": it.contributors or [],
                "subjects": it.subjects or [],
                "identifiers": it.identifiers or [],
            }
        )

    xml_str = items_to_dc_xml(items_payload)
    return Response(content=xml_str, media_type="application/xml")
