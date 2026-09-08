from uuid import UUID

from sqlalchemy import func, or_, select, update
from sqlalchemy.orm import Session

from app.modules.crm.models import (
    Activity,
    Company,
    Contact,
    Deal,
    DealStageHistory,
)
from app.modules.crm.models.deal import DealStage
from app.modules.crm.models.activity import ActivityType
from app.modules.crm.schemas import (
    ActivityCreate,
    ActivityUpdate,
    CompanyCreate,
    CompanyUpdate,
    ContactCreate,
    ContactUpdate,
    DealCreate,
    DealUpdate,
)
from app.modules.identity.models import WorkspaceMembership


def normalize_company_name(name: str) -> str:
    return " ".join(name.strip().lower().split())


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_domain(domain: str) -> str:
    value = domain.strip().lower()

    if value.startswith("https://"):
        value = value[8:]
    elif value.startswith("http://"):
        value = value[7:]

    if value.startswith("www."):
        value = value[4:]

    return value.rstrip("/")


def is_workspace_manager(
    membership: WorkspaceMembership,
) -> bool:
    role = getattr(
        membership.role,
        "value",
        membership.role,
    )

    return role in {
        "owner",
        "admin",
    }


def visibility_conditions(
    model,
    membership: WorkspaceMembership,
) -> list:
    conditions = [
        model.workspace_id == membership.workspace_id,
    ]

    if not is_workspace_manager(membership):
        conditions.append(
            model.owner_membership_id == membership.id
        )

    return conditions


def ensure_record_access(
    record,
    membership: WorkspaceMembership,
) -> None:
    if record.workspace_id != membership.workspace_id:
        raise PermissionError(
            "CRM record is not accessible"
        )

    if (
        not is_workspace_manager(membership)
        and record.owner_membership_id != membership.id
    ):
        raise PermissionError(
            "CRM record is not accessible"
        )


def resolve_create_owner_membership_id(
    db: Session,
    membership: WorkspaceMembership,
    owner_membership_id: UUID | None,
) -> UUID | None:
    if not is_workspace_manager(membership):
        return membership.id

    validate_owner_membership(
        db,
        membership.workspace_id,
        owner_membership_id,
    )

    return owner_membership_id


def ensure_owner_change_allowed(
    membership: WorkspaceMembership,
) -> None:
    if not is_workspace_manager(membership):
        raise PermissionError(
            "Only workspace owners and admins can change record ownership"
        )


def get_workspace_membership(
    db: Session,
    workspace_id: UUID,
    membership_id: UUID,
) -> WorkspaceMembership | None:
    statement = select(WorkspaceMembership).where(
        WorkspaceMembership.id == membership_id,
        WorkspaceMembership.workspace_id == workspace_id,
    )

    return db.scalar(statement)


def validate_owner_membership(
    db: Session,
    workspace_id: UUID,
    owner_membership_id: UUID | None,
) -> None:
    if owner_membership_id is None:
        return

    membership = get_workspace_membership(
        db,
        workspace_id,
        owner_membership_id,
    )

    if membership is None:
        raise ValueError(
            "Owner membership does not exist in this workspace"
        )


def get_company(
    db: Session,
    membership: WorkspaceMembership,
    company_id: UUID,
) -> Company | None:
    statement = select(Company).where(
        Company.id == company_id,
        *visibility_conditions(
            Company,
            membership,
        ),
    )

    return db.scalar(statement)


def list_companies(
    db: Session,
    membership: WorkspaceMembership,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
    sort_by: str = "name",
    sort_order: str = "asc",
) -> list[Company]:
    conditions = visibility_conditions(
        Company,
        membership,
    )

    if search:
        search_value = search.strip()

        if search_value:
            normalized_search = normalize_company_name(
                search_value
            )
            normalized_domain_search = search_value.lower()

            conditions.append(
                or_(
                    Company.normalized_name.contains(
                        normalized_search,
                        autoescape=True,
                    ),
                    Company.domain.contains(
                        normalized_domain_search,
                        autoescape=True,
                    ),
                )
            )

    sort_columns = {
        "name": Company.name,
        "created_at": Company.created_at,
        "updated_at": Company.updated_at,
    }

    sort_column = sort_columns.get(
        sort_by,
        Company.name,
    )

    order_clause = (
        sort_column.desc()
        if sort_order == "desc"
        else sort_column.asc()
    )

    statement = (
        select(Company)
        .where(*conditions)
        .order_by(
            order_clause,
            Company.id.asc(),
        )
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def create_company(
    db: Session,
    membership: WorkspaceMembership,
    data: CompanyCreate,
) -> Company:
    owner_membership_id = resolve_create_owner_membership_id(
        db,
        membership,
        data.owner_membership_id,
    )

    name = data.name.strip()

    company = Company(
        workspace_id=membership.workspace_id,
        owner_membership_id=owner_membership_id,
        name=name,
        normalized_name=normalize_company_name(name),
        domain=(
            normalize_domain(data.domain)
            if data.domain is not None
            else None
        ),
        website=data.website.strip() if data.website else None,
        phone=data.phone.strip() if data.phone else None,
        industry=data.industry.strip() if data.industry else None,
        employee_count=data.employee_count,
        annual_revenue=data.annual_revenue,
        description=(
            data.description.strip()
            if data.description
            else None
        ),
        address_line1=(
            data.address_line1.strip()
            if data.address_line1
            else None
        ),
        address_line2=(
            data.address_line2.strip()
            if data.address_line2
            else None
        ),
        city=data.city.strip() if data.city else None,
        state_region=(
            data.state_region.strip()
            if data.state_region
            else None
        ),
        postal_code=(
            data.postal_code.strip()
            if data.postal_code
            else None
        ),
        country=data.country.strip() if data.country else None,
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    return company


def update_company(
    db: Session,
    membership: WorkspaceMembership,
    company: Company,
    data: CompanyUpdate,
) -> Company:
    ensure_record_access(
        company,
        membership,
    )

    changes = data.model_dump(
        exclude_unset=True,
    )

    if "stage" in changes:
        new_stage = changes["stage"]

        if (
            new_stage is not None
            and new_stage != deal.stage
        ):
            db.add(
                DealStageHistory(
                    workspace_id=membership.workspace_id,
                    deal_id=deal.id,
                    from_stage=deal.stage.value,
                    to_stage=new_stage.value,
                    changed_by_membership_id=membership.id,
                )
            )

    if "owner_membership_id" in changes:
        ensure_owner_change_allowed(membership)

        owner_membership_id = changes["owner_membership_id"]

        validate_owner_membership(
            db,
            membership.workspace_id,
            owner_membership_id,
        )

        company.owner_membership_id = owner_membership_id

    if "name" in changes:
        name = changes["name"]

        if name is not None:
            name = name.strip()
            company.name = name
            company.normalized_name = normalize_company_name(name)

    if "domain" in changes:
        domain = changes["domain"]
        company.domain = (
            normalize_domain(domain)
            if domain
            else None
        )

    simple_fields = (
        "website",
        "phone",
        "industry",
        "employee_count",
        "annual_revenue",
        "description",
        "address_line1",
        "address_line2",
        "city",
        "state_region",
        "postal_code",
        "country",
    )

    for field_name in simple_fields:
        if field_name not in changes:
            continue

        value = changes[field_name]

        if isinstance(value, str):
            value = value.strip() or None

        setattr(
            company,
            field_name,
            value,
        )

    db.commit()
    db.refresh(company)

    return company


def delete_company(
    db: Session,
    membership: WorkspaceMembership,
    company: Company,
) -> None:
    ensure_record_access(
        company,
        membership,
    )

    detach_contacts = (
        update(Contact)
        .where(
            Contact.workspace_id == company.workspace_id,
            Contact.company_id == company.id,
        )
        .values(
            company_id=None,
        )
    )

    db.execute(detach_contacts)
    db.delete(company)
    db.commit()


def get_contact(
    db: Session,
    membership: WorkspaceMembership,
    contact_id: UUID,
) -> Contact | None:
    statement = select(Contact).where(
        Contact.id == contact_id,
        *visibility_conditions(
            Contact,
            membership,
        ),
    )

    return db.scalar(statement)


def list_contacts(
    db: Session,
    membership: WorkspaceMembership,
    search: str | None = None,
    company_id: UUID | None = None,
    owner_membership_id: UUID | None = None,
    limit: int = 50,
    offset: int = 0,
    sort_by: str = "last_name",
    sort_order: str = "asc",
) -> list[Contact]:
    conditions = visibility_conditions(
        Contact,
        membership,
    )

    if search:
        search_value = search.strip()

        if search_value:
            conditions.append(
                or_(
                    Contact.first_name.icontains(
                        search_value,
                        autoescape=True,
                    ),
                    Contact.last_name.icontains(
                        search_value,
                        autoescape=True,
                    ),
                    Contact.email.icontains(
                        search_value,
                        autoescape=True,
                    ),
                )
            )

    if company_id is not None:
        conditions.append(
            Contact.company_id == company_id
        )

    if owner_membership_id is not None:
        conditions.append(
            Contact.owner_membership_id
            == owner_membership_id
        )

    sort_columns = {
        "first_name": Contact.first_name,
        "last_name": Contact.last_name,
        "created_at": Contact.created_at,
        "updated_at": Contact.updated_at,
    }

    sort_column = sort_columns.get(
        sort_by,
        Contact.last_name,
    )

    order_clause = (
        sort_column.desc()
        if sort_order == "desc"
        else sort_column.asc()
    )

    statement = (
        select(Contact)
        .where(*conditions)
        .order_by(
            order_clause.nulls_last(),
            Contact.id.asc(),
        )
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def get_contact_by_normalized_email(
    db: Session,
    workspace_id: UUID,
    normalized_email: str,
) -> Contact | None:
    statement = select(Contact).where(
        Contact.workspace_id == workspace_id,
        Contact.normalized_email == normalized_email,
    )

    return db.scalar(statement)


def create_contact(
    db: Session,
    membership: WorkspaceMembership,
    data: ContactCreate,
) -> Contact:
    owner_membership_id = resolve_create_owner_membership_id(
        db,
        membership,
        data.owner_membership_id,
    )

    if data.company_id is not None:
        company = get_company(
            db,
            membership,
            data.company_id,
        )

        if company is None:
            raise ValueError(
                "Company does not exist or is not accessible"
            )

    normalized_email = None

    if data.email:
        normalized_email = normalize_email(data.email)

        existing_contact = get_contact_by_normalized_email(
            db,
            membership.workspace_id,
            normalized_email,
        )

        if existing_contact is not None:
            raise ValueError(
                "A contact with this email already exists in this workspace"
            )

    contact = Contact(
        workspace_id=membership.workspace_id,
        company_id=data.company_id,
        owner_membership_id=owner_membership_id,
        first_name=data.first_name.strip(),
        last_name=(
            data.last_name.strip()
            if data.last_name
            else None
        ),
        email=(
            data.email.strip()
            if data.email
            else None
        ),
        normalized_email=normalized_email,
        phone=data.phone.strip() if data.phone else None,
        mobile_phone=(
            data.mobile_phone.strip()
            if data.mobile_phone
            else None
        ),
        job_title=(
            data.job_title.strip()
            if data.job_title
            else None
        ),
        department=(
            data.department.strip()
            if data.department
            else None
        ),
        linkedin_url=(
            data.linkedin_url.strip()
            if data.linkedin_url
            else None
        ),
        description=(
            data.description.strip()
            if data.description
            else None
        ),
        address_line1=(
            data.address_line1.strip()
            if data.address_line1
            else None
        ),
        address_line2=(
            data.address_line2.strip()
            if data.address_line2
            else None
        ),
        city=data.city.strip() if data.city else None,
        state_region=(
            data.state_region.strip()
            if data.state_region
            else None
        ),
        postal_code=(
            data.postal_code.strip()
            if data.postal_code
            else None
        ),
        country=data.country.strip() if data.country else None,
    )

    db.add(contact)
    db.commit()
    db.refresh(contact)

    return contact


def update_contact(
    db: Session,
    membership: WorkspaceMembership,
    contact: Contact,
    data: ContactUpdate,
) -> Contact:
    ensure_record_access(
        contact,
        membership,
    )

    changes = data.model_dump(
        exclude_unset=True,
    )

    if "owner_membership_id" in changes:
        ensure_owner_change_allowed(membership)

        owner_membership_id = changes["owner_membership_id"]

        validate_owner_membership(
            db,
            membership.workspace_id,
            owner_membership_id,
        )

        contact.owner_membership_id = owner_membership_id

    if "company_id" in changes:
        company_id = changes["company_id"]

        if company_id is not None:
            company = get_company(
                db,
                membership,
                company_id,
            )

            if company is None:
                raise ValueError(
                    "Company does not exist or is not accessible"
                )

        contact.company_id = company_id

    if "email" in changes:
        email = changes["email"]

        if email:
            normalized_email = normalize_email(email)

            existing_contact = get_contact_by_normalized_email(
                db,
                membership.workspace_id,
                normalized_email,
            )

            if (
                existing_contact is not None
                and existing_contact.id != contact.id
            ):
                raise ValueError(
                    "A contact with this email already exists in this workspace"
                )

            contact.email = email.strip()
            contact.normalized_email = normalized_email

        else:
            contact.email = None
            contact.normalized_email = None

    simple_fields = (
        "first_name",
        "last_name",
        "phone",
        "mobile_phone",
        "job_title",
        "department",
        "linkedin_url",
        "description",
        "address_line1",
        "address_line2",
        "city",
        "state_region",
        "postal_code",
        "country",
    )

    for field_name in simple_fields:
        if field_name not in changes:
            continue

        value = changes[field_name]

        if isinstance(value, str):
            value = value.strip() or None

        setattr(
            contact,
            field_name,
            value,
        )

    db.commit()
    db.refresh(contact)

    return contact


def delete_contact(
    db: Session,
    membership: WorkspaceMembership,
    contact: Contact,
) -> None:
    ensure_record_access(
        contact,
        membership,
    )

    db.delete(contact)
    db.commit()


def get_deal(
    db: Session,
    membership: WorkspaceMembership,
    deal_id: UUID,
) -> Deal | None:
    statement = select(Deal).where(
        Deal.id == deal_id,
        *visibility_conditions(
            Deal,
            membership,
        ),
    )

    return db.scalar(statement)

def list_deal_stage_history(
    db: Session,
    membership: WorkspaceMembership,
    deal_id: UUID,
) -> list[DealStageHistory]:
    deal = get_deal(
        db,
        membership,
        deal_id,
    )

    if deal is None:
        return []

    statement = (
        select(DealStageHistory)
        .where(
            DealStageHistory.workspace_id
            == membership.workspace_id,
            DealStageHistory.deal_id == deal_id,
        )
        .order_by(
            DealStageHistory.created_at.desc(),
            DealStageHistory.id.desc(),
        )
    )

    return list(db.scalars(statement).all())

def list_deals(
    db: Session,
    membership: WorkspaceMembership,
    search: str | None = None,
    stage: DealStage | None = None,
    company_id: UUID | None = None,
    contact_id: UUID | None = None,
    owner_membership_id: UUID | None = None,
    limit: int = 50,
    offset: int = 0,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> list[Deal]:
    conditions = visibility_conditions(
        Deal,
        membership,
    )

    if search:
        search_value = search.strip()

        if search_value:
            conditions.append(
                Deal.name.icontains(
                    search_value,
                    autoescape=True,
                )
            )

    if stage is not None:
        conditions.append(
            Deal.stage == stage
        )

    if company_id is not None:
        conditions.append(
            Deal.company_id == company_id
        )

    if contact_id is not None:
        conditions.append(
            Deal.contact_id == contact_id
        )

    if owner_membership_id is not None:
        conditions.append(
            Deal.owner_membership_id
            == owner_membership_id
        )

    sort_columns = {
        "name": Deal.name,
        "amount": Deal.amount,
        "expected_close_date": Deal.expected_close_date,
        "created_at": Deal.created_at,
        "updated_at": Deal.updated_at,
    }

    sort_column = sort_columns.get(
        sort_by,
        Deal.created_at,
    )

    order_clause = (
        sort_column.desc()
        if sort_order == "desc"
        else sort_column.asc()
    )

    statement = (
        select(Deal)
        .where(*conditions)
        .order_by(
            order_clause.nulls_last(),
            Deal.id.asc(),
        )
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def create_deal(
    db: Session,
    membership: WorkspaceMembership,
    data: DealCreate,
) -> Deal:
    owner_membership_id = resolve_create_owner_membership_id(
        db,
        membership,
        data.owner_membership_id,
    )

    if data.company_id is not None:
        company = get_company(
            db,
            membership,
            data.company_id,
        )

        if company is None:
            raise ValueError(
                "Company does not exist or is not accessible"
            )

    if data.contact_id is not None:
        contact = get_contact(
            db,
            membership,
            data.contact_id,
        )

        if contact is None:
            raise ValueError(
                "Contact does not exist or is not accessible"
            )

    deal = Deal(
        workspace_id=membership.workspace_id,
        company_id=data.company_id,
        contact_id=data.contact_id,
        owner_membership_id=owner_membership_id,
        name=data.name.strip(),
        amount=data.amount,
        stage=data.stage,
        probability=data.probability,
        expected_close_date=data.expected_close_date,
        description=(
            data.description.strip()
            if data.description
            else None
        ),
    )

    db.add(deal)
    db.commit()
    db.refresh(deal)

    return deal


def update_deal(
    db: Session,
    membership: WorkspaceMembership,
    deal: Deal,
    data: DealUpdate,
) -> Deal:
    ensure_record_access(
        deal,
        membership,
    )

    changes = data.model_dump(
        exclude_unset=True,
    )

    if "owner_membership_id" in changes:
        ensure_owner_change_allowed(membership)

        owner_membership_id = changes["owner_membership_id"]

        validate_owner_membership(
            db,
            membership.workspace_id,
            owner_membership_id,
        )

        deal.owner_membership_id = owner_membership_id

    if "company_id" in changes:
        company_id = changes["company_id"]

        if company_id is not None:
            company = get_company(
                db,
                membership,
                company_id,
            )

            if company is None:
                raise ValueError(
                    "Company does not exist or is not accessible"
                )

        deal.company_id = company_id

    if "contact_id" in changes:
        contact_id = changes["contact_id"]

        if contact_id is not None:
            contact = get_contact(
                db,
                membership,
                contact_id,
            )

            if contact is None:
                raise ValueError(
                    "Contact does not exist or is not accessible"
                )

        deal.contact_id = contact_id

    for field_name in (
        "name",
        "amount",
        "stage",
        "probability",
        "expected_close_date",
        "description",
    ):
        if field_name not in changes:
            continue

        value = changes[field_name]

        if isinstance(value, str):
            value = value.strip() or None

        setattr(
            deal,
            field_name,
            value,
        )

    db.commit()
    db.refresh(deal)

    return deal


def delete_deal(
    db: Session,
    membership: WorkspaceMembership,
    deal: Deal,
) -> None:
    ensure_record_access(
        deal,
        membership,
    )

    db.delete(deal)
    db.commit()


def get_activity(
    db: Session,
    membership: WorkspaceMembership,
    activity_id: UUID,
) -> Activity | None:
    statement = select(Activity).where(
        Activity.id == activity_id,
        *visibility_conditions(
            Activity,
            membership,
        ),
    )

    return db.scalar(statement)


def list_activities(
    db: Session,
    membership: WorkspaceMembership,
    search: str | None = None,
    type: ActivityType | None = None,
    company_id: UUID | None = None,
    contact_id: UUID | None = None,
    deal_id: UUID | None = None,
    owner_membership_id: UUID | None = None,
    limit: int = 50,
    offset: int = 0,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> list[Activity]:
    conditions = visibility_conditions(
        Activity,
        membership,
    )

    if search:
        search_value = search.strip()

        if search_value:
            conditions.append(
                Activity.subject.icontains(
                    search_value,
                    autoescape=True,
                )
            )

    if type is not None:
        conditions.append(
            Activity.type == type
        )

    if company_id is not None:
        conditions.append(
            Activity.company_id == company_id
        )

    if contact_id is not None:
        conditions.append(
            Activity.contact_id == contact_id
        )

    if deal_id is not None:
        conditions.append(
            Activity.deal_id == deal_id
        )

    if owner_membership_id is not None:
        conditions.append(
            Activity.owner_membership_id
            == owner_membership_id
        )

    sort_columns = {
        "due_at": Activity.due_at,
        "completed_at": Activity.completed_at,
        "created_at": Activity.created_at,
        "updated_at": Activity.updated_at,
    }

    sort_column = sort_columns.get(
        sort_by,
        Activity.created_at,
    )

    order_clause = (
        sort_column.desc()
        if sort_order == "desc"
        else sort_column.asc()
    )

    statement = (
        select(Activity)
        .where(*conditions)
        .order_by(
            order_clause.nulls_last(),
            Activity.id.asc(),
        )
        .offset(offset)
        .limit(limit)
    )

    return list(db.scalars(statement).all())


def create_activity(
    db: Session,
    membership: WorkspaceMembership,
    data: ActivityCreate,
) -> Activity:
    owner_membership_id = resolve_create_owner_membership_id(
        db,
        membership,
        data.owner_membership_id,
    )

    if data.company_id is not None:
        company = get_company(
            db,
            membership,
            data.company_id,
        )

        if company is None:
            raise ValueError(
                "Company does not exist or is not accessible"
            )

    if data.contact_id is not None:
        contact = get_contact(
            db,
            membership,
            data.contact_id,
        )

        if contact is None:
            raise ValueError(
                "Contact does not exist or is not accessible"
            )

    if data.deal_id is not None:
        deal = get_deal(
            db,
            membership,
            data.deal_id,
        )

        if deal is None:
            raise ValueError(
                "Deal does not exist or is not accessible"
            )

    activity = Activity(
        workspace_id=membership.workspace_id,
        company_id=data.company_id,
        contact_id=data.contact_id,
        deal_id=data.deal_id,
        owner_membership_id=owner_membership_id,
        type=data.type,
        subject=data.subject.strip(),
        description=(
            data.description.strip()
            if data.description
            else None
        ),
        due_at=data.due_at,
        completed_at=data.completed_at,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def update_activity(
    db: Session,
    membership: WorkspaceMembership,
    activity: Activity,
    data: ActivityUpdate,
) -> Activity:
    ensure_record_access(
        activity,
        membership,
    )

    changes = data.model_dump(
        exclude_unset=True,
    )

    if "owner_membership_id" in changes:
        ensure_owner_change_allowed(membership)

        owner_membership_id = changes["owner_membership_id"]

        validate_owner_membership(
            db,
            membership.workspace_id,
            owner_membership_id,
        )

        activity.owner_membership_id = owner_membership_id

    if "company_id" in changes:
        company_id = changes["company_id"]

        if company_id is not None:
            company = get_company(
                db,
                membership,
                company_id,
            )

            if company is None:
                raise ValueError(
                    "Company does not exist or is not accessible"
                )

        activity.company_id = company_id

    if "contact_id" in changes:
        contact_id = changes["contact_id"]

        if contact_id is not None:
            contact = get_contact(
                db,
                membership,
                contact_id,
            )

            if contact is None:
                raise ValueError(
                    "Contact does not exist or is not accessible"
                )

        activity.contact_id = contact_id

    if "deal_id" in changes:
        deal_id = changes["deal_id"]

        if deal_id is not None:
            deal = get_deal(
                db,
                membership,
                deal_id,
            )

            if deal is None:
                raise ValueError(
                    "Deal does not exist or is not accessible"
                )

        activity.deal_id = deal_id

    for field_name in (
        "type",
        "subject",
        "description",
        "due_at",
        "completed_at",
    ):
        if field_name not in changes:
            continue

        value = changes[field_name]

        if isinstance(value, str):
            value = value.strip() or None

        setattr(
            activity,
            field_name,
            value,
        )

    db.commit()
    db.refresh(activity)

    return activity


def delete_activity(
    db: Session,
    membership: WorkspaceMembership,
    activity: Activity,
) -> None:
    ensure_record_access(
        activity,
        membership,
    )

    db.delete(activity)
    db.commit()

def get_dashboard_summary(
    db: Session,
    membership: WorkspaceMembership,
) -> dict:
    companies = db.scalar(
        select(func.count(Company.id)).where(
            *visibility_conditions(
                Company,
                membership,
            )
        )
    )

    contacts = db.scalar(
        select(func.count(Contact.id)).where(
            *visibility_conditions(
                Contact,
                membership,
            )
        )
    )

    deals = db.scalar(
        select(func.count(Deal.id)).where(
            *visibility_conditions(
                Deal,
                membership,
            )
        )
    )

    pipeline_value = db.scalar(
        select(
            func.coalesce(
                func.sum(Deal.amount),
                0,
            )
        ).where(
            *visibility_conditions(
                Deal,
                membership,
            )
        )
    )

    activities = db.scalar(
        select(func.count(Activity.id)).where(
            *visibility_conditions(
                Activity,
                membership,
            )
        )
    )

    overdue_activities = db.scalar(
        select(func.count(Activity.id)).where(
            *visibility_conditions(
                Activity,
                membership,
            ),
            Activity.due_at < func.now(),
            Activity.completed_at.is_(None),
        )
    )

    return {
        "companies": companies or 0,
        "contacts": contacts or 0,
        "deals": deals or 0,
        "pipeline_value": pipeline_value or 0,
        "activities": activities or 0,
        "overdue_activities": overdue_activities or 0,
    }