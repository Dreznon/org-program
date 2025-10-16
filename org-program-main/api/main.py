import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from .db import init_db, create_fts_tables
from .routers import items as items_router
from .routers import assets as assets_router
from .routers import export as export_router
from .db import get_upload_dir


def create_app() -> FastAPI:
    app = FastAPI(title="Org Program API", openapi_url="/openapi.json")

    # CORS middleware for frontend development
    origins = [
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ]
    
    # Add any additional origins from environment
    env_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
    origins.extend([origin.strip() for origin in env_origins if origin.strip()])
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Temporarily allow all origins for debugging
        allow_credentials=False,  # Disable credentials for debugging
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Serve uploaded files for development convenience
    try:
        upload_dir = get_upload_dir()
        app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")
        print(f"[DEBUG][main] Mounted /uploads static dir: {upload_dir}")
    except Exception as e:
        print(f"[DEBUG][main] Failed to mount /uploads: {e}")

    # Initialize DB and FTS tables
    init_db()
    create_fts_tables()

    # API Routes
    from fastapi import APIRouter

    api = APIRouter(prefix="/api")
    api.include_router(items_router.router)
    api.include_router(assets_router.router)
    api.include_router(export_router.router)
    app.include_router(api)

    # Security headers middleware - temporarily disabled for debugging
    # @app.middleware("http")
    # async def add_security_headers(request, call_next):
    #     response = await call_next(request)
    #     # Align with frontend CSP while allowing Google Fonts
    #     csp = "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    #     response.headers['Content-Security-Policy'] = csp
    #     response.headers['X-Content-Type-Options'] = 'nosniff'
    #     return response

    # Health check endpoint
    @app.get("/")
    def health():
        return {"status": "ok"}

    @app.get("/health")
    def health_check():
        return {"status": "ok", "message": "Organization App API is running"}

    return app


app = create_app()