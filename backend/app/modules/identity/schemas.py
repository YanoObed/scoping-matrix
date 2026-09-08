from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.modules.identity.models.workspace_membership import WorkspaceRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )
    first_name: str | None = Field(
        default=None,
        max_length=100,
    )
    last_name: str | None = Field(
        default=None,
        max_length=100,
    )
    workspace_name: str = Field(
        min_length=2,
        max_length=150,
    )
    phone: str | None = Field(
        default=None,
        max_length=50,
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    email: EmailStr
    first_name: str | None
    last_name: str | None
    phone: str | None
    is_active: bool
    is_superuser: bool


class UserUpdate(BaseModel):
    email: EmailStr | None = None

    first_name: str | None = Field(
        default=None,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    phone: str | None = Field(
        default=None,
        max_length=50,
    )


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    token: str

    new_password: str = Field(
        min_length=8,
        max_length=128,
    )

class ResetPasswordResponse(BaseModel):
    message: str


class WorkspaceRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    name: str
    slug: str


class MembershipRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

    id: UUID
    user_id: UUID
    workspace_id: UUID
    role: WorkspaceRole

class UserWorkspaceRead(BaseModel):
    membership_id: UUID
    workspace_id: UUID
    workspace_name: str
    workspace_slug: str
    role: WorkspaceRole
    
class WorkspaceMemberRead(BaseModel):
    id: UUID
    user_id: UUID
    workspace_id: UUID
    role: WorkspaceRole
    email: EmailStr
    first_name: str | None
    last_name: str | None
    phone: str | None


class WorkspaceMemberCreate(BaseModel):
    email: EmailStr
    role: WorkspaceRole = WorkspaceRole.MEMBER


class WorkspaceMemberUpdate(BaseModel):
    role: WorkspaceRole


class RegistrationResponse(BaseModel):
    user: UserRead
    workspace: WorkspaceRead
    membership: MembershipRead


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"