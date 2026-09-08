import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  FormEventHandler,
} from "react";

import {
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

import ActivityForm, {
  emptyActivityForm,
} from "../components/activities/ActivityForm";

import type {
  ActivityFormData,
} from "../components/activities/ActivityForm";

import ActivityTable from "../components/activities/ActivityTable";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";

import useWorkspaceMembers from "../hooks/useWorkspaceMembers";

import type {
  AppOutletContext,
} from "../layouts/AppLayout";

import {
  apiRequest,
} from "../lib/api";

import {
  memberName,
  optionalText,
  toApiDateTime,
  toInputDateTime,
} from "../lib/crm";

import type {
  Activity,
  ActivityType,
  Company,
  Contact,
  Deal,
} from "../types/crm";


const PAGE_SIZE = 20;

const activityTypes: ActivityType[] = [
  "call",
  "email",
  "meeting",
  "task",
  "note",
];

type SortBy =
  | "due_at"
  | "completed_at"
  | "created_at"
  | "updated_at";

type SortOrder =
  | "asc"
  | "desc";

type StatusFilter =
  | ""
  | "open"
  | "completed"
  | "overdue";


function toForm(
  activity: Activity,
): ActivityFormData {
  return {
    type: activity.type,
    subject: activity.subject,

    description:
      activity.description ?? "",

    due_at:
      toInputDateTime(
        activity.due_at,
      ),

    completed_at:
      toInputDateTime(
        activity.completed_at,
      ),

    company_id:
      activity.company_id ?? "",

    contact_id:
      activity.contact_id ?? "",

    deal_id:
      activity.deal_id ?? "",

    owner_membership_id:
      activity.owner_membership_id ??
      "",
  };
}


function labelType(
  type: ActivityType,
) {
  return (
    type.charAt(0).toUpperCase() +
    type.slice(1)
  );
}


export default function ActivitiesPage() {
  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const canManageOwners =
    workspace.role !== "member";

  const members =
    useWorkspaceMembers(
      workspace.workspace_id,
      canManageOwners,
    );


  const [
    activities,
    setActivities,
  ] = useState<Activity[]>([]);

  const [
    companies,
    setCompanies,
  ] = useState<Company[]>([]);

  const [
    contacts,
    setContacts,
  ] = useState<Contact[]>([]);

  const [
    deals,
    setDeals,
  ] = useState<Deal[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("");

  const [
    companyFilter,
    setCompanyFilter,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState<SortBy>(
    "created_at",
  );

  const [
    sortOrder,
    setSortOrder,
  ] = useState<SortOrder>(
    "desc",
  );

  const [
    page,
    setPage,
  ] = useState(0);


  const [
    editing,
    setEditing,
  ] = useState<Activity | null>(
    null,
  );

  const [
    form,
    setForm,
  ] = useState<ActivityFormData>(
    emptyActivityForm,
  );

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");


  const memberLookup =
    useMemo(
      () =>
        new Map(
          members.map(
            (member) => [
              member.id,
              memberName(member),
            ],
          ),
        ),
      [members],
    );


  const loadActivities =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            limit: String(
              PAGE_SIZE,
            ),

            offset: String(
              page * PAGE_SIZE,
            ),

            sort_by:
              sortBy,

            sort_order:
              sortOrder,
          });


        if (search) {
          params.set(
            "search",
            search,
          );
        }


        if (typeFilter) {
          params.set(
            "type",
            typeFilter,
          );
        }


        if (statusFilter) {
          params.set(
            "activity_status",
            statusFilter,
          );
        }


        if (companyFilter) {
          params.set(
            "company_id",
            companyFilter,
          );
        }


        try {
          const data =
            await apiRequest<
              Activity[]
            >(
              `/workspaces/${workspace.workspace_id}/activities?${params}`,
            );


          if (
            !data.length &&
            page > 0
          ) {
            setPage(
              page - 1,
            );

            return;
          }


          setActivities(
            data,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load activities",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        companyFilter,
        page,
        search,
        sortBy,
        sortOrder,
        statusFilter,
        typeFilter,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadActivities();
  }, [
    loadActivities,
  ]);


  useEffect(() => {
    Promise.all([
      apiRequest<Company[]>(
        `/workspaces/${workspace.workspace_id}/companies?limit=100&sort_by=name&sort_order=asc`,
      ),

      apiRequest<Contact[]>(
        `/workspaces/${workspace.workspace_id}/contacts?limit=100&sort_by=last_name&sort_order=asc`,
      ),

      apiRequest<Deal[]>(
        `/workspaces/${workspace.workspace_id}/deals?limit=100&sort_by=name&sort_order=asc`,
      ),
    ])
      .then(
        ([
          companyData,
          contactData,
          dealData,
        ]) => {
          setCompanies(
            companyData,
          );

          setContacts(
            contactData,
          );

          setDeals(
            dealData,
          );
        },
      )
      .catch(() => {
        setCompanies([]);
        setContacts([]);
        setDeals([]);
      });
  }, [
    workspace.workspace_id,
  ]);


  useEffect(() => {
    const companyId =
      searchParams.get(
        "company_id",
      ) ?? "";

    const contactId =
      searchParams.get(
        "contact_id",
      ) ?? "";

    const dealId =
      searchParams.get(
        "deal_id",
      ) ?? "";

    const createNew =
      searchParams.get(
        "new",
      ) === "1";


    setCompanyFilter(
      companyId,
    );

    setPage(0);


    if (!createNew) {
      return;
    }


    setEditing(
      null,
    );

    setForm({
      ...emptyActivityForm,

      company_id:
        companyId,

      contact_id:
        contactId,

      deal_id:
        dealId,
    });

    setFormError("");
    setModalOpen(true);


    const nextParams =
      new URLSearchParams(
        searchParams,
      );

    nextParams.delete(
      "new",
    );


    setSearchParams(
      nextParams,
      {
        replace: true,
      },
    );
  }, [
    searchParams,
    setSearchParams,
  ]);


  function updateForm(
    field: keyof ActivityFormData,
    value: string,
  ) {
    if (
      field ===
      "company_id"
    ) {
      const contact =
        contacts.find(
          (item) =>
            item.id ===
            form.contact_id,
        );

      const deal =
        deals.find(
          (item) =>
            item.id ===
            form.deal_id,
        );


      setForm({
        ...form,

        company_id:
          value,

        contact_id:
          !value ||
          !contact ||
          contact.company_id ===
            value
            ? form.contact_id
            : "",

        deal_id:
          !value ||
          !deal ||
          deal.company_id ===
            value
            ? form.deal_id
            : "",
      });

      return;
    }


    if (
      field ===
      "contact_id"
    ) {
      const deal =
        deals.find(
          (item) =>
            item.id ===
            form.deal_id,
        );


      setForm({
        ...form,

        contact_id:
          value,

        deal_id:
          !value ||
          !deal ||
          deal.contact_id ===
            value
            ? form.deal_id
            : "",
      });

      return;
    }


    setForm({
      ...form,
      [field]:
        value,
    });
  }


  function openCreate() {
    setEditing(
      null,
    );

    setForm(
      emptyActivityForm,
    );

    setFormError("");
    setModalOpen(true);
  }


  function openEdit(
    activity: Activity,
  ) {
    setEditing(
      activity,
    );

    setForm(
      toForm(
        activity,
      ),
    );

    setFormError("");
    setModalOpen(true);
  }


  function closeModal() {
    if (!saving) {
      setModalOpen(
        false,
      );
    }
  }


  const handleSearch:
    FormEventHandler<HTMLFormElement> =
    (event) => {
      event.preventDefault();

      setPage(0);

      setSearch(
        searchInput.trim(),
      );
    };


  const handleSave:
    FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      const subject =
        form.subject.trim();


      if (!subject) {
        setFormError(
          "Subject is required.",
        );

        return;
      }


      const payload = {
        type:
          form.type,

        subject,

        description:
          optionalText(
            form.description,
          ),

        due_at:
          toApiDateTime(
            form.due_at,
          ),

        completed_at:
          toApiDateTime(
            form.completed_at,
          ),

        company_id:
          form.company_id ||
          null,

        contact_id:
          form.contact_id ||
          null,

        deal_id:
          form.deal_id ||
          null,

        ...(canManageOwners && {
          owner_membership_id:
            form.owner_membership_id ||
            null,
        }),
      };


      setSaving(
        true,
      );

      setFormError("");


      try {
        await apiRequest<Activity>(
          editing
            ? `/workspaces/${workspace.workspace_id}/activities/${editing.id}`
            : `/workspaces/${workspace.workspace_id}/activities`,
          {
            method:
              editing
                ? "PATCH"
                : "POST",

            body:
              JSON.stringify(
                payload,
              ),
          },
        );


        setModalOpen(
          false,
        );

        await loadActivities();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to save activity",
        );
      } finally {
        setSaving(
          false,
        );
      }
    };


  async function toggleComplete(
    activity: Activity,
  ) {
    try {
      await apiRequest<Activity>(
        `/workspaces/${workspace.workspace_id}/activities/${activity.id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify({
              completed_at:
                activity.completed_at
                  ? null
                  : new Date()
                      .toISOString(),
            }),
        },
      );


      await loadActivities();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to update activity",
      );
    }
  }


  async function removeActivity(
    activity: Activity,
  ) {
    if (
      !window.confirm(
        `Delete "${activity.subject}"?`,
      )
    ) {
      return;
    }


    try {
      await apiRequest<void>(
        `/workspaces/${workspace.workspace_id}/activities/${activity.id}`,
        {
          method:
            "DELETE",
        },
      );


      await loadActivities();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete activity",
      );
    }
  }


  function ownerName(
    activity: Activity,
  ) {
    if (
      !activity.owner_membership_id
    ) {
      return "Unassigned";
    }


    if (
      activity.owner_membership_id ===
      workspace.membership_id
    ) {
      return (
        memberLookup.get(
          activity.owner_membership_id,
        ) || "You"
      );
    }


    return (
      memberLookup.get(
        activity.owner_membership_id,
      ) || "Assigned"
    );
  }


  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setCompanyFilter("");
    setPage(0);


    setSearchParams(
      {},
      {
        replace: true,
      },
    );
  }


  const hasFilters =
    Boolean(
      search ||
      typeFilter ||
      statusFilter ||
      companyFilter,
    );


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Activities
          </h1>

          <p>
            Manage tasks and interactions in{" "}
            <strong>
              {
                workspace.workspace_name
              }
            </strong>
            .
          </p>
        </div>


        <button
          className="primary-button"
          onClick={
            openCreate
          }
        >
          + Add Activity
        </button>
      </div>


      <section className="card">
        <div className="company-toolbar">
          <form
            className="company-search"
            onSubmit={
              handleSearch
            }
          >
            <input
              type="search"
              placeholder="Search activities..."
              value={
                searchInput
              }
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
            />

            <button className="secondary-button">
              Search
            </button>


            {hasFilters && (
              <button
                type="button"
                className="text-action-button"
                onClick={
                  clearFilters
                }
              >
                Clear
              </button>
            )}
          </form>


          <div className="activity-filters">
            <label>
              Type

              <select
                value={
                  typeFilter
                }
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value,
                  );

                  setPage(0);
                }}
              >
                <option value="">
                  All Types
                </option>

                {activityTypes.map(
                  (type) => (
                    <option
                      key={
                        type
                      }
                      value={
                        type
                      }
                    >
                      {labelType(
                        type,
                      )}
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              Status

              <select
                value={
                  statusFilter
                }
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as
                      StatusFilter,
                  );

                  setPage(0);
                }}
              >
                <option value="">
                  All Statuses
                </option>

                <option value="open">
                  Open
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="overdue">
                  Overdue
                </option>
              </select>
            </label>


            <label>
              Company

              <select
                value={
                  companyFilter
                }
                onChange={(event) => {
                  const value =
                    event.target.value;


                  setCompanyFilter(
                    value,
                  );

                  setPage(0);


                  if (value) {
                    setSearchParams(
                      {
                        company_id:
                          value,
                      },
                      {
                        replace:
                          true,
                      },
                    );
                  } else {
                    setSearchParams(
                      {},
                      {
                        replace:
                          true,
                      },
                    );
                  }
                }}
              >
                <option value="">
                  All Companies
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={
                        company.id
                      }
                      value={
                        company.id
                      }
                    >
                      {
                        company.name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              Sort

              <select
                value={
                  sortBy
                }
                onChange={(event) => {
                  setSortBy(
                    event.target
                      .value as SortBy,
                  );

                  setPage(0);
                }}
              >
                <option value="created_at">
                  Created
                </option>

                <option value="due_at">
                  Due Date
                </option>

                <option value="completed_at">
                  Completed
                </option>

                <option value="updated_at">
                  Updated
                </option>
              </select>
            </label>


            <label>
              Order

              <select
                value={
                  sortOrder
                }
                onChange={(event) => {
                  setSortOrder(
                    event.target
                      .value as SortOrder,
                  );

                  setPage(0);
                }}
              >
                <option value="desc">
                  Descending
                </option>

                <option value="asc">
                  Ascending
                </option>
              </select>
            </label>
          </div>
        </div>


        {error && (
          <div className="data-error">
            {error}
          </div>
        )}


        {loading ? (
          <div className="placeholder-card">
            Loading activities...
          </div>
        ) : activities.length ? (
          <>
            <ActivityTable
              activities={
                activities
              }

              companies={
                companies
              }

              contacts={
                contacts
              }

              deals={
                deals
              }

              ownerName={
                ownerName
              }

              onEdit={
                openEdit
              }

              onDelete={
                removeActivity
              }

              onToggleComplete={
                toggleComplete
              }
            />


            <Pagination
              page={
                page
              }

              hasNext={
                activities.length ===
                PAGE_SIZE
              }

              onPageChange={
                setPage
              }
            />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              A
            </div>

            <h2>
              No activities found
            </h2>

            <p>
              {hasFilters
                ? "Try changing your search or filters."
                : "Create your first activity."}
            </p>


            {!hasFilters && (
              <button
                className="primary-button"
                onClick={
                  openCreate
                }
              >
                Add Activity
              </button>
            )}
          </div>
        )}
      </section>


      {modalOpen && (
        <Modal
          title={
            editing
              ? "Edit Activity"
              : "Add Activity"
          }

          description={
            editing
              ? "Update activity information."
              : "Create a new CRM activity."
          }

          disabled={
            saving
          }

          onClose={
            closeModal
          }
        >
          <ActivityForm
            form={
              form
            }

            companies={
              companies
            }

            contacts={
              contacts
            }

            deals={
              deals
            }

            members={
              members
            }

            canManageOwners={
              canManageOwners
            }

            saving={
              saving
            }

            error={
              formError
            }

            onChange={
              updateForm
            }

            onSubmit={
              handleSave
            }

            onCancel={
              closeModal
            }
          />
        </Modal>
      )}
    </>
  );
}