import os
import tempfile
import uuid
from pathlib import Path
from PIL import Image
import piexif

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from api.main import app
from api.models import Item, Asset
from api.services.exif import extract_exif


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_item(session: Session):
    """Create a sample item for testing."""
    item = Item(
        title="Test Item",
        description="Test description"
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@pytest.fixture
def empty_item(session: Session):
    """Create an empty item for testing auto-population."""
    item = Item(
        title="",  # Empty title to test auto-population
        description="",
        date="",
        format="",
        coverage=""
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def create_test_jpeg_with_exif(temp_dir: Path) -> str:
    """Create a test JPEG file with EXIF data (date and GPS)."""
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    
    # Add EXIF data
    exif_dict = {
        "0th": {
            piexif.ImageIFD.Make: "Test Camera",
            piexif.ImageIFD.Model: "Test Model",
        },
        "Exif": {
            piexif.ExifIFD.DateTimeOriginal: "2023:12:25 14:30:00",
            piexif.ExifIFD.CreateDate: "2023:12:25 14:30:00",
        },
        "GPS": {
            piexif.GPSIFD.GPSLatitudeRef: "N",
            piexif.GPSIFD.GPSLatitude: ((37, 1), (46, 1), (0, 1)),  # 37°46'0" N
            piexif.GPSIFD.GPSLongitudeRef: "W",
            piexif.GPSIFD.GPSLongitude: ((122, 1), (25, 1), (0, 1)),  # 122°25'0" W
        }
    }
    
    exif_bytes = piexif.dump(exif_dict)
    img_path = temp_dir / "test_with_exif.jpg"
    img.save(str(img_path), exif=exif_bytes)
    
    return str(img_path)


def create_test_png_without_exif(temp_dir: Path) -> str:
    """Create a test PNG file without EXIF data."""
    img = Image.new('RGB', (100, 100), color='blue')
    img_path = temp_dir / "test_without_exif.png"
    img.save(str(img_path))
    
    return str(img_path)


def test_extract_exif_with_gps_and_date():
    """Test EXIF extraction from JPEG with GPS and date."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        jpeg_path = create_test_jpeg_with_exif(temp_path)
        
        result = extract_exif(jpeg_path)
        
        # Check that we got the expected structure
        assert "date" in result
        assert "gps" in result
        assert "raw" in result
        
        # Check date extraction
        assert result["date"] == "2023-12-25"
        
        # Check GPS extraction (approximate values)
        assert result["gps"] is not None
        assert "lat" in result["gps"]
        assert "lon" in result["gps"]
        
        # GPS coordinates should be approximately correct
        lat = result["gps"]["lat"]
        lon = result["gps"]["lon"]
        assert 37.7 <= lat <= 37.8  # San Francisco latitude
        assert -122.5 <= lon <= -122.3  # San Francisco longitude
        
        # Check raw EXIF data
        assert result["raw"] is not None
        assert len(result["raw"]) > 0


def test_extract_exif_without_exif():
    """Test EXIF extraction from PNG without EXIF data."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        png_path = create_test_png_without_exif(temp_path)
        
        result = extract_exif(png_path)
        
        # Should return empty structure for PNG without EXIF
        assert result["date"] is None
        assert result["gps"] is None
        assert result["raw"] == {}


def test_extract_exif_nonexistent_file():
    """Test EXIF extraction from non-existent file."""
    result = extract_exif("/nonexistent/file.jpg")
    
    assert result["date"] is None
    assert result["gps"] is None
    assert result["raw"] == {}


def test_upload_jpeg_auto_populates_fields(client: TestClient, empty_item: Item):
    """Test that uploading a JPEG with EXIF auto-populates item fields."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        jpeg_path = create_test_jpeg_with_exif(temp_path)
        
        # Upload the JPEG
        with open(jpeg_path, "rb") as f:
            response = client.post(
                f"/api/items/{empty_item.id}/assets",
                files={"file": ("test_with_exif.jpg", f, "image/jpeg")}
            )
        
        assert response.status_code == 201
        
        # Check that the item was auto-populated
        item_response = client.get(f"/api/items/{empty_item.id}")
        assert item_response.status_code == 200
        
        item_data = item_response.json()
        
        # Should auto-populate title from filename
        assert item_data["title"] == "test_with_exif"
        
        # Should auto-populate format from MIME type
        assert item_data["format"] == "image/jpeg"
        
        # Should auto-populate date from EXIF
        assert item_data["date"] == "2023-12-25"
        
        # Should auto-populate coverage from GPS
        assert item_data["coverage"] is not None
        assert "," in item_data["coverage"]  # Should be "lat,lon" format
        
        # Parse coverage to verify GPS coordinates
        lat_str, lon_str = item_data["coverage"].split(",")
        lat = float(lat_str)
        lon = float(lon_str)
        assert 37.7 <= lat <= 37.8
        assert -122.5 <= lon <= -122.3


def test_upload_png_only_populates_title_and_format(client: TestClient, empty_item: Item):
    """Test that uploading a PNG without EXIF only populates title and format."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        png_path = create_test_png_without_exif(temp_path)
        
        # Upload the PNG
        with open(png_path, "rb") as f:
            response = client.post(
                f"/api/items/{empty_item.id}/assets",
                files={"file": ("test_without_exif.png", f, "image/png")}
            )
        
        assert response.status_code == 201
        
        # Check that only title and format were populated
        item_response = client.get(f"/api/items/{empty_item.id}")
        assert item_response.status_code == 200
        
        item_data = item_response.json()
        
        # Should auto-populate title from filename
        assert item_data["title"] == "test_without_exif"
        
        # Should auto-populate format from MIME type
        assert item_data["format"] == "image/png"
        
        # Should NOT populate date or coverage (no EXIF data)
        assert item_data["date"] == ""
        assert item_data["coverage"] == ""


def test_upload_does_not_overwrite_existing_fields(client: TestClient, sample_item: Item):
    """Test that upload doesn't overwrite existing item fields."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        jpeg_path = create_test_jpeg_with_exif(temp_path)
        
        # Upload the JPEG
        with open(jpeg_path, "rb") as f:
            response = client.post(
                f"/api/items/{sample_item.id}/assets",
                files={"file": ("test_with_exif.jpg", f, "image/jpeg")}
            )
        
        assert response.status_code == 201
        
        # Check that existing fields were NOT overwritten
        item_response = client.get(f"/api/items/{sample_item.id}")
        assert item_response.status_code == 200
        
        item_data = item_response.json()
        
        # Existing fields should remain unchanged
        assert item_data["title"] == "Test Item"
        assert item_data["description"] == "Test description"
        
        # Only format should be updated (since it was empty)
        assert item_data["format"] == "image/jpeg"


def test_asset_exif_json_storage(client: TestClient, sample_item: Item):
    """Test that EXIF data is properly stored in asset.exif_json."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        jpeg_path = create_test_jpeg_with_exif(temp_path)
        
        # Upload the JPEG
        with open(jpeg_path, "rb") as f:
            response = client.post(
                f"/api/items/{sample_item.id}/assets",
                files={"file": ("test_with_exif.jpg", f, "image/jpeg")}
            )
        
        assert response.status_code == 201
        asset_data = response.json()
        
        # Check that EXIF data is stored in the asset
        assert "exif_json" in asset_data
        exif_data = asset_data["exif_json"]
        
        assert exif_data["date"] == "2023-12-25"
        assert exif_data["gps"] is not None
        assert "lat" in exif_data["gps"]
        assert "lon" in exif_data["gps"]
        assert exif_data["raw"] is not None
        assert len(exif_data["raw"]) > 0

