from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.crm.models.activity import ActivityType
from app.modules.crm.models.deal import DealStage


class CompanyCreate(BaseModel):
    owner_membership_id: UUID | None = None

    name: str = Field(
        min_length=1,
        max_length=255,
    )

    domain: str | None = Field(
        default=None,
        max_length=255,
    )

    website: str | None = Field(
        default=None,
        max_length=500,
    )

    phone: str | None = Field(
        default=None,
        max_length=50,
    )

    industry: str | None = Field(
        default=None,
        max_length=150,
    )

    employee_count: int | None = Field(
        default=None,
        ge=0,
    )

    annual_revenue: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=18,
        decimal_places=2,
    )

    description: str | None = None

    address_line1: str | None = Field(
        default=None,
        max_length=255,
    )

    address_line2: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    state_region: str | None = Field(
        default=None,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        max_length=30,
    )

    country: str | None = Field(
        default=None,
        max_length=100,
    )


class CompanyUpdate(BaseModel):
    owner_membership_id: UUID | None = None

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    domain: str | None = Field(
        default=None,
        max_length=255,
    )

    website: str | None = Field(
        default=None,
        max_length=500,
    )

    phone: str | None = Field(
        default=None,
        max_length=50,
    )

    industry: str | None = Field(
        default=None,
        max_length=150,
    )

    employee_count: int | None = Field(
        default=None,
        ge=0,
    )

    annual_revenue: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=18,
        decimal_places=2,
    )

    description: str | None = None

    address_line1: str | None = Field(
        default=None,
        max_length=255,
    )

    address_line2: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    state_region: str | None = Field(
        default=None,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        max_length=30,
    )

    country: str | None = Field(
        default=None,
        max_length=100,
    )


class CompanyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workspace_id: UUID
    owner_membership_id: UUID | None

    name: str
    domain: str | None
    website: str | None
    phone: str | None
    industry: str | None
    employee_count: int | None
    annual_revenue: Decimal | None
    description: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state_region: str | None
    postal_code: str | None
    country: str | None
    created_at: datetime
    updated_at: datetime


class ContactCreate(BaseModel):
    company_id: UUID | None = None
    owner_membership_id: UUID | None = None

    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    email: str | None = Field(
        default=None,
        max_length=320,
    )

    phone: str | None = Field(
        default=None,
        max_length=50,
    )

    mobile_phone: str | None = Field(
        default=None,
        max_length=50,
    )

    job_title: str | None = Field(
        default=None,
        max_length=150,
    )

    department: str | None = Field(
        default=None,
        max_length=150,
    )

    linkedin_url: str | None = Field(
        default=None,
        max_length=500,
    )

    description: str | None = None

    address_line1: str | None = Field(
        default=None,
        max_length=255,
    )

    address_line2: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    state_region: str | None = Field(
        default=None,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        max_length=30,
    )

    country: str | None = Field(
        default=None,
        max_length=100,
    )


class ContactUpdate(BaseModel):
    company_id: UUID | None = None
    owner_membership_id: UUID | None = None

    first_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    last_name: str | None = Field(
        default=None,
        max_length=100,
    )

    email: str | None = Field(
        default=None,
        max_length=320,
    )

    phone: str | None = Field(
        default=None,
        max_length=50,
    )

    mobile_phone: str | None = Field(
        default=None,
        max_length=50,
    )

    job_title: str | None = Field(
        default=None,
        max_length=150,
    )

    department: str | None = Field(
        default=None,
        max_length=150,
    )

    linkedin_url: str | None = Field(
        default=None,
        max_length=500,
    )

    description: str | None = None

    address_line1: str | None = Field(
        default=None,
        max_length=255,
    )

    address_line2: str | None = Field(
        default=None,
        max_length=255,
    )

    city: str | None = Field(
        default=None,
        max_length=100,
    )

    state_region: str | None = Field(
        default=None,
        max_length=100,
    )

    postal_code: str | None = Field(
        default=None,
        max_length=30,
    )

    country: str | None = Field(
        default=None,
        max_length=100,
    )


class ContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workspace_id: UUID
    company_id: UUID | None
    owner_membership_id: UUID | None

    first_name: str
    last_name: str | None
    email: str | None
    phone: str | None
    mobile_phone: str | None
    job_title: str | None
    department: str | None
    linkedin_url: str | None
    description: str | None
    address_line1: str | None
    address_line2: str | None
    city: str | None
    state_region: str | None
    postal_code: str | None
    country: str | None
    created_at: datetime
    updated_at: datetime


class DealCreate(BaseModel):
    company_id: UUID | None = None
    contact_id: UUID | None = None
    owner_membership_id: UUID | None = None

    name: str = Field(
        min_length=1,
        max_length=255,
    )

    amount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=18,
        decimal_places=2,
    )

    stage: DealStage = DealStage.LEAD

    probability: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    expected_close_date: date | None = None
    description: str | None = None


class DealUpdate(BaseModel):
    company_id: UUID | None = None
    contact_id: UUID | None = None
    owner_membership_id: UUID | None = None

    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    amount: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=18,
        decimal_places=2,
    )

    stage: DealStage | None = None

    probability: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    expected_close_date: date | None = None
    description: str | None = None


class DealRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workspace_id: UUID
    company_id: UUID | None
    contact_id: UUID | None
    owner_membership_id: UUID | None

    name: str
    amount: Decimal | None
    stage: DealStage
    probability: int | None
    expected_close_date: date | None
    description: str | None
    created_at: datetime
    updated_at: datetime


class DealSummaryRead(BaseModel):
    open_deals: int
    open_value: Decimal
    won_deals: int
    won_value: Decimal
    lost_deals: int
    lost_value: Decimal


class DealStageHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    deal_id: UUID
    from_stage: DealStage
    to_stage: DealStage
    changed_by_membership_id: UUID
    created_at: datetime


class ActivityCreate(BaseModel):
    company_id: UUID | None = None
    contact_id: UUID | None = None
    deal_id: UUID | None = None
    owner_membership_id: UUID | None = None

    type: ActivityType

    subject: str = Field(
        min_length=1,
        max_length=255,
    )

    description: str | None = None
    due_at: datetime | None = None
    completed_at: datetime | None = None


class ActivityUpdate(BaseModel):
    company_id: UUID | None = None
    contact_id: UUID | None = None
    deal_id: UUID | None = None
    owner_membership_id: UUID | None = None

    type: ActivityType | None = None

    subject: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = None
    due_at: datetime | None = None
    completed_at: datetime | None = None


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    workspace_id: UUID
    company_id: UUID | None
    contact_id: UUID | None
    deal_id: UUID | None
    owner_membership_id: UUID | None

    type: ActivityType
    subject: str
    description: str | None
    due_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class DashboardRead(BaseModel):
    companies: int
    contacts: int
    deals: int
    pipeline_value: Decimal
    activities: int
    overdue_activities: int