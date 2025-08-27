from typing import Iterator

from fastapi import Depends
from sqlmodel import Session

from .db import get_session


def get_db_session() -> Iterator[Session]:
    with get_session() as session:
        yield session
