import {
  Link,
} from "react-router-dom";

import type {
  Activity,
  Company,
  Contact,
  Deal,
} from "../../types/crm";

import {
  contactName,
  formatDateTime,
} from "../../lib/crm";


type Props = {
  activities: Activity[];
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];

  ownerName: (
    activity: Activity,
  ) => string;

  onEdit: (
    activity: Activity,
  ) => void;

  onDelete: (
    activity: Activity,
  ) => void;

  onToggleComplete: (
    activity: Activity,
  ) => void;
};


function typeLabel(
  value: Activity["type"],
) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


export default function ActivityTable({
  activities,
  companies,
  contacts,
  deals,
  ownerName,
  onEdit,
  onDelete,
  onToggleComplete,
}: Props) {
  const companyNames =
    new Map(
      companies.map(
        (company) => [
          company.id,
          company.name,
        ],
      ),
    );

  const contactNames =
    new Map(
      contacts.map(
        (contact) => [
          contact.id,
          contactName(contact),
        ],
      ),
    );

  const dealNames =
    new Map(
      deals.map(
        (deal) => [
          deal.id,
          deal.name,
        ],
      ),
    );


  return (
    <div className="table-wrapper">
      <table className="activity-table">
        <thead>
          <tr>
            <th>Activity</th>
            <th>Type</th>
            <th>Related To</th>
            <th>Due</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {activities.map(
            (activity) => {
              const related = [
                activity.company_id
                  ? {
                      label:
                        companyNames.get(
                          activity.company_id,
                        ) || "Company",

                      to:
                        `/companies/${activity.company_id}`,
                    }
                  : null,

                activity.contact_id
                  ? {
                      label:
                        contactNames.get(
                          activity.contact_id,
                        ) || "Contact",

                      to:
                        `/contacts/${activity.contact_id}`,
                    }
                  : null,

                activity.deal_id
                  ? {
                      label:
                        dealNames.get(
                          activity.deal_id,
                        ) || "Deal",

                      to:
                        `/deals/${activity.deal_id}`,
                    }
                  : null,
              ].filter(
                (
                  item,
                ): item is {
                  label: string;
                  to: string;
                } => item !== null,
              );


              return (
                <tr key={activity.id}>
                  <td>
                    <div className="activity-subject-cell">
                      <strong>
                        {activity.subject}
                      </strong>

                      {activity.description && (
                        <span>
                          {
                            activity.description
                          }
                        </span>
                      )}
                    </div>
                  </td>


                  <td>
                    <span
                      className={
                        `activity-type-badge type-${activity.type}`
                      }
                    >
                      {typeLabel(
                        activity.type,
                      )}
                    </span>
                  </td>


                  <td>
                    {related.length ? (
                      <div className="activity-related">
                        {related.map(
                          (item) => (
                            <Link
                              key={
                                item.to
                              }
                              to={
                                item.to
                              }
                            >
                              {
                                item.label
                              }
                            </Link>
                          ),
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>


                  <td>
                    {formatDateTime(
                      activity.due_at,
                    )}
                  </td>


                  <td>
                    <span
                      className={
                        activity.completed_at
                          ? "activity-status completed"
                          : "activity-status pending"
                      }
                    >
                      {activity.completed_at
                        ? "Completed"
                        : "Open"}
                    </span>
                  </td>


                  <td>
                    <span
                      className={
                        activity.owner_membership_id
                          ? "owner-badge"
                          : "owner-badge unassigned"
                      }
                    >
                      {ownerName(
                        activity,
                      )}
                    </span>
                  </td>


                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-complete-button"
                        onClick={() =>
                          onToggleComplete(
                            activity,
                          )
                        }
                      >
                        {activity.completed_at
                          ? "Reopen"
                          : "Complete"}
                      </button>


                      <button
                        type="button"
                        className="table-edit-button"
                        onClick={() =>
                          onEdit(
                            activity,
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        className="table-delete-button"
                        onClick={() =>
                          onDelete(
                            activity,
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>
    </div>
  );
}