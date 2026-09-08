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

import ContactForm, {
  emptyContactForm,
} from "../components/contacts/ContactForm";

import type {
  ContactFormData,
} from "../components/contacts/ContactForm";

import ContactTable from "../components/contacts/ContactTable";
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
  contactName,
  memberName,
  optionalText,
} from "../lib/crm";

import type {
  Company,
  Contact,
} from "../types/crm";


const PAGE_SIZE = 20;


type SortBy =
  | "first_name"
  | "last_name"
  | "created_at"
  | "updated_at";

type SortOrder =
  | "asc"
  | "desc";


function toForm(
  contact: Contact,
): ContactFormData {
  return {
    first_name:
      contact.first_name,

    last_name:
      contact.last_name ?? "",

    email:
      contact.email ?? "",

    phone:
      contact.phone ?? "",

    mobile_phone:
      contact.mobile_phone ?? "",

    job_title:
      contact.job_title ?? "",

    department:
      contact.department ?? "",

    linkedin_url:
      contact.linkedin_url ?? "",

    description:
      contact.description ?? "",

    company_id:
      contact.company_id ?? "",

    owner_membership_id:
      contact.owner_membership_id ??
      "",

    address_line1:
      contact.address_line1 ?? "",

    address_line2:
      contact.address_line2 ?? "",

    city:
      contact.city ?? "",

    state_region:
      contact.state_region ?? "",

    postal_code:
      contact.postal_code ?? "",

    country:
      contact.country ?? "",
  };
}


export default function ContactsPage() {
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
    contacts,
    setContacts,
  ] = useState<Contact[]>([]);

  const [
    companies,
    setCompanies,
  ] = useState<Company[]>([]);

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
    companyFilter,
    setCompanyFilter,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState<SortBy>(
    "last_name",
  );

  const [
    sortOrder,
    setSortOrder,
  ] = useState<SortOrder>(
    "asc",
  );

  const [
    page,
    setPage,
  ] = useState(0);


  const [
    editing,
    setEditing,
  ] = useState<Contact | null>(
    null,
  );

  const [
    form,
    setForm,
  ] = useState<ContactFormData>(
    emptyContactForm,
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


  const loadContacts =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            limit:
              String(PAGE_SIZE),

            offset:
              String(
                page * PAGE_SIZE,
              ),

            sort_by: sortBy,
            sort_order: sortOrder,
          });


        if (search) {
          params.set(
            "search",
            search,
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
              Contact[]
            >(
              `/workspaces/${workspace.workspace_id}/contacts?${params}`,
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

          setContacts(data);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load contacts",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        companyFilter,
        page,
        search,
        sortBy,
        sortOrder,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);


  useEffect(() => {
    apiRequest<Company[]>(
      `/workspaces/${workspace.workspace_id}/companies?limit=100&offset=0&sort_by=name&sort_order=asc`,
    )
      .then(
        setCompanies,
      )
      .catch(() =>
        setCompanies([]),
      );
  }, [
    workspace.workspace_id,
  ]);


  useEffect(() => {
    const companyId =
      searchParams.get(
        "company_id",
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


    setEditing(null);

    setForm({
      ...emptyContactForm,
      company_id: companyId,
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
    field: keyof ContactFormData,
    value: string,
  ) {
    setForm({
      ...form,
      [field]: value,
    });
  }


  function openCreate() {
    setEditing(null);

    setForm(
      emptyContactForm,
    );

    setFormError("");
    setModalOpen(true);
  }


  function openEdit(
    contact: Contact,
  ) {
    setEditing(contact);

    setForm(
      toForm(contact),
    );

    setFormError("");
    setModalOpen(true);
  }


  function closeModal() {
    if (!saving) {
      setModalOpen(false);
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

      const firstName =
        form.first_name.trim();


      if (!firstName) {
        setFormError(
          "First name is required.",
        );

        return;
      }


      const payload = {
        first_name: firstName,

        last_name:
          optionalText(
            form.last_name,
          ),

        email:
          optionalText(
            form.email,
          ),

        phone:
          optionalText(
            form.phone,
          ),

        mobile_phone:
          optionalText(
            form.mobile_phone,
          ),

        job_title:
          optionalText(
            form.job_title,
          ),

        department:
          optionalText(
            form.department,
          ),

        linkedin_url:
          optionalText(
            form.linkedin_url,
          ),

        description:
          optionalText(
            form.description,
          ),

        company_id:
          form.company_id ||
          null,

        address_line1:
          optionalText(
            form.address_line1,
          ),

        address_line2:
          optionalText(
            form.address_line2,
          ),

        city:
          optionalText(
            form.city,
          ),

        state_region:
          optionalText(
            form.state_region,
          ),

        postal_code:
          optionalText(
            form.postal_code,
          ),

        country:
          optionalText(
            form.country,
          ),

        ...(canManageOwners && {
          owner_membership_id:
            form.owner_membership_id ||
            null,
        }),
      };


      setSaving(true);
      setFormError("");


      try {
        await apiRequest<Contact>(
          editing
            ? `/workspaces/${workspace.workspace_id}/contacts/${editing.id}`
            : `/workspaces/${workspace.workspace_id}/contacts`,
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

        setModalOpen(false);

        await loadContacts();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to save contact",
        );
      } finally {
        setSaving(false);
      }
    };


  async function removeContact(
    contact: Contact,
  ) {
    if (
      !window.confirm(
        `Delete "${contactName(contact)}"?`,
      )
    ) {
      return;
    }


    try {
      await apiRequest<void>(
        `/workspaces/${workspace.workspace_id}/contacts/${contact.id}`,
        {
          method:
            "DELETE",
        },
      );

      await loadContacts();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete contact",
      );
    }
  }


  function ownerName(
    contact: Contact,
  ) {
    if (
      !contact.owner_membership_id
    ) {
      return "Unassigned";
    }


    if (
      contact.owner_membership_id ===
      workspace.membership_id
    ) {
      return (
        memberLookup.get(
          contact.owner_membership_id,
        ) || "You"
      );
    }


    return (
      memberLookup.get(
        contact.owner_membership_id,
      ) || "Assigned"
    );
  }


  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCompanyFilter("");
    setPage(0);

    setSearchParams(
      {},
      {
        replace: true,
      },
    );
  }


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Contacts
          </h1>

          <p>
            Manage people in{" "}
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
          onClick={openCreate}
        >
          + Add Contact
        </button>
      </div>


      <section className="card">
        <div className="company-toolbar">
          <form
            className="company-search"
            onSubmit={handleSearch}
          >
            <input
              type="search"
              placeholder="Search contacts..."
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
            />

            <button className="secondary-button">
              Search
            </button>

            {(search ||
              companyFilter) && (
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


          <div className="company-sort">
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
                value={sortBy}
                onChange={(event) => {
                  setSortBy(
                    event.target
                      .value as SortBy,
                  );

                  setPage(0);
                }}
              >
                <option value="last_name">
                  Last Name
                </option>

                <option value="first_name">
                  First Name
                </option>

                <option value="created_at">
                  Created
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
                <option value="asc">
                  Ascending
                </option>

                <option value="desc">
                  Descending
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
            Loading contacts...
          </div>
        ) : contacts.length ? (
          <>
            <ContactTable
              contacts={
                contacts
              }
              companies={
                companies
              }
              ownerName={
                ownerName
              }
              onEdit={
                openEdit
              }
              onDelete={
                removeContact
              }
            />

            <Pagination
              page={page}
              hasNext={
                contacts.length ===
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
              P
            </div>

            <h2>
              No contacts found
            </h2>

            <p>
              {search ||
              companyFilter
                ? "Try changing your search or filter."
                : "Create your first contact."}
            </p>

            {!search &&
              !companyFilter && (
                <button
                  className="primary-button"
                  onClick={
                    openCreate
                  }
                >
                  Add Contact
                </button>
              )}
          </div>
        )}
      </section>


      {modalOpen && (
        <Modal
          title={
            editing
              ? "Edit Contact"
              : "Add Contact"
          }
          description={
            editing
              ? "Update contact information."
              : "Create a new contact."
          }
          disabled={saving}
          onClose={
            closeModal
          }
        >
          <ContactForm
            form={form}
            companies={
              companies
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