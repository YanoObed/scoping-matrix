import type {
  Company,
  Contact,
} from "../../types/crm";

import {
  contactName,
  formatDate,
} from "../../lib/crm";

import {
  Link,
} from "react-router-dom";


type Props = {
  contacts: Contact[];
  companies: Company[];
  ownerName: (
    contact: Contact,
  ) => string;
  onEdit: (
    contact: Contact,
  ) => void;
  onDelete: (
    contact: Contact,
  ) => void;
};


export default function ContactTable({
  contacts,
  companies,
  ownerName,
  onEdit,
  onDelete,
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


  return (
    <div className="table-wrapper">
      <table className="contact-table">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Company</th>
            <th>Job</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Owner</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map(
            (contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="company-name-cell">
                    <div className="company-initial">
                      {[
                        contact.first_name[0],
                        contact.last_name?.[0],
                      ]
                        .filter(Boolean)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        <Link
                          to={`/contacts/${contact.id}`}
                        >
                          {contactName(contact)}
                        </Link>
                      </strong>

                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <span>
                          No email
                        </span>
                      )}
                    </div>
                  </div>
                </td>


                <td>
                  {contact.company_id
                    ? companyNames.get(
                        contact.company_id,
                      ) || "Company"
                    : "—"}
                </td>


                <td>
                  <div className="contact-job-cell">
                    <strong>
                      {contact.job_title ||
                        "—"}
                    </strong>

                    {contact.department && (
                      <span>
                        {
                          contact.department
                        }
                      </span>
                    )}
                  </div>
                </td>


                <td>
                  {contact.phone ||
                    contact.mobile_phone ||
                    "—"}
                </td>


                <td>
                  {[
                    contact.city,
                    contact.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>


                <td>
                  <span
                    className={
                      contact.owner_membership_id
                        ? "owner-badge"
                        : "owner-badge unassigned"
                    }
                  >
                    {ownerName(contact)}
                  </span>
                </td>


                <td>
                  {formatDate(
                    contact.updated_at,
                  )}
                </td>


                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-edit-button"
                      onClick={() =>
                        onEdit(contact)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="table-delete-button"
                      onClick={() =>
                        onDelete(contact)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}