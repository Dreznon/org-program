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
    # Debug: starting EXIF extraction
    print(f"[DEBUG][exif.extract_exif] Start extraction for: {file_path}")

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
            exif_dict = image.getexif()
            
            if exif_dict is None:
                return result
                
            # Convert EXIF tags to readable format
            exif_data = {}
            for tag_id, value in exif_dict.items():
                tag = TAGS.get(tag_id, tag_id)
                exif_data[tag] = value
                
            # Sanitize raw EXIF to be JSON-safe before storing
            result["raw"] = _to_json_safe(exif_data)
            
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
        print(f"[DEBUG][exif.extract_exif] EXIF extraction failed for {file_path}: {e}")
        
    # Final debug log with a brief summary of sanitized keys
    try:
        raw_keys_preview = list(result.get("raw", {}).keys())[:10]
        print(f"[DEBUG][exif.extract_exif] Done for: {file_path} | date={result['date']} gps={result['gps']} raw_keys={raw_keys_preview}")
    except Exception:
        pass

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
    """Convert DMS (Degrees, Minutes, Seconds) to decimal degrees, handling rationals."""
    try:
        # Normalize tuple fractions (num, den) to floats
        def to_float(x): 
            return x[0] / x[1] if isinstance(x, tuple) else float(x)

        d, m, s = map(to_float, dms_data)

        # Sometimes ref is bytes, not str
        if isinstance(ref, bytes):
            ref = ref.decode(errors="ignore")

        decimal = d + (m / 60.0) + (s / 3600.0)
        if ref in ['S', 'W']:
            decimal = -decimal
        return decimal
    except Exception:
        return None


def _to_json_safe(value: Any) -> Any:
    """Recursively convert EXIF structures to JSON-serializable values.

    This handles types commonly returned by PIL/piexif such as IFDRational, bytes,
    tuples of rationals, sets, etc. The goal is to preserve as much information as
    reasonably possible while ensuring the structure can be serialized to JSON.
    """
    # Handle None and primitives quickly
    if value is None or isinstance(value, (bool, int, float, str)):
        return value

    # piexif IFDRational and similar: has numerator/denominator
    if hasattr(value, "numerator") and hasattr(value, "denominator"):
        try:
            denom = value.denominator
            num = value.numerator
            if denom == 0:
                return float("nan")
            return float(num) / float(denom)
        except Exception:
            # Fallback to string representation
            return str(value)

    # bytes: attempt to decode as utf-8, fallback to latin-1; never raise
    if isinstance(value, (bytes, bytearray)):
        try:
            return value.decode("utf-8", errors="replace")
        except Exception:
            try:
                return value.decode("latin-1", errors="replace")
            except Exception:
                return str(value)

    # tuple/list: sanitize each element
    if isinstance(value, (list, tuple)):
        return [_to_json_safe(v) for v in value]

    # dict: sanitize keys (to str) and values
    if isinstance(value, dict):
        safe_dict: Dict[str, Any] = {}
        for k, v in value.items():
            # EXIF keys may be ints; convert all keys to strings for JSON
            key_str = str(k)
            safe_dict[key_str] = _to_json_safe(v)
        return safe_dict

    # set and other iterables: convert to list
    if isinstance(value, (set, frozenset)):
        return [_to_json_safe(v) for v in value]

    # Fallback: string representation as a last resort
    return str(value)


# Legacy function for backward compatibility
def extract_exif_stub(file_path: str) -> Dict[str, Any]:
    """Legacy stub function - now calls the real implementation."""
    return extract_exif(file_path)
