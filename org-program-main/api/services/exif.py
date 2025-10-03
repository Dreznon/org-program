import os
from datetime import datetime
from typing import Any, Dict, Optional

from PIL import Image
from PIL.ExifTags import TAGS
import piexif


def extract_exif(file_path: str) -> Dict[str, Any]:
    """
    Extract EXIF data from image file.
    
    Returns:
        dict with keys:
        - "date": "YYYY-MM-DD" or None
        - "gps": {"lat": float, "lon": float} or None  
        - "raw": dict of all EXIF data
    """
    result = {
        "date": None,
        "gps": None,
        "raw": {}
    }
    
    try:
        # Check if file exists and is readable
        if not os.path.exists(file_path):
            return result
            
        # Open image and extract EXIF
        with Image.open(file_path) as image:
            exif_dict = image._getexif()
            
            if exif_dict is None:
                return result
                
            # Convert EXIF tags to readable format
            exif_data = {}
            for tag_id, value in exif_dict.items():
                tag = TAGS.get(tag_id, tag_id)
                exif_data[tag] = value
                
            result["raw"] = exif_data
            
            # Extract date
            date_str = _extract_date_from_exif(exif_data)
            if date_str:
                result["date"] = date_str
                
            # Extract GPS coordinates
            gps_data = _extract_gps_from_exif(exif_data)
            if gps_data:
                result["gps"] = gps_data
                
    except Exception as e:
        # Log error but don't fail the upload
        print(f"EXIF extraction failed for {file_path}: {e}")
        
    return result


def _extract_date_from_exif(exif_data: Dict[str, Any]) -> Optional[str]:
    """Extract date from EXIF data and normalize to YYYY-MM-DD format."""
    
    # Try DateTimeOriginal first, then CreateDate
    date_fields = ["DateTimeOriginal", "CreateDate", "DateTime"]
    
    for field in date_fields:
        if field in exif_data:
            date_str = exif_data[field]
            if isinstance(date_str, str):
                try:
                    # Parse EXIF date format (YYYY:MM:DD HH:MM:SS)
                    dt = datetime.strptime(date_str, "%Y:%m:%d %H:%M:%S")
                    return dt.strftime("%Y-%m-%d")
                except ValueError:
                    continue
                    
    return None


def _extract_gps_from_exif(exif_data: Dict[str, Any]) -> Optional[Dict[str, float]]:
    """Extract GPS coordinates from EXIF data."""
    
    gps_info = exif_data.get("GPSInfo")
    if not gps_info:
        return None
        
    try:
        # Extract latitude
        lat_ref = gps_info.get(1)  # GPSLatitudeRef
        lat_data = gps_info.get(2)  # GPSLatitude
        
        # Extract longitude  
        lon_ref = gps_info.get(3)  # GPSLongitudeRef
        lon_data = gps_info.get(4)  # GPSLongitude
        
        if not all([lat_ref, lat_data, lon_ref, lon_data]):
            return None
            
        # Convert DMS to decimal degrees
        lat_decimal = _dms_to_decimal(lat_data, lat_ref)
        lon_decimal = _dms_to_decimal(lon_data, lon_ref)
        
        if lat_decimal is None or lon_decimal is None:
            return None
            
        return {
            "lat": lat_decimal,
            "lon": lon_decimal
        }
        
    except Exception:
        return None


def _dms_to_decimal(dms_data: tuple, ref: str) -> Optional[float]:
    """Convert DMS (Degrees, Minutes, Seconds) to decimal degrees."""
    try:
        degrees, minutes, seconds = dms_data
        
        # Convert to decimal
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        
        # Apply reference (S/W are negative)
        if ref in ['S', 'W']:
            decimal = -decimal
            
        return decimal
        
    except Exception:
        return None


# Legacy function for backward compatibility
def extract_exif_stub(file_path: str) -> Dict[str, Any]:
    """Legacy stub function - now calls the real implementation."""
    return extract_exif(file_path)
