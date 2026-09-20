from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.core.config import settings
from app.modules.crm.router import router as crm_router
from app.modules.identity.router import router as identity_router
from app.modules.identity.workspace_router import router as workspace_router


app = FastAPI(
    title="Scoping Matrix API",
    version=settings.app_version,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health_router)
app.include_router(identity_router)
app.include_router(workspace_router)
app.include_router(crm_router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Scoping Matrix API",
        "version": settings.app_version,
        "status": "running",
    }