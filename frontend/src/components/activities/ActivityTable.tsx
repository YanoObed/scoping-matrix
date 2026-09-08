import {
  Link,
} from "react-router-dom";

import {
  contactName,
  formatDateTime,
} from "../../lib/crm";

import type {
  Activity,
  Company,
  Contact,
  Deal,
} from "../../types/crm";


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


function labelType(
  value: string,
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
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>
              Subject
            </th>

            <th>
              Type
            </th>

            <th>
              Related To
            </th>

            <th>
              Due
            </th>

            <th>
              Status
            </th>

            <th>
              Owner
            </th>

            <th>
              Actions
            </th>
          </tr>
        </thead>


        <tbody>
          {activities.map(
            (activity) => {
              const company =
                activity.company_id
                  ? companies.find(
                      (item) =>
                        item.id ===
                        activity.company_id,
                    )
                  : undefined;

              const contact =
                activity.contact_id
                  ? contacts.find(
                      (item) =>
                        item.id ===
                        activity.contact_id,
                    )
                  : undefined;

              const deal =
                activity.deal_id
                  ? deals.find(
                      (item) =>
                        item.id ===
                        activity.deal_id,
                    )
                  : undefined;


              const overdue =
                !activity.completed_at &&
                Boolean(
                  activity.due_at,
                ) &&
                new Date(
                  activity.due_at as string,
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
                    {labelType(
                      activity.type,
                    )}
                  </td>


                  <td>
                    <div className="activity-related-links">
                      {company && (
                        <Link
                          to={`/companies/${company.id}`}
                        >
                          {
                            company.name
                          }
                        </Link>
                      )}


                      {contact && (
                        <Link
                          to={`/contacts/${contact.id}`}
                        >
                          {contactName(
                            contact,
                          )}
                        </Link>
                      )}


                      {deal && (
                        <Link
                          to={`/deals/${deal.id}`}
                        >
                          {
                            deal.name
                          }
                        </Link>
                      )}


                      {!company &&
                        !contact &&
                        !deal && (
                          <span>
                            —
                          </span>
                        )}
                    </div>
                  </td>


                  <td>
                    {activity.due_at
                      ? formatDateTime(
                          activity.due_at,
                        )
                      : "—"}
                  </td>


                  <td>
                    <span
                      className={
                        activity.completed_at
                          ? "activity-status completed"
                          : overdue
                            ? "activity-status overdue"
                            : "activity-status pending"
                      }
                    >
                      {activity.completed_at
                        ? "Completed"
                        : overdue
                          ? "Overdue"
                          : "Open"}
                    </span>
                  </td>


                  <td>
                    {ownerName(
                      activity,
                    )}
                  </td>


                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="text-action-button"
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
                        className="text-action-button"
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
                        className="text-action-button danger-text"
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