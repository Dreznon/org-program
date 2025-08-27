import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel, Relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Item(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)

    title: str = Field(index=True)
    description: Optional[str] = None
    date: Optional[str] = None
    type: Optional[str] = None
    format: Optional[str] = None
    coverage: Optional[str] = None
    rights: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    source: Optional[str] = None

    # Store arrays as JSON for MVP simplicity
    creators: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    contributors: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    subjects: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    identifiers: List[str] = Field(default_factory=list, sa_column=Column(JSON))

    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    assets: list["Asset"] = Relationship(back_populates="item")


class Asset(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    item_id: uuid.UUID = Field(foreign_key="item.id", index=True)

    file_path: str
    mime_type: Optional[str] = None
    bytes: int = 0
    checksum: Optional[str] = None
    exif_json: dict = Field(default_factory=dict, sa_column=Column(JSON))
    ocr_json: dict = Field(default_factory=dict, sa_column=Column(JSON))
    is_primary: bool = Field(default=False)

    item: Optional[Item] = Relationship(back_populates="assets")
