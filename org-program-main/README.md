# Backend - Organization App API

A FastAPI backend for the Organization App with SQLite database and file upload capabilities.

## Quick Start (Windows)

- Double-click **start_dev.bat** (beginners)
- Or run **start_dev.ps1** (PowerShell users)

This starts:
- FastAPI backend → http://127.0.0.1:8000
- Vite frontend → open the URL printed by Vite (usually http://localhost:5174)

## Manual Setup

### Prerequisites
- Python 3.8+
- pip

### Dependencies

The application requires the following Python packages:
- **FastAPI** - Web framework
- **SQLModel** - Database ORM
- **Pillow** - Image processing and EXIF extraction
- **piexif** - EXIF data manipulation
- **uvicorn** - ASGI server
- **python-multipart** - File upload support
- **lxml** - XML processing
- **pytest** - Testing framework

### Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start development server:**
   ```bash
   # Windows (PowerShell)
   python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
   
   # Linux/Mac
   uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. **Verify server is running:**
   ```bash
   curl http://localhost:8000/health
   ```
   
   Should return: `{"status":"ok"}`

4. **View API documentation:**
   - Open `http://localhost:8000/docs` in your browser
   - Interactive API documentation with Swagger UI

### API Endpoints

#### Health Check
- `GET /health` - Returns server status

#### Items Management
- `GET /api/items` - List all items (with optional search query `?q=term`)
- `GET /api/items/{id}` - Get specific item
- `POST /api/items` - Create new item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

#### Assets Management
- `POST /api/items/{id}/assets` - Upload file for item
- `GET /api/items/{id}/assets` - List assets for item

### Database

The app uses SQLite database (`org.db`) with the following features:
- **Items table**: Stores metadata about items
- **Assets table**: Stores file uploads and metadata
- **FTS (Full-Text Search)**: Enables search across item content
- **Automatic migrations**: Database schema is created automatically on first run

### CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174` (Vite alternative port)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`
- `http://localhost:3000` (React default)
- `http://127.0.0.1:3000`

### File Uploads

- Files are stored in the `uploads/` directory
- Each item gets its own subdirectory
- Supported file types: images, documents, etc.
- **EXIF auto-population**: JPEG images with EXIF data automatically populate:
  - `title` ← filename (without extension)
  - `format` ← MIME type
  - `date` ← EXIF DateTimeOriginal/CreateDate (if present)
  - `coverage` ← GPS coordinates as "lat,lon" (if present)
- OCR processing available for images
- File metadata is extracted and stored

### Development

- **Hot reload**: Server restarts automatically on code changes
- **Structured logging**: API calls are logged with details
- **Error handling**: Proper HTTP status codes and error messages
- **Type safety**: Pydantic models for request/response validation

### Project Structure

```
api/
├── main.py              # FastAPI app and CORS configuration
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic request/response models
├── db.py                # Database connection and setup
├── deps.py              # Dependency injection
├── routers/
│   ├── items.py         # Items CRUD endpoints
│   ├── assets.py        # File upload endpoints
│   └── export.py        # Data export endpoints
└── services/
    ├── ocr.py           # OCR processing
    ├── exif.py          # Image metadata extraction
    └── dc_xml.py        # Dublin Core XML processing
```

### Troubleshooting

**Server won't start:**
- Check if port 8000 is available
- Verify Python version compatibility
- Check for missing dependencies

**Database issues:**
- Delete `org.db` to reset database
- Check file permissions in project directory

**CORS errors:**
- Verify frontend URL is in allowed origins
- Check that frontend is using correct port

**File upload issues:**
- Check `uploads/` directory permissions
- Verify file size limits
- Check available disk space