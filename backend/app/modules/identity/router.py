import logging

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.email import send_password_reset_email
from app.modules.identity.dependencies import get_current_user
from app.modules.identity.models import User
from app.modules.identity.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    RegistrationResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    TokenResponse,
    UserLogin,
    UserRead,
    UserRegister,
    UserUpdate,
)
from app.modules.identity.security import create_access_token
from app.modules.identity.service import (
    authenticate_user,
    create_user_password_reset_token,
    register_user,
    reset_user_password,
    update_user_profile,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=RegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: UserRegister,
    db: Session = Depends(get_db),
) -> RegistrationResponse:
    try:
        user, workspace, membership = register_user(
            db,
            data,
        )
    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return RegistrationResponse(
        user=user,
        workspace=workspace,
        membership=membership,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    data: UserLogin,
    db: Session = Depends(get_db),
) -> TokenResponse:
    user = authenticate_user(
        db,
        data.email,
        data.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    access_token = create_access_token(
        subject=str(user.id),
    )

    return TokenResponse(
        access_token=access_token,
    )


@router.get(
    "/me",
    response_model=UserRead,
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


@router.patch(
    "/me",
    response_model=UserRead,
)
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    try:
        return update_user_profile(
            db,
            current_user,
            data,
        )
    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    token = create_user_password_reset_token(
        db,
        data.email,
    )

    if token is not None:
        try:
            send_password_reset_email(
                recipient_email=data.email,
                reset_token=token,
            )
        except Exception:
            logger.exception(
                "Unable to send password reset email"
            )

    return ForgotPasswordResponse(
        message=(
            "If an account exists for that email, "
            "a password reset link has been sent."
        )
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> ResetPasswordResponse:
    try:
        reset_user_password(
            db,
            data.token,
            data.new_password,
        )
    except ValueError as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return ResetPasswordResponse(
        message="Password has been reset successfully."
    )