import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None
    type: Optional[str] = None
    format: Optional[str] = None
    coverage: Optional[str] = None
    rights: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    source: Optional[str] = None
    creators: List[str] = []
    contributors: List[str] = []
    subjects: List[str] = []
    identifiers: List[str] = []


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    type: Optional[str] = None
    format: Optional[str] = None
    coverage: Optional[str] = None
    rights: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    source: Optional[str] = None
    creators: Optional[List[str]] = None
    contributors: Optional[List[str]] = None
    subjects: Optional[List[str]] = None
    identifiers: Optional[List[str]] = None


class AssetRead(BaseModel):
    id: uuid.UUID
    item_id: uuid.UUID
    file_path: str
    mime_type: Optional[str]
    bytes: int
    checksum: Optional[str]
    exif_json: dict
    ocr_json: dict
    is_primary: bool

    model_config = ConfigDict(from_attributes=True)


class ItemRead(ItemBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    assets: List[AssetRead] = []

    model_config = ConfigDict(from_attributes=True)
