from fastapi.testclient import TestClient

from api.main import app


client = TestClient(app)


def test_export_dc_xml():
    # Create item
    resp = client.post(
        "/api/items",
        json={
            "title": "Doc",
            "creators": ["Jane Doe"],
            "subjects": ["Topic"],
            "identifiers": ["INV-00123"],
        },
    )
    assert resp.status_code == 201
    item = resp.json()

    # Export
    xml_resp = client.get(f"/api/export/dc", params={"ids": item["id"]})
    assert xml_resp.status_code == 200
    body = xml_resp.text
    assert "<dc:title>Doc</dc:title>" in body
    assert "http://purl.org/dc/elements/1.1/" in body

