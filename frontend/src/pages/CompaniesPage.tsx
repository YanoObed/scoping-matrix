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
} from "react-router-dom";

import CompanyForm, {
  emptyCompanyForm,
} from "../components/companies/CompanyForm";

import type {
  CompanyFormData,
} from "../components/companies/CompanyForm";

import CompanyTable from "../components/companies/CompanyTable";
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
} from "../lib/crm";

import type {
  Company,
} from "../types/crm";


const PAGE_SIZE = 20;


type SortBy =
  | "name"
  | "created_at"
  | "updated_at";

type SortOrder =
  | "asc"
  | "desc";


function toForm(
  company: Company,
): CompanyFormData {
  return {
    name: company.name,
    domain: company.domain ?? "",
    website: company.website ?? "",
    phone: company.phone ?? "",
    industry: company.industry ?? "",

    employee_count:
      company.employee_count === null
        ? ""
        : String(
            company.employee_count,
          ),

    annual_revenue:
      company.annual_revenue === null
        ? ""
        : String(
            company.annual_revenue,
          ),

    description:
      company.description ?? "",

    address_line1:
      company.address_line1 ?? "",

    address_line2:
      company.address_line2 ?? "",

    city:
      company.city ?? "",

    state_region:
      company.state_region ?? "",

    postal_code:
      company.postal_code ?? "",

    country:
      company.country ?? "",

    owner_membership_id:
      company.owner_membership_id ??
      "",
  };
}


export default function CompaniesPage() {
  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();


  const canManageOwners =
    workspace.role !== "member";

  const members =
    useWorkspaceMembers(
      workspace.workspace_id,
      canManageOwners,
    );


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
    sortBy,
    setSortBy,
  ] = useState<SortBy>("name");

  const [
    sortOrder,
    setSortOrder,
  ] = useState<SortOrder>("asc");

  const [
    page,
    setPage,
  ] = useState(0);


  const [
    editing,
    setEditing,
  ] = useState<Company | null>(
    null,
  );

  const [
    form,
    setForm,
  ] = useState<CompanyFormData>(
    emptyCompanyForm,
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


  const memberLookup = useMemo(
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


  const loadCompanies =
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


        try {
          const data =
            await apiRequest<
              Company[]
            >(
              `/workspaces/${workspace.workspace_id}/companies?${params}`,
            );

          if (
            !data.length &&
            page > 0
          ) {
            setPage(page - 1);
            return;
          }

          setCompanies(data);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load companies",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        search,
        sortBy,
        sortOrder,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadCompanies();
  }, [loadCompanies]);


  function openCreate() {
    setEditing(null);
    setForm(emptyCompanyForm);
    setFormError("");
    setModalOpen(true);
  }


  function openEdit(
    company: Company,
  ) {
    setEditing(company);
    setForm(toForm(company));
    setFormError("");
    setModalOpen(true);
  }


  function closeModal() {
    if (!saving) {
      setModalOpen(false);
    }
  }


  function updateForm(
    field: keyof CompanyFormData,
    value: string,
  ) {
    setForm({
      ...form,
      [field]: value,
    });
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

      if (!name) {
        setFormError(
          "Company name is required.",
        );

        return;
      }


      const payload = {
        name,

        domain:
          optionalText(form.domain),

        website:
          optionalText(form.website),

        phone:
          optionalText(form.phone),

        industry:
          optionalText(form.industry),

        employee_count:
          form.employee_count
            ? Number(
                form.employee_count,
              )
            : null,

        annual_revenue:
          form.annual_revenue
            ? Number(
                form.annual_revenue,
              )
            : null,

        description:
          optionalText(
            form.description,
          ),

        address_line1:
          optionalText(
            form.address_line1,
          ),

        address_line2:
          optionalText(
            form.address_line2,
          ),

        city:
          optionalText(form.city),

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
        await apiRequest<Company>(
          editing
            ? `/workspaces/${workspace.workspace_id}/companies/${editing.id}`
            : `/workspaces/${workspace.workspace_id}/companies`,
          {
            method:
              editing
                ? "PATCH"
                : "POST",

            body:
              JSON.stringify(payload),
          },
        );

        setModalOpen(false);

        await loadCompanies();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to save company",
        );
      } finally {
        setSaving(false);
      }
    };


  async function removeCompany(
    company: Company,
  ) {
    if (
      !window.confirm(
        `Delete "${company.name}"?`,
      )
    ) {
      return;
    }

    try {
      await apiRequest<void>(
        `/workspaces/${workspace.workspace_id}/companies/${company.id}`,
        {
          method: "DELETE",
        },
      );

      await loadCompanies();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete company",
      );
    }
  }


  function ownerName(
    company: Company,
  ) {
    if (
      !company.owner_membership_id
    ) {
      return "Unassigned";
    }

    if (
      company.owner_membership_id ===
      workspace.membership_id
    ) {
      return (
        memberLookup.get(
          company.owner_membership_id,
        ) || "You"
      );
    }

    return (
      memberLookup.get(
        company.owner_membership_id,
      ) || "Assigned"
    );
  }


  return (
    <>
      <div className="page-header">
        <div>
          <h1>Companies</h1>

          <p>
            Manage organizations in{" "}
            <strong>
              {workspace.workspace_name}
            </strong>
            .
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreate}
        >
          + Add Company
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
              placeholder="Search companies..."
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

            {search && (
              <button
                type="button"
                className="text-action-button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(0);
                }}
              >
                Clear
              </button>
            )}
          </form>


          <div className="company-sort">
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
                <option value="name">
                  Name
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
                value={sortOrder}
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
            Loading companies...
          </div>
        ) : companies.length ? (
          <>
            <CompanyTable
              companies={companies}
              ownerName={ownerName}
              onEdit={openEdit}
              onDelete={
                removeCompany
              }
            />

            <Pagination
              page={page}
              hasNext={
                companies.length ===
                PAGE_SIZE
              }
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              C
            </div>

            <h2>
              No companies found
            </h2>

            <p>
              {search
                ? "Try another search term."
                : "Create your first company."}
            </p>

            {!search && (
              <button
                className="primary-button"
                onClick={openCreate}
              >
                Add Company
              </button>
            )}
          </div>
        )}
      </section>


      {modalOpen && (
        <Modal
          title={
            editing
              ? "Edit Company"
              : "Add Company"
          }
          description={
            editing
              ? "Update company information."
              : "Create a new company."
          }
          disabled={saving}
          onClose={closeModal}
        >
          <CompanyForm
            form={form}
            members={members}
            canManageOwners={
              canManageOwners
            }
            saving={saving}
            error={formError}
            onChange={updateForm}
            onSubmit={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </>
  );
}