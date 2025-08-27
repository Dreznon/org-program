import os
from contextlib import contextmanager
from typing import Iterator

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", "sqlite:///./org.db")


def get_upload_dir() -> str:
    return os.getenv("UPLOAD_DIR", "./uploads")


engine = create_engine(
    get_database_url(),
    connect_args={"check_same_thread": False} if get_database_url().startswith("sqlite") else {},
    echo=False,
)


def init_db() -> None:
    from . import models  # noqa: F401 - ensure models are imported for SQLModel metadata
    SQLModel.metadata.create_all(engine)


def create_fts_tables() -> None:
    # Create a simple contentless FTS5 table for items search across title/description/ocr_text
    with engine.connect() as conn:
        conn.exec_driver_sql(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS item_fts USING fts5(
                item_id UNINDEXED,
                title,
                description,
                ocr_text
            );
            """
        )


def reset_fts_for_item(session: Session, item_id: str, title: str, description: str, ocr_text: str) -> None:
    # Remove existing rows for this item and insert fresh content
    session.exec(text("DELETE FROM item_fts WHERE item_id = :item_id").bindparams(item_id=item_id))
    session.exec(
        text(
            "INSERT INTO item_fts (item_id, title, description, ocr_text) VALUES (:item_id, :title, :description, :ocr)"
        ).bindparams(item_id=item_id, title=title or "", description=description or "", ocr=ocr_text or "")
    )


@contextmanager
def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
