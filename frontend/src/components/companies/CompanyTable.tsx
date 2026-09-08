import {
  Link,
} from "react-router-dom";

import type {
  Company,
} from "../../types/crm";

import {
  formatCurrency,
  formatDate,
} from "../../lib/crm";


type Props = {
  companies: Company[];

  ownerName: (
    company: Company,
  ) => string;

  onEdit: (
    company: Company,
  ) => void;

  onDelete: (
    company: Company,
  ) => void;
};


function websiteUrl(
  value: string,
) {
  return value.startsWith("http")
    ? value
    : `https://${value}`;
}


export default function CompanyTable({
  companies,
  ownerName,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="table-wrapper">
      <table className="company-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Industry</th>
            <th>Phone</th>
            <th>Location</th>
            <th>Revenue</th>
            <th>Owner</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {companies.map(
            (company) => (
              <tr key={company.id}>
                <td>
                  <div className="company-name-cell">
                    <div className="company-initial">
                      {company.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        <Link
                          to={`/companies/${company.id}`}
                        >
                          {company.name}
                        </Link>
                      </strong>

                      {company.website ? (
                        <a
                          href={websiteUrl(
                            company.website,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {company.domain ||
                            company.website}
                        </a>
                      ) : (
                        <span>
                          {company.domain ||
                            "No domain"}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td>
                  {company.industry || "—"}
                </td>

                <td>
                  {company.phone || "—"}
                </td>

                <td>
                  {[
                    company.city,
                    company.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </td>

                <td>
                  {formatCurrency(
                    company.annual_revenue,
                  )}
                </td>

                <td>
                  <span
                    className={
                      company.owner_membership_id
                        ? "owner-badge"
                        : "owner-badge unassigned"
                    }
                  >
                    {ownerName(company)}
                  </span>
                </td>

                <td>
                  {formatDate(
                    company.updated_at,
                  )}
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-edit-button"
                      onClick={() =>
                        onEdit(company)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="table-delete-button"
                      onClick={() =>
                        onDelete(company)
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