from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.modules.crm.models.deal import DealStage
from app.modules.crm.models.activity import ActivityType
from app.modules.crm.schemas import (
    ActivityCreate,
    ActivityRead,
    ActivityUpdate,
    CompanyCreate,
    CompanyRead,
    CompanyUpdate,
    ContactCreate,
    ContactRead,
    ContactUpdate,
    DealCreate,
    DealRead,
    DealUpdate,
    DashboardRead,
    DealStageHistoryRead,
)
from app.modules.crm.service import (
    create_activity,
    create_company,
    create_contact,
    create_deal,
    delete_activity,
    delete_company,
    delete_contact,
    delete_deal,
    get_activity,
    get_company,
    get_contact,
    get_deal,
    get_dashboard_summary,
    list_activities,
    list_companies,
    list_contacts,
    list_deals,
    list_deal_stage_history,
    update_activity,
    update_company,
    update_contact,
    update_deal,
)
from app.modules.identity.dependencies import get_current_membership
from app.modules.identity.models import WorkspaceMembership


router = APIRouter(
    prefix="/workspaces/{workspace_id}",
    tags=["CRM"],
)


def permission_error(
    exc: PermissionError,
) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=str(exc),
    )


@router.get(
    "/dashboard",
    response_model=DashboardRead,
)
def dashboard(
    workspace_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(
        db,
        membership,
    )


@router.get(
    "/companies",
    response_model=list[CompanyRead],
)
def companies(
    workspace_id: UUID,
    search: str | None = Query(
        default=None,
        max_length=255,
    ),
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    sort_by: Literal[
        "name",
        "created_at",
        "updated_at",
    ] = "name",
    sort_order: Literal[
        "asc",
        "desc",
    ] = "asc",
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return list_companies(
        db,
        membership,
        search=search,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "/companies",
    response_model=CompanyRead,
    status_code=status.HTTP_201_CREATED,
)
def add_company(
    workspace_id: UUID,
    data: CompanyCreate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    try:
        return create_company(
            db,
            membership,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "/companies/{company_id}",
    response_model=CompanyRead,
)
def company(
    workspace_id: UUID,
    company_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_company(
        db,
        membership,
        company_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    return result


@router.patch(
    "/companies/{company_id}",
    response_model=CompanyRead,
)
def edit_company(
    workspace_id: UUID,
    company_id: UUID,
    data: CompanyUpdate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_company(
        db,
        membership,
        company_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    try:
        return update_company(
            db,
            membership,
            result,
            data,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.delete(
    "/companies/{company_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_company(
    workspace_id: UUID,
    company_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_company(
        db,
        membership,
        company_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    try:
        delete_company(
            db,
            membership,
            result,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc


@router.get(
    "/contacts",
    response_model=list[ContactRead],
)
def contacts(
    workspace_id: UUID,
    search: str | None = Query(
        default=None,
        max_length=255,
    ),
    company_id: UUID | None = None,
    owner_membership_id: UUID | None = None,
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    sort_by: Literal[
        "first_name",
        "last_name",
        "created_at",
        "updated_at",
    ] = "last_name",
    sort_order: Literal[
        "asc",
        "desc",
    ] = "asc",
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return list_contacts(
        db,
        membership,
        search=search,
        company_id=company_id,
        owner_membership_id=owner_membership_id,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "/contacts",
    response_model=ContactRead,
    status_code=status.HTTP_201_CREATED,
)
def add_contact(
    workspace_id: UUID,
    data: ContactCreate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    try:
        return create_contact(
            db,
            membership,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "/contacts/{contact_id}",
    response_model=ContactRead,
)
def contact(
    workspace_id: UUID,
    contact_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_contact(
        db,
        membership,
        contact_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    return result


@router.patch(
    "/contacts/{contact_id}",
    response_model=ContactRead,
)
def edit_contact(
    workspace_id: UUID,
    contact_id: UUID,
    data: ContactUpdate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_contact(
        db,
        membership,
        contact_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    try:
        return update_contact(
            db,
            membership,
            result,
            data,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.delete(
    "/contacts/{contact_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_contact(
    workspace_id: UUID,
    contact_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_contact(
        db,
        membership,
        contact_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    try:
        delete_contact(
            db,
            membership,
            result,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc


@router.get(
    "/deals",
    response_model=list[DealRead],
)
def deals(
    workspace_id: UUID,
    search: str | None = Query(
        default=None,
        max_length=255,
    ),
    stage: DealStage | None = None,
    company_id: UUID | None = None,
    contact_id: UUID | None = None,
    owner_membership_id: UUID | None = None,
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    sort_by: Literal[
        "name",
        "amount",
        "expected_close_date",
        "created_at",
        "updated_at",
    ] = "created_at",
    sort_order: Literal[
        "asc",
        "desc",
    ] = "desc",
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return list_deals(
        db,
        membership,
        search=search,
        stage=stage,
        company_id=company_id,
        contact_id=contact_id,
        owner_membership_id=owner_membership_id,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "/deals",
    response_model=DealRead,
    status_code=status.HTTP_201_CREATED,
)
def add_deal(
    workspace_id: UUID,
    data: DealCreate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    try:
        return create_deal(
            db,
            membership,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "/deals/{deal_id}/stage-history",
    response_model=list[DealStageHistoryRead],
)
def deal_stage_history(
    workspace_id: UUID,
    deal_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    deal = get_deal(
        db,
        membership,
        deal_id,
    )

    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    return list_deal_stage_history(
        db,
        membership,
        deal_id,
    )


@router.get(
    "/deals/{deal_id}",
    response_model=DealRead,
)
def deal(
    workspace_id: UUID,
    deal_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_deal(
        db,
        membership,
        deal_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    return result


@router.patch(
    "/deals/{deal_id}",
    response_model=DealRead,
)
def edit_deal(
    workspace_id: UUID,
    deal_id: UUID,
    data: DealUpdate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_deal(
        db,
        membership,
        deal_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    try:
        return update_deal(
            db,
            membership,
            result,
            data,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.delete(
    "/deals/{deal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_deal(
    workspace_id: UUID,
    deal_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_deal(
        db,
        membership,
        deal_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )

    try:
        delete_deal(
            db,
            membership,
            result,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc


@router.get(
    "/activities",
    response_model=list[ActivityRead],
)
def activities(
    workspace_id: UUID,
    search: str | None = Query(
        default=None,
        max_length=255,
    ),
    type: ActivityType | None = None,
    activity_status: Literal[
        "open",
        "completed",
        "overdue",
    ] | None = None,
    company_id: UUID | None = None,
    contact_id: UUID | None = None,
    deal_id: UUID | None = None,
    owner_membership_id: UUID | None = None,
    limit: int = Query(
        default=50,
        ge=1,
        le=100,
    ),
    offset: int = Query(
        default=0,
        ge=0,
    ),
    sort_by: Literal[
        "due_at",
        "completed_at",
        "created_at",
        "updated_at",
    ] = "created_at",
    sort_order: Literal[
        "asc",
        "desc",
    ] = "desc",
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    return list_activities(
        db,
        membership,
        search=search,
        type=type,
        activity_status=activity_status,
        company_id=company_id,
        contact_id=contact_id,
        deal_id=deal_id,
        owner_membership_id=owner_membership_id,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.post(
    "/activities",
    response_model=ActivityRead,
    status_code=status.HTTP_201_CREATED,
)
def add_activity(
    workspace_id: UUID,
    data: ActivityCreate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    try:
        return create_activity(
            db,
            membership,
            data,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "/activities/{activity_id}",
    response_model=ActivityRead,
)
def activity(
    workspace_id: UUID,
    activity_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_activity(
        db,
        membership,
        activity_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )

    return result


@router.patch(
    "/activities/{activity_id}",
    response_model=ActivityRead,
)
def edit_activity(
    workspace_id: UUID,
    activity_id: UUID,
    data: ActivityUpdate,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_activity(
        db,
        membership,
        activity_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )

    try:
        return update_activity(
            db,
            membership,
            result,
            data,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.delete(
    "/activities/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_activity(
    workspace_id: UUID,
    activity_id: UUID,
    membership: WorkspaceMembership = Depends(
        get_current_membership
    ),
    db: Session = Depends(get_db),
):
    result = get_activity(
        db,
        membership,
        activity_id,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )

    try:
        delete_activity(
            db,
            membership,
            result,
        )
    except PermissionError as exc:
        raise permission_error(exc) from exc