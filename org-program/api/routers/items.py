import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlmodel import Session, select

from ..deps import get_db_session
from ..db import reset_fts_for_item
from ..models import Item
from ..schemas import ItemCreate, ItemRead, ItemUpdate


router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=List[ItemRead])
def list_items(
    q: Optional[str] = Query(default=None, description="Keyword search"),
    session: Session = Depends(get_db_session),
):
    if q:
        # Simple FTS5 search across title, description, ocr_text
        rows = session.exec(
            text("SELECT item_id FROM item_fts WHERE item_fts MATCH :q").bindparams(q=q)
        ).all()
        if not rows:
            return []
        ids = [uuid.UUID(r[0]) if isinstance(r[0], str) else r[0] for r in rows]
        items = session.exec(select(Item).where(Item.id.in_(ids))).all()
        # Preserve the order of FTS results
        order_map = {id_: i for i, id_ in enumerate(ids)}
        items.sort(key=lambda it: order_map.get(it.id, 1_000_000))
        return items
    return session.exec(select(Item).order_by(Item.created_at.desc())).all()


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, session: Session = Depends(get_db_session)):
    item = Item(**payload.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)

    # Update FTS
    ocr_text = ""
    reset_fts_for_item(session, str(item.id), item.title, item.description or "", ocr_text)
    session.commit()
    session.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemRead)
def get_item(item_id: uuid.UUID, session: Session = Depends(get_db_session)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=ItemRead)
def update_item(
    item_id: uuid.UUID, payload: ItemUpdate, session: Session = Depends(get_db_session)
):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(item, k, v)
    session.add(item)
    session.commit()
    session.refresh(item)

    # Update FTS
    ocr_text = ""
    reset_fts_for_item(session, str(item.id), item.title, item.description or "", ocr_text)
    session.commit()
    session.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: uuid.UUID, session: Session = Depends(get_db_session)):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(item)
    session.commit()
    # Clean FTS row
    session.exec("DELETE FROM item_fts WHERE item_id = :item_id", {"item_id": str(item_id)})
    session.commit()
    return None
