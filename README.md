## Org Program API (FastAPI + SQLModel)

Small, clean backend for storing items, accepting file uploads, basic keyword search (FTS5), and exporting Dublin Core (Simple) XML.

### Features
- Items CRUD with array fields
- File uploads stored under `./uploads/<item_uuid>/<original_filename>`
- SHA256 checksums for uploads
- SQLite + SQLModel with FTS5 keyword search (title, description, OCR text)
- Dublin Core (Simple) XML export
- CORS enabled for development

### Requirements
- Python 3.11+

### Setup
1) Create and activate a virtual environment

Windows (PowerShell):
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS/Linux (bash/zsh):
```bash
python3 -m venv .venv
source ./.venv/bin/activate
pip install -r requirements.txt
```

2) Run the server
```bash
uvicorn api.main:app --reload
```

3) Open API docs
`http://localhost:8000/docs`

### Environment
Optional `.env` (copy from `.env.example`), defaults are sensible for SQLite.

### Smoke Tests (copy/paste)

Create an item
```bash
curl -X POST http://localhost:8000/api/items \
 -H "Content-Type: application/json" \
 -d '{"title":"Sample Vase","description":"Blue ceramic","date":"2023-01-05","type":"Image","format":"image/jpeg","coverage":"Detroit, MI","rights":"CC BY 4.0","creators":["Jane Doe"],"subjects":["Ceramics"],"identifiers":["INV-001"]}'
```

List items
```bash
curl "http://localhost:8000/api/items?q=ceramic"
```

Upload an asset (replace {ID} with returned item id)
```bash
curl -X POST "http://localhost:8000/api/items/{ID}/assets" \
  -F "file=@/absolute/path/to/example.jpg"
```

Export Dublin Core (replace {ID})
```bash
curl "http://localhost:8000/api/export/dc?ids={ID}"
```

### Running tests
```bash
pytest -q
```

### Notes
- Arrays are stored as JSON columns for simplicity.
- OCR/EXIF extractors are stubs that return empty results for now.
- FTS is maintained programmatically when items/assets change.
