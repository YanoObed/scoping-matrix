import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useOutletContext,
  useParams,
} from "react-router-dom";

import type {
  AppOutletContext,
} from "../layouts/AppLayout";

import {
  apiRequest,
} from "../lib/api";

import {
  contactName,
  formatCurrency,
  formatDate,
  formatDateTime,
} from "../lib/crm";

import type {
  Activity,
  Company,
  Contact,
  Deal,
} from "../types/crm";


export default function CompanyDetailsPage() {
  const {
    companyId,
  } = useParams();

  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();


  const [
    company,
    setCompany,
  ] = useState<Company | null>(
    null,
  );

  const [
    contacts,
    setContacts,
  ] = useState<Contact[]>([]);

  const [
    deals,
    setDeals,
  ] = useState<Deal[]>([]);

  const [
    activities,
    setActivities,
  ] = useState<Activity[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const loadCompany =
    useCallback(
      async () => {
        if (!companyId) {
          setError(
            "Company not found.",
          );

          setLoading(false);
          return;
        }


        setLoading(true);
        setError("");


        try {
          const [
            companyData,
            contactData,
            dealData,
            activityData,
          ] = await Promise.all([
            apiRequest<Company>(
              `/workspaces/${workspace.workspace_id}/companies/${companyId}`,
            ),

            apiRequest<Contact[]>(
              `/workspaces/${workspace.workspace_id}/contacts?company_id=${companyId}&limit=100&sort_by=last_name&sort_order=asc`,
            ),

            apiRequest<Deal[]>(
              `/workspaces/${workspace.workspace_id}/deals?company_id=${companyId}&limit=100&sort_by=created_at&sort_order=desc`,
            ),

            apiRequest<Activity[]>(
              `/workspaces/${workspace.workspace_id}/activities?company_id=${companyId}&limit=100&sort_by=created_at&sort_order=desc`,
            ),
          ]);


          setCompany(
            companyData,
          );

          setContacts(
            contactData,
          );

          setDeals(
            dealData,
          );

          setActivities(
            activityData,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load company",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        companyId,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadCompany();
  }, [loadCompany]);


  if (loading) {
    return (
      <div className="placeholder-card">
        Loading company...
      </div>
    );
  }


  if (
    error ||
    !company
  ) {
    return (
      <section className="card">
        <div className="data-error">
          {error ||
            "Company not found."}
        </div>

        <Link
          className="secondary-button"
          to="/companies"
        >
          Back to Companies
        </Link>
      </section>
    );
  }


  return (
    <>
      <div className="page-header">
        <div>
          <Link
            className="text-action-button"
            to="/companies"
          >
            ← Companies
          </Link>

          <h1>
            {company.name}
          </h1>

          <p>
            {company.industry ||
              "Company record"}
          </p>
        </div>
      </div>


      <section className="card">
        <div className="form-section-heading">
          <h2>
            Company Information
          </h2>

          <p>
            Main organization details.
          </p>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Domain
            </strong>

            <p>
              {company.domain ||
                "—"}
            </p>
          </div>

          <div>
            <strong>
              Website
            </strong>

            <p>
              {company.website ||
                "—"}
            </p>
          </div>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Phone
            </strong>

            <p>
              {company.phone ||
                "—"}
            </p>
          </div>

          <div>
            <strong>
              Industry
            </strong>

            <p>
              {company.industry ||
                "—"}
            </p>
          </div>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Employees
            </strong>

            <p>
              {company.employee_count ??
                "—"}
            </p>
          </div>

          <div>
            <strong>
              Annual Revenue
            </strong>

            <p>
              {formatCurrency(
                company.annual_revenue,
              )}
            </p>
          </div>
        </div>


        <div>
          <strong>
            Address
          </strong>

          <p>
            {[
              company.address_line1,
              company.address_line2,
              company.city,
              company.state_region,
              company.postal_code,
              company.country,
            ]
              .filter(Boolean)
              .join(", ") ||
              "—"}
          </p>
        </div>


        {company.description && (
          <div>
            <strong>
              Description
            </strong>

            <p>
              {company.description}
            </p>
          </div>
        )}
      </section>


      <section className="card">
        <div className="page-header">
            <div>
            <h2>
                Contacts
            </h2>

            <p>
                {contacts.length} related
                contact
                {contacts.length === 1
                ? ""
                : "s"}
                .
            </p>
            </div>

            <Link
            className="primary-button"
            to={`/contacts?company_id=${company.id}&new=1`}
            >
            + Add Contact
            </Link>
        </div>


        {contacts.length ? (
          <div className="table-wrapper">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>

              <tbody>
                {contacts.map(
                  (contact) => (
                    <tr
                      key={contact.id}
                    >
                      <td>
                        <strong>
                          {contactName(
                            contact,
                          )}
                        </strong>
                      </td>

                      <td>
                        {contact.job_title ||
                          "—"}
                      </td>

                      <td>
                        {contact.email ||
                          "—"}
                      </td>

                      <td>
                        {contact.phone ||
                          contact.mobile_phone ||
                          "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-history">
            No contacts linked to
            this company.
          </div>
        )}
      </section>


      <section className="card">
        <div className="page-header">
            <div>
            <h2>
                Deals
            </h2>

            <p>
                {deals.length} related deal
                {deals.length === 1
                ? ""
                : "s"}
                .
            </p>
            </div>

            <Link
            className="primary-button"
            to={`/deals?company_id=${company.id}&new=1`}
            >
            + Add Deal
            </Link>
        </div>


        {deals.length ? (
          <div className="table-wrapper">
            <table className="deal-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Stage</th>
                  <th>Amount</th>
                  <th>Probability</th>
                  <th>Close Date</th>
                </tr>
              </thead>

              <tbody>
                {deals.map(
                  (deal) => (
                    <tr key={deal.id}>
                      <td>
                        <strong>
                          {deal.name}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            `deal-stage-badge stage-${deal.stage}`
                          }
                        >
                          {deal.stage
                            .charAt(0)
                            .toUpperCase() +
                            deal.stage.slice(
                              1,
                            )}
                        </span>
                      </td>

                      <td>
                        {formatCurrency(
                          deal.amount,
                        )}
                      </td>

                      <td>
                        {deal.probability ===
                        null
                          ? "—"
                          : `${deal.probability}%`}
                      </td>

                      <td>
                        {formatDate(
                          deal.expected_close_date,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-history">
            No deals linked to this
            company.
          </div>
        )}
      </section>


      <section className="card">
        <div className="page-header">
            <div>
            <h2>
                Recent Activities
            </h2>

            <p>
                Latest activity involving
                this company.
            </p>
            </div>

            <Link
            className="primary-button"
            to={`/activities?company_id=${company.id}&new=1`}
            >
            + Add Activity
            </Link>
        </div>


        {activities.length ? (
          <div className="table-wrapper">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Type</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {activities
                  .slice(0, 10)
                  .map(
                    (activity) => (
                      <tr
                        key={
                          activity.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              activity.subject
                            }
                          </strong>
                        </td>

                        <td>
                          {activity.type
                            .charAt(0)
                            .toUpperCase() +
                            activity.type.slice(
                              1,
                            )}
                        </td>

                        <td>
                          {formatDateTime(
                            activity.due_at,
                          )}
                        </td>

                        <td>
                          {activity.completed_at
                            ? "Completed"
                            : "Open"}
                        </td>
                      </tr>
                    ),
                  )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-history">
            No activities linked to
            this company.
          </div>
        )}
      </section>
    </>
  );
}