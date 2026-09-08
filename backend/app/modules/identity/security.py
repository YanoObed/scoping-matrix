import hashlib

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings


password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
) -> str:
    now = datetime.now(timezone.utc)

    expires_at = now + (
        expires_delta
        if expires_delta is not None
        else timedelta(
            minutes=settings.access_token_expire_minutes
        )
    )

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expires_at,
        "type": "access",
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except InvalidTokenError as exc:
        raise ValueError(
            "Invalid or expired access token"
        ) from exc

    if payload.get("type") not in (
        None,
        "access",
    ):
        raise ValueError(
            "Invalid access token"
        )

    return payload


def password_hash_fingerprint(
    hashed_password: str,
) -> str:
    return hashlib.sha256(
        hashed_password.encode("utf-8")
    ).hexdigest()


def create_password_reset_token(
    subject: str,
    hashed_password: str,
) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=30)

    payload: dict[str, Any] = {
        "sub": subject,
        "iat": now,
        "exp": expires_at,
        "type": "password_reset",
        "pwd": password_hash_fingerprint(
            hashed_password
        ),
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_password_reset_token(
    token: str,
) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except InvalidTokenError as exc:
        raise ValueError(
            "Invalid or expired password reset token"
        ) from exc

    if payload.get("type") != "password_reset":
        raise ValueError(
            "Invalid password reset token"
        )

    return payload