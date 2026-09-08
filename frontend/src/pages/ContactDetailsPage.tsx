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


export default function ContactDetailsPage() {
  const {
    contactId,
  } = useParams();

  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();

  const [
    contact,
    setContact,
  ] = useState<Contact | null>(
    null,
  );

  const [
    company,
    setCompany,
  ] = useState<Company | null>(
    null,
  );

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


  const loadContact =
    useCallback(
      async () => {
        if (!contactId) {
          setError(
            "Contact not found.",
          );
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const contactData =
            await apiRequest<Contact>(
              `/workspaces/${workspace.workspace_id}/contacts/${contactId}`,
            );

          const [
            companyData,
            dealData,
            activityData,
          ] = await Promise.all([
            contactData.company_id
              ? apiRequest<Company>(
                  `/workspaces/${workspace.workspace_id}/companies/${contactData.company_id}`,
                )
              : Promise.resolve(null),

            apiRequest<Deal[]>(
              `/workspaces/${workspace.workspace_id}/deals?contact_id=${contactId}&limit=100&sort_by=created_at&sort_order=desc`,
            ),

            apiRequest<Activity[]>(
              `/workspaces/${workspace.workspace_id}/activities?contact_id=${contactId}&limit=100&sort_by=created_at&sort_order=desc`,
            ),
          ]);

          setContact(
            contactData,
          );

          setCompany(
            companyData,
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
              : "Unable to load contact",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        contactId,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadContact();
  }, [loadContact]);


  if (loading) {
    return (
      <div className="placeholder-card">
        Loading contact...
      </div>
    );
  }


  if (
    error ||
    !contact
  ) {
    return (
      <section className="card">
        <div className="data-error">
          {error ||
            "Contact not found."}
        </div>

        <Link
          className="secondary-button"
          to="/contacts"
        >
          Back to Contacts
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
            to="/contacts"
          >
            ← Contacts
          </Link>

          <h1>
            {contactName(contact)}
          </h1>

          <p>
            {contact.job_title ||
              "Contact record"}
          </p>
        </div>
      </div>


      <section className="card">
        <div className="form-section-heading">
          <h2>
            Contact Information
          </h2>

          <p>
            Main contact details.
          </p>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Email
            </strong>

            <p>
              {contact.email ||
                "—"}
            </p>
          </div>

          <div>
            <strong>
              Phone
            </strong>

            <p>
              {contact.phone ||
                "—"}
            </p>
          </div>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Mobile
            </strong>

            <p>
              {contact.mobile_phone ||
                "—"}
            </p>
          </div>

          <div>
            <strong>
              Department
            </strong>

            <p>
              {contact.department ||
                "—"}
            </p>
          </div>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Company
            </strong>

            <p>
              {company ? (
                <Link
                  to={`/companies/${company.id}`}
                >
                  {company.name}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>

          <div>
            <strong>
              LinkedIn
            </strong>

            <p>
              {contact.linkedin_url ? (
                <a
                  href={
                    contact.linkedin_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Profile
                </a>
              ) : (
                "—"
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
              contact.address_line1,
              contact.address_line2,
              contact.city,
              contact.state_region,
              contact.postal_code,
              contact.country,
            ]
              .filter(Boolean)
              .join(", ") ||
              "—"}
          </p>
        </div>


        {contact.description && (
          <div>
            <strong>
              Description
            </strong>

            <p>
              {
                contact.description
              }
            </p>
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
            to={`/deals?company_id=${contact.company_id ?? ""}&contact_id=${contact.id}&new=1`}
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
            contact.
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
                this contact.
            </p>
            </div>

            <Link
            className="primary-button"
            to={`/activities?company_id=${contact.company_id ?? ""}&contact_id=${contact.id}&new=1`}
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
            this contact.
          </div>
        )}
      </section>
    </>
  );
}