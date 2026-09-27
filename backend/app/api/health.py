from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from redis.asyncio import Redis
from redis.exceptions import RedisError
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db


router = APIRouter(
    prefix="/health",
    tags=["health"],
)


@router.get("")
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
    }


@router.get("/redis")
async def redis_health_check(
    request: Request,
) -> dict[str, str]:
    redis_client: Redis = request.app.state.redis

    try:
        await redis_client.ping()
        return {
            "status": "healthy",
            "redis": "connected",
        }
    except RedisError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis unavailable",
        ) from exc


@router.get("/database")
def database_health_check(
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc