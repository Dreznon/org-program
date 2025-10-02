import os
import tempfile
import uuid

import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient

from api.main import app


client = TestClient(app)


def test_create_and_get_item():
    resp = client.post(
        "/api/items",
        json={
            "title": "Sample Vase",
            "description": "Blue ceramic",
            "date": "2023-01-05",
            "type": "Image",
            "format": "image/jpeg",
            "coverage": "Detroit, MI",
            "rights": "CC BY 4.0",
            "creators": ["Jane Doe"],
            "subjects": ["Ceramics"],
            "identifiers": ["INV-001"],
        },
    )
    assert resp.status_code == 201, resp.text
    item = resp.json()
    item_id = item["id"]

    get_resp = client.get(f"/api/items/{item_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Sample Vase"


def test_search_items():
    resp = client.get("/api/items", params={"q": "ceramic"})
    assert resp.status_code == 200
    items = resp.json()
    assert any("ceramic" in (it.get("description", "").lower()) for it in items)


def test_upload_asset(tmp_path):
    # Create an item first
    item_resp = client.post("/api/items", json={"title": "Photo"})
    assert item_resp.status_code == 201
    item_id = item_resp.json()["id"]

    # Create a temp file
    fpath = tmp_path / "example.txt"
    fpath.write_text("hello world")

    with open(fpath, "rb") as f:
        upload_resp = client.post(
            f"/api/items/{item_id}/assets", files={"file": ("example.txt", f, "text/plain")}
        )
    assert upload_resp.status_code == 201
    data = upload_resp.json()
    assert data["bytes"] == 11
    assert data["checksum"]

