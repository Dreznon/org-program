import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db, create_fts_tables
from .routers import items as items_router
from .routers import assets as assets_router
from .routers import export as export_router


def create_app() -> FastAPI:
    app = FastAPI(title="Org Program API", openapi_url="/openapi.json")

    origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize DB and FTS tables
    init_db()
    create_fts_tables()

    # Routes
    from fastapi import APIRouter

    api = APIRouter(prefix="/api")
    api.include_router(items_router.router)
    api.include_router(assets_router.router)
    api.include_router(export_router.router)
    app.include_router(api)

    @app.get("/")
    def health():
        return {"status": "ok"}

    return app


app = create_app()
