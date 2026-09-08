import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useOutletContext,
} from "react-router-dom";

import type {
  AppOutletContext,
} from "../layouts/AppLayout";

import {
  apiRequest,
} from "../lib/api";

import {
  formatDate,
  formatDateTime,
} from "../lib/crm";

import type {
  Activity,
  Deal,
} from "../types/crm";


type DashboardData = {
  companies: number;
  contacts: number;
  deals: number;
  pipeline_value: number | string;
  activities: number;
  overdue_activities: number;
};


function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat().format(
    value,
  );
}


function formatCurrency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    },
  ).format(value);
}


function stageLabel(
  stage: Deal["stage"],
) {
  return (
    stage.charAt(0).toUpperCase() +
    stage.slice(1)
  );
}


export default function DashboardPage() {
  const {
    user,
    workspace,
  } =
    useOutletContext<AppOutletContext>();

  const [
    dashboard,
    setDashboard,
  ] = useState<DashboardData | null>(
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


  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          dashboardData,
          dealData,
          activityData,
        ] = await Promise.all([
          apiRequest<DashboardData>(
            `/workspaces/${workspace.workspace_id}/dashboard`,
          ),

          apiRequest<Deal[]>(
            `/workspaces/${workspace.workspace_id}/deals?limit=100&sort_by=expected_close_date&sort_order=asc`,
          ),

          apiRequest<Activity[]>(
            `/workspaces/${workspace.workspace_id}/activities?limit=100&sort_by=due_at&sort_order=asc`,
          ),
        ]);

        if (!active) {
          return;
        }

        setDashboard(
          dashboardData,
        );

        setDeals(
          dealData,
        );

        setActivities(
          activityData,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [
    workspace.workspace_id,
  ]);


  const chartData = useMemo(
    () => {
      if (!dashboard) {
        return [];
      }

      return [
        {
          label: "Companies",
          value: dashboard.companies,
          className: "fill-1",
        },
        {
          label: "Contacts",
          value: dashboard.contacts,
          className: "fill-2",
        },
        {
          label: "Deals",
          value: dashboard.deals,
          className: "fill-3",
        },
        {
          label: "Activities",
          value: dashboard.activities,
          className: "fill-4",
        },
      ];
    },
    [dashboard],
  );


  const openDeals =
    useMemo(
      () =>
        deals
          .filter(
            (deal) =>
              deal.stage !== "won" &&
              deal.stage !== "lost",
          )
          .slice(0, 5),
      [deals],
    );


  const openActivities =
    useMemo(
      () =>
        activities
          .filter(
            (activity) =>
              !activity.completed_at &&
              activity.due_at,
          )
          .slice(0, 5),
      [activities],
    );


  const maximumChartValue =
    Math.max(
      1,
      ...chartData.map(
        (item) => item.value,
      ),
    );


  if (loading) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1>
              Dashboard
            </h1>

            <p>
              Loading your workspace
              overview...
            </p>
          </div>
        </div>

        <section className="card placeholder-card">
          Loading dashboard data...
        </section>
      </>
    );
  }


  if (
    error ||
    !dashboard
  ) {
    return (
      <>
        <div className="page-header">
          <div>
            <h1>
              Dashboard
            </h1>

            <p>
              Workspace overview and CRM
              performance.
            </p>
          </div>
        </div>

        <section className="card dashboard-error-card">
          <strong>
            Dashboard could not be loaded.
          </strong>

          <p>
            {error ||
              "No dashboard data is available."}
          </p>
        </section>
      </>
    );
  }


  const pipelineValue =
    Number(
      dashboard.pipeline_value,
    ) || 0;

  const completedActivities =
    Math.max(
      dashboard.activities -
        dashboard.overdue_activities,
      0,
    );

  const overduePercentage =
    dashboard.activities > 0
      ? Math.round(
          (
            dashboard.overdue_activities /
            dashboard.activities
          ) * 100,
        )
      : 0;

  const healthyPercentage =
    dashboard.activities > 0
      ? 100 - overduePercentage
      : 0;

  const firstName =
    user.first_name ||
    user.email.split("@")[0];


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Welcome back, {firstName}.
            Here is the current overview of{" "}
            <strong>
              {workspace.workspace_name}
            </strong>
            .
          </p>
        </div>

        <div className="dashboard-live-badge">
          Live workspace data
        </div>
      </div>


      <section className="metrics-grid">
        <article className="metric-card">
          <span>
            Companies
          </span>

          <strong>
            {formatNumber(
              dashboard.companies,
            )}
          </strong>

          <small>
            Organizations in CRM
          </small>
        </article>


        <article className="metric-card">
          <span>
            Contacts
          </span>

          <strong>
            {formatNumber(
              dashboard.contacts,
            )}
          </strong>

          <small>
            People in CRM
          </small>
        </article>


        <article className="metric-card">
          <span>
            Deals
          </span>

          <strong>
            {formatNumber(
              dashboard.deals,
            )}
          </strong>

          <small>
            Visible opportunities
          </small>
        </article>


        <article className="metric-card">
          <span>
            Pipeline Value
          </span>

          <strong>
            {formatCurrency(
              pipelineValue,
            )}
          </strong>

          <small>
            Current deal pipeline
          </small>
        </article>


        <article className="metric-card">
          <span>
            Activities
          </span>

          <strong>
            {formatNumber(
              dashboard.activities,
            )}
          </strong>

          <small>
            CRM activities
          </small>
        </article>


        <article className="metric-card">
          <span>
            Overdue
          </span>

          <strong
            className={
              dashboard.overdue_activities >
              0
                ? "danger-text"
                : ""
            }
          >
            {formatNumber(
              dashboard.overdue_activities,
            )}
          </strong>

          <small>
            Activities needing attention
          </small>
        </article>
      </section>


      <section className="dashboard-visual-grid">
        <article className="card">
          <div className="card-header">
            <div>
              <h2>
                CRM Overview
              </h2>

              <p>
                Current records in this
                workspace
              </p>
            </div>
          </div>


          <div className="horizontal-chart">
            {chartData.map(
              (item) => {
                const width =
                  (
                    item.value /
                    maximumChartValue
                  ) * 100;

                return (
                  <div
                    className="horizontal-row"
                    key={item.label}
                  >
                    <span>
                      {item.label}
                    </span>

                    <div className="horizontal-track">
                      <div
                        className={
                          `horizontal-fill ${item.className}`
                        }
                        style={{
                          width:
                            `${width}%`,
                        }}
                      />
                    </div>

                    <strong>
                      {formatNumber(
                        item.value,
                      )}
                    </strong>
                  </div>
                );
              },
            )}
          </div>
        </article>


        <article className="card">
          <div className="card-header">
            <div>
              <h2>
                Activity Health
              </h2>

              <p>
                Current overdue activity
                status
              </p>
            </div>
          </div>


          <div className="activity-health">
            <div className="activity-health-summary">
              <strong>
                {healthyPercentage}%
              </strong>

              <span>
                Not overdue
              </span>
            </div>


            <div className="activity-progress">
              <div
                className="activity-progress-safe"
                style={{
                  width:
                    `${healthyPercentage}%`,
                }}
              />

              <div
                className="activity-progress-overdue"
                style={{
                  width:
                    `${overduePercentage}%`,
                }}
              />
            </div>


            <div className="activity-health-details">
              <div>
                <span className="health-dot healthy-dot" />

                <div>
                  <strong>
                    {formatNumber(
                      completedActivities,
                    )}
                  </strong>

                  <span>
                    Not overdue
                  </span>
                </div>
              </div>


              <div>
                <span className="health-dot overdue-dot" />

                <div>
                  <strong>
                    {formatNumber(
                      dashboard.overdue_activities,
                    )}
                  </strong>

                  <span>
                    Overdue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>


      <section className="dashboard-visual-grid">
        <article className="card">
          <div className="page-header">
            <div>
              <h2>
                Open Pipeline
              </h2>

              <p>
                Opportunities still in
                progress.
              </p>
            </div>

            <Link
              className="secondary-button"
              to="/deals"
            >
              View Deals
            </Link>
          </div>


          {openDeals.length ? (
            <div className="table-wrapper">
              <table className="deal-table">
                <thead>
                  <tr>
                    <th>Deal</th>
                    <th>Stage</th>
                    <th>Amount</th>
                    <th>Close</th>
                  </tr>
                </thead>

                <tbody>
                  {openDeals.map(
                    (deal) => (
                      <tr key={deal.id}>
                        <td>
                          <Link
                            to={`/deals/${deal.id}`}
                          >
                            <strong>
                              {deal.name}
                            </strong>
                          </Link>
                        </td>

                        <td>
                          <span
                            className={
                              `deal-stage-badge stage-${deal.stage}`
                            }
                          >
                            {stageLabel(
                              deal.stage,
                            )}
                          </span>
                        </td>

                        <td>
                          {formatCurrency(
                            Number(
                              deal.amount ??
                                0,
                            ),
                          )}
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
              No open deals.
            </div>
          )}
        </article>


        <article className="card">
          <div className="page-header">
            <div>
              <h2>
                Upcoming Activities
              </h2>

              <p>
                Open activities requiring
                follow-up.
              </p>
            </div>

            <Link
              className="secondary-button"
              to="/activities"
            >
              View Activities
            </Link>
          </div>


          {openActivities.length ? (
            <div className="table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Activity</th>
                    <th>Type</th>
                    <th>Due</th>
                  </tr>
                </thead>

                <tbody>
                  {openActivities.map(
                    (activity) => {
                      const overdue =
                        activity.due_at &&
                        new Date(
                          activity.due_at,
                        ).getTime() <
                          Date.now();

                      return (
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
                            <span
                              className={
                                overdue
                                  ? "danger-text"
                                  : ""
                              }
                            >
                              {formatDateTime(
                                activity.due_at,
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-history">
              No upcoming activities.
            </div>
          )}
        </article>
      </section>


      <section className="dashboard-secondary-grid">
        <article className="card dashboard-highlight-card">
          <div className="dashboard-highlight-icon">
            $
          </div>

          <div>
            <span>
              Total Pipeline
            </span>

            <strong>
              {formatCurrency(
                pipelineValue,
              )}
            </strong>

            <p>
              Across{" "}
              {formatNumber(
                dashboard.deals,
              )}{" "}
              current deal
              {dashboard.deals === 1
                ? ""
                : "s"}
              .
            </p>
          </div>
        </article>


        <article className="card dashboard-highlight-card">
          <div className="dashboard-highlight-icon orange">
            !
          </div>

          <div>
            <span>
              Attention Required
            </span>

            <strong
              className={
                dashboard.overdue_activities >
                0
                  ? "danger-text"
                  : ""
              }
            >
              {formatNumber(
                dashboard.overdue_activities,
              )}
            </strong>

            <p>
              Overdue activit
              {dashboard.overdue_activities ===
              1
                ? "y"
                : "ies"}{" "}
              currently require follow-up.
            </p>
          </div>
        </article>
      </section>


      <section className="card dashboard-workspace-card">
        <div className="card-header">
          <div>
            <h2>
              Workspace
            </h2>

            <p>
              Current authenticated CRM
              context
            </p>
          </div>
        </div>


        <div className="workspace-detail-grid">
          <div>
            <span>
              Workspace
            </span>

            <strong>
              {workspace.workspace_name}
            </strong>
          </div>

          <div>
            <span>
              Your Role
            </span>

            <strong className="workspace-role">
              {workspace.role}
            </strong>
          </div>

          <div>
            <span>
              Companies
            </span>

            <strong>
              {formatNumber(
                dashboard.companies,
              )}
            </strong>
          </div>

          <div>
            <span>
              Contacts
            </span>

            <strong>
              {formatNumber(
                dashboard.contacts,
              )}
            </strong>
          </div>
        </div>
      </section>
    </>
  );
}