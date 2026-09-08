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
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

import DealForm, {
  emptyDealForm,
} from "../components/deals/DealForm";

import type {
  DealFormData,
} from "../components/deals/DealForm";

import DealHistory from "../components/deals/DealHistory";
import DealPipeline from "../components/deals/DealPipeline";
import DealTable from "../components/deals/DealTable";
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
  formatCurrency,
  memberName,
  optionalText,
} from "../lib/crm";

import type {
  Company,
  Contact,
  Deal,
  DealStage,
  DealStageHistory,
} from "../types/crm";


const PAGE_SIZE = 20;

const stages: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];


type SortBy =
  | "name"
  | "amount"
  | "expected_close_date"
  | "created_at"
  | "updated_at";

type SortOrder =
  | "asc"
  | "desc";

type View =
  | "list"
  | "pipeline";


type DealSummary = {
  open_deals: number;
  open_value: number | string;
  won_deals: number;
  won_value: number | string;
  lost_deals: number;
  lost_value: number | string;
};


function toForm(
  deal: Deal,
): DealFormData {
  return {
    name: deal.name,

    amount:
      deal.amount === null
        ? ""
        : String(deal.amount),

    stage: deal.stage,

    probability:
      deal.probability === null
        ? ""
        : String(
            deal.probability,
          ),

    expected_close_date:
      deal.expected_close_date ?? "",

    description:
      deal.description ?? "",

    company_id:
      deal.company_id ?? "",

    contact_id:
      deal.contact_id ?? "",

    owner_membership_id:
      deal.owner_membership_id ?? "",
  };
}


export default function DealsPage() {
  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();

  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] =
    useSearchParams();


  const [
    view,
    setView,
  ] =
    useState<View>("list");


  const canManageOwners =
    workspace.role !== "member";

  const members =
    useWorkspaceMembers(
      workspace.workspace_id,
      canManageOwners,
    );


  const [
    deals,
    setDeals,
  ] =
    useState<Deal[]>([]);

  const [
    summary,
    setSummary,
  ] =
    useState<DealSummary | null>(
      null,
    );

  const [
    summaryError,
    setSummaryError,
  ] =
    useState("");


  const [
    companies,
    setCompanies,
  ] =
    useState<Company[]>([]);

  const [
    contacts,
    setContacts,
  ] =
    useState<Contact[]>([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  const [
    searchInput,
    setSearchInput,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    stageFilter,
    setStageFilter,
  ] =
    useState("");

  const [
    companyFilter,
    setCompanyFilter,
  ] =
    useState("");


  const [
    sortBy,
    setSortBy,
  ] =
    useState<SortBy>(
      "created_at",
    );

  const [
    sortOrder,
    setSortOrder,
  ] =
    useState<SortOrder>(
      "desc",
    );

  const [
    page,
    setPage,
  ] =
    useState(0);


  const [
    editing,
    setEditing,
  ] =
    useState<Deal | null>(
      null,
    );

  const [
    form,
    setForm,
  ] =
    useState<DealFormData>(
      emptyDealForm,
    );

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    formError,
    setFormError,
  ] =
    useState("");


  const [
    historyDeal,
    setHistoryDeal,
  ] =
    useState<Deal | null>(
      null,
    );

  const [
    history,
    setHistory,
  ] =
    useState<
      DealStageHistory[]
    >([]);

  const [
    historyLoading,
    setHistoryLoading,
  ] =
    useState(false);

  const [
    historyError,
    setHistoryError,
  ] =
    useState("");


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


  const loadSummary =
    useCallback(
      async () => {
        setSummaryError("");

        try {
          const data =
            await apiRequest<
              DealSummary
            >(
              `/workspaces/${workspace.workspace_id}/deals/summary`,
            );

          setSummary(
            data,
          );
        } catch (error) {
          setSummaryError(
            error instanceof Error
              ? error.message
              : "Unable to load deal summary",
          );

          setSummary(
            null,
          );
        }
      },
      [
        workspace.workspace_id,
      ],
    );


  const loadDeals =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            limit: String(
              view === "pipeline"
                ? 100
                : PAGE_SIZE,
            ),

            offset: String(
              view === "pipeline"
                ? 0
                : page * PAGE_SIZE,
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


        if (stageFilter) {
          params.set(
            "stage",
            stageFilter,
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
              Deal[]
            >(
              `/workspaces/${workspace.workspace_id}/deals?${params}`,
            );


          if (
            !data.length &&
            page > 0 &&
            view === "list"
          ) {
            setPage(
              page - 1,
            );

            return;
          }


          setDeals(
            data,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load deals",
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
        stageFilter,
        view,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadDeals();
  }, [
    loadDeals,
  ]);


  useEffect(() => {
    void loadSummary();
  }, [
    loadSummary,
  ]);


  useEffect(() => {
    Promise.all([
      apiRequest<Company[]>(
        `/workspaces/${workspace.workspace_id}/companies?limit=100&sort_by=name&sort_order=asc`,
      ),

      apiRequest<Contact[]>(
        `/workspaces/${workspace.workspace_id}/contacts?limit=100&sort_by=last_name&sort_order=asc`,
      ),
    ])
      .then(
        ([
          companyData,
          contactData,
        ]) => {
          setCompanies(
            companyData,
          );

          setContacts(
            contactData,
          );
        },
      )
      .catch(() => {
        setCompanies([]);
        setContacts([]);
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
      ...emptyDealForm,
      company_id: companyId,
      contact_id: contactId,
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
    field: keyof DealFormData,
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
      });

      return;
    }


    setForm({
      ...form,
      [field]: value,
    });
  }


  function openCreate() {
    setEditing(
      null,
    );

    setForm(
      emptyDealForm,
    );

    setFormError("");
    setModalOpen(true);
  }


  function openEdit(
    deal: Deal,
  ) {
    setEditing(
      deal,
    );

    setForm(
      toForm(deal),
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


      const name =
        form.name.trim();


      const amount =
        form.amount
          ? Number(
              form.amount,
            )
          : null;


      const probability =
        form.probability
          ? Number(
              form.probability,
            )
          : null;


      if (!name) {
        setFormError(
          "Deal name is required.",
        );

        return;
      }


      if (
        probability !== null &&
        (
          probability < 0 ||
          probability > 100
        )
      ) {
        setFormError(
          "Probability must be between 0 and 100.",
        );

        return;
      }


      const payload = {
        name,
        amount,
        stage:
          form.stage,
        probability,

        expected_close_date:
          form.expected_close_date ||
          null,

        description:
          optionalText(
            form.description,
          ),

        company_id:
          form.company_id ||
          null,

        contact_id:
          form.contact_id ||
          null,

        ...(canManageOwners && {
          owner_membership_id:
            form.owner_membership_id ||
            null,
        }),
      };


      setSaving(true);
      setFormError("");


      try {
        await apiRequest<Deal>(
          editing
            ? `/workspaces/${workspace.workspace_id}/deals/${editing.id}`
            : `/workspaces/${workspace.workspace_id}/deals`,
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


        await Promise.all([
          loadDeals(),
          loadSummary(),
        ]);
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to save deal",
        );
      } finally {
        setSaving(
          false,
        );
      }
    };


  async function changeStage(
    deal: Deal,
    stage: DealStage,
  ) {
    if (
      deal.stage === stage
    ) {
      return;
    }


    try {
      await apiRequest<Deal>(
        `/workspaces/${workspace.workspace_id}/deals/${deal.id}`,
        {
          method:
            "PATCH",

          body:
            JSON.stringify({
              stage,
            }),
        },
      );


      await Promise.all([
        loadDeals(),
        loadSummary(),
      ]);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to change deal stage",
      );
    }
  }


  async function removeDeal(
    deal: Deal,
  ) {
    if (
      !window.confirm(
        `Delete "${deal.name}"?`,
      )
    ) {
      return;
    }


    try {
      await apiRequest<void>(
        `/workspaces/${workspace.workspace_id}/deals/${deal.id}`,
        {
          method:
            "DELETE",
        },
      );


      await Promise.all([
        loadDeals(),
        loadSummary(),
      ]);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete deal",
      );
    }
  }


  async function openHistory(
    deal: Deal,
  ) {
    setHistoryDeal(
      deal,
    );

    setHistory([]);
    setHistoryError("");
    setHistoryLoading(true);


    try {
      const data =
        await apiRequest<
          DealStageHistory[]
        >(
          `/workspaces/${workspace.workspace_id}/deals/${deal.id}/stage-history`,
        );

      setHistory(
        data,
      );
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Unable to load history",
      );
    } finally {
      setHistoryLoading(
        false,
      );
    }
  }


  function ownerName(
    deal: Deal,
  ) {
    if (
      !deal.owner_membership_id
    ) {
      return "Unassigned";
    }


    if (
      deal.owner_membership_id ===
      workspace.membership_id
    ) {
      return (
        memberLookup.get(
          deal.owner_membership_id,
        ) || "You"
      );
    }


    return (
      memberLookup.get(
        deal.owner_membership_id,
      ) || "Assigned"
    );
  }


  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStageFilter("");
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
      stageFilter ||
      companyFilter,
    );


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Deals
          </h1>

          <p>
            Manage opportunities in{" "}
            <strong>
              {
                workspace.workspace_name
              }
            </strong>
            .
          </p>
        </div>


        <div className="table-actions">
          <button
            type="button"
            className={
              view === "list"
                ? "primary-button"
                : "secondary-button"
            }
            onClick={() => {
              setView("list");
              setPage(0);
            }}
          >
            List
          </button>


          <button
            type="button"
            className={
              view === "pipeline"
                ? "primary-button"
                : "secondary-button"
            }
            onClick={() => {
              setView("pipeline");
              setPage(0);
            }}
          >
            Pipeline
          </button>


          <button
            type="button"
            className="primary-button"
            onClick={
              openCreate
            }
          >
            + Add Deal
          </button>
        </div>
      </div>


      {summaryError && (
        <div className="data-error">
          {summaryError}
        </div>
      )}


      {summary && (
        <section className="metrics-grid">
          <article className="metric-card">
            <span>
              Open Deals
            </span>

            <strong>
              {
                summary.open_deals
              }
            </strong>

            <small>
              Active opportunities
            </small>
          </article>


          <article className="metric-card">
            <span>
              Open Pipeline
            </span>

            <strong>
              {formatCurrency(
                Number(
                  summary.open_value,
                ) || 0,
              )}
            </strong>

            <small>
              Active opportunity value
            </small>
          </article>


          <article className="metric-card">
            <span>
              Won Deals
            </span>

            <strong>
              {
                summary.won_deals
              }
            </strong>

            <small>
              Closed successfully
            </small>
          </article>


          <article className="metric-card">
            <span>
              Won Value
            </span>

            <strong>
              {formatCurrency(
                Number(
                  summary.won_value,
                ) || 0,
              )}
            </strong>

            <small>
              Revenue won
            </small>
          </article>


          <article className="metric-card">
            <span>
              Lost Deals
            </span>

            <strong>
              {
                summary.lost_deals
              }
            </strong>

            <small>
              Closed lost
            </small>
          </article>


          <article className="metric-card">
            <span>
              Lost Value
            </span>

            <strong>
              {formatCurrency(
                Number(
                  summary.lost_value,
                ) || 0,
              )}
            </strong>

            <small>
              Opportunity value lost
            </small>
          </article>
        </section>
      )}


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
              placeholder="Search deals..."
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


          <div className="deal-filters">
            <label>
              Stage

              <select
                value={
                  stageFilter
                }
                onChange={(event) => {
                  setStageFilter(
                    event.target.value,
                  );

                  setPage(0);
                }}
              >
                <option value="">
                  All Stages
                </option>


                {stages.map(
                  (stage) => (
                    <option
                      key={
                        stage
                      }
                      value={
                        stage
                      }
                    >
                      {stage
                        .charAt(0)
                        .toUpperCase() +
                        stage.slice(1)}
                    </option>
                  ),
                )}
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

                <option value="name">
                  Name
                </option>

                <option value="amount">
                  Amount
                </option>

                <option value="expected_close_date">
                  Close Date
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
            Loading deals...
          </div>
        ) : deals.length ? (
          view === "pipeline" ? (
            <DealPipeline
              deals={
                deals
              }
              onStageChange={
                changeStage
              }
              onOpen={(deal) =>
                navigate(
                  `/deals/${deal.id}`,
                )
              }
            />
          ) : (
            <>
              <DealTable
                deals={
                  deals
                }
                companies={
                  companies
                }
                contacts={
                  contacts
                }
                ownerName={
                  ownerName
                }
                onEdit={
                  openEdit
                }
                onDelete={
                  removeDeal
                }
                onHistory={
                  openHistory
                }
              />


              <Pagination
                page={
                  page
                }
                hasNext={
                  deals.length ===
                  PAGE_SIZE
                }
                onPageChange={
                  setPage
                }
              />
            </>
          )
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              D
            </div>

            <h2>
              No deals found
            </h2>

            <p>
              {hasFilters
                ? "Try changing your search or filters."
                : "Create your first deal."}
            </p>


            {!hasFilters && (
              <button
                className="primary-button"
                onClick={
                  openCreate
                }
              >
                Add Deal
              </button>
            )}
          </div>
        )}
      </section>


      {modalOpen && (
        <Modal
          title={
            editing
              ? "Edit Deal"
              : "Add Deal"
          }
          description={
            editing
              ? "Update the sales opportunity."
              : "Create a new sales opportunity."
          }
          disabled={
            saving
          }
          onClose={
            closeModal
          }
        >
          <DealForm
            form={
              form
            }
            companies={
              companies
            }
            contacts={
              contacts
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


      {historyDeal && (
        <DealHistory
          deal={
            historyDeal
          }
          history={
            history
          }
          members={
            members
          }
          loading={
            historyLoading
          }
          error={
            historyError
          }
          onClose={() =>
            setHistoryDeal(
              null,
            )
          }
        />
      )}
    </>
  );
}