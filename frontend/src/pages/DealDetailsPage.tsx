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
  DealStageHistory,
} from "../types/crm";


export default function DealDetailsPage() {
  const {
    dealId,
  } = useParams();

  const {
    workspace,
  } =
    useOutletContext<AppOutletContext>();

  const [
    deal,
    setDeal,
  ] = useState<Deal | null>(
    null,
  );

  const [
    company,
    setCompany,
  ] = useState<Company | null>(
    null,
  );

  const [
    contact,
    setContact,
  ] = useState<Contact | null>(
    null,
  );

  const [
    history,
    setHistory,
  ] = useState<
    DealStageHistory[]
  >([]);

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


  const loadDeal =
    useCallback(
      async () => {
        if (!dealId) {
          setError(
            "Deal not found.",
          );
          setLoading(false);
          return;
        }

        setLoading(true);
        setError("");

        try {
          const dealData =
            await apiRequest<Deal>(
              `/workspaces/${workspace.workspace_id}/deals/${dealId}`,
            );

          const [
            companyData,
            contactData,
            historyData,
            activityData,
          ] = await Promise.all([
            dealData.company_id
              ? apiRequest<Company>(
                  `/workspaces/${workspace.workspace_id}/companies/${dealData.company_id}`,
                )
              : Promise.resolve(null),

            dealData.contact_id
              ? apiRequest<Contact>(
                  `/workspaces/${workspace.workspace_id}/contacts/${dealData.contact_id}`,
                )
              : Promise.resolve(null),

            apiRequest<
              DealStageHistory[]
            >(
              `/workspaces/${workspace.workspace_id}/deals/${dealId}/stage-history`,
            ),

            apiRequest<Activity[]>(
              `/workspaces/${workspace.workspace_id}/activities?deal_id=${dealId}&limit=100&sort_by=created_at&sort_order=desc`,
            ),
          ]);

          setDeal(dealData);
          setCompany(companyData);
          setContact(contactData);
          setHistory(historyData);
          setActivities(
            activityData,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load deal",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        dealId,
        workspace.workspace_id,
      ],
    );


  useEffect(() => {
    void loadDeal();
  }, [loadDeal]);


  if (loading) {
    return (
      <div className="placeholder-card">
        Loading deal...
      </div>
    );
  }


  if (
    error ||
    !deal
  ) {
    return (
      <section className="card">
        <div className="data-error">
          {error ||
            "Deal not found."}
        </div>

        <Link
          className="secondary-button"
          to="/deals"
        >
          Back to Deals
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
            to="/deals"
          >
            ← Deals
          </Link>

          <h1>
            {deal.name}
          </h1>

          <p>
            Sales opportunity
          </p>
        </div>
      </div>


      <section className="card">
        <div className="form-section-heading">
          <h2>
            Deal Information
          </h2>

          <p>
            Main opportunity details.
          </p>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Stage
            </strong>

            <p>
              <span
                className={
                  `deal-stage-badge stage-${deal.stage}`
                }
              >
                {deal.stage
                  .charAt(0)
                  .toUpperCase() +
                  deal.stage.slice(1)}
              </span>
            </p>
          </div>

          <div>
            <strong>
              Amount
            </strong>

            <p>
              {formatCurrency(
                deal.amount,
              )}
            </p>
          </div>
        </div>


        <div className="form-row">
          <div>
            <strong>
              Probability
            </strong>

            <p>
              {deal.probability ===
              null
                ? "—"
                : `${deal.probability}%`}
            </p>
          </div>

          <div>
            <strong>
              Expected Close
            </strong>

            <p>
              {formatDate(
                deal.expected_close_date,
              )}
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
              Contact
            </strong>

            <p>
              {contact ? (
                <Link
                  to={`/contacts/${contact.id}`}
                >
                  {contactName(
                    contact,
                  )}
                </Link>
              ) : (
                "—"
              )}
            </p>
          </div>
        </div>


        {deal.description && (
          <div>
            <strong>
              Description
            </strong>

            <p>
              {deal.description}
            </p>
          </div>
        )}
      </section>


      <section className="card">
        <div className="form-section-heading">
          <h2>
            Stage History
          </h2>

          <p>
            Previous deal stage changes.
          </p>
        </div>


        {history.length ? (
          <div className="table-wrapper">
            <table className="deal-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Changed</th>
                </tr>
              </thead>

              <tbody>
                {history.map(
                  (item) => (
                    <tr key={item.id}>
                      <td>
                        {item.from_stage
                          .charAt(0)
                          .toUpperCase() +
                          item.from_stage.slice(
                            1,
                          )}
                      </td>

                      <td>
                        <span
                          className={
                            `deal-stage-badge stage-${item.to_stage}`
                          }
                        >
                          {item.to_stage
                            .charAt(0)
                            .toUpperCase() +
                            item.to_stage.slice(
                              1,
                            )}
                        </span>
                      </td>

                      <td>
                        {formatDateTime(
                          item.created_at,
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
            No stage changes recorded.
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
                this deal.
            </p>
            </div>

            <Link
            className="primary-button"
            to={`/activities?company_id=${deal.company_id ?? ""}&contact_id=${deal.contact_id ?? ""}&deal_id=${deal.id}&new=1`}
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
            this deal.
          </div>
        )}
      </section>
    </>
  );
}