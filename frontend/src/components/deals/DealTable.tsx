import {
  Link,
} from "react-router-dom";

import type {
  Company,
  Contact,
  Deal,
  DealStage,
} from "../../types/crm";

import {
  contactName,
  formatCurrency,
  formatDate,
} from "../../lib/crm";


type Props = {
  deals: Deal[];
  companies: Company[];
  contacts: Contact[];

  ownerName: (
    deal: Deal,
  ) => string;

  onEdit: (
    deal: Deal,
  ) => void;

  onDelete: (
    deal: Deal,
  ) => void;

  onHistory: (
    deal: Deal,
  ) => void;
};


function stageLabel(
  stage: DealStage,
) {
  return (
    stage.charAt(0).toUpperCase() +
    stage.slice(1)
  );
}


export default function DealTable({
  deals,
  companies,
  contacts,
  ownerName,
  onEdit,
  onDelete,
  onHistory,
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


  return (
    <div className="table-wrapper">
      <table className="deal-table">
        <thead>
          <tr>
            <th>Deal</th>
            <th>Company</th>
            <th>Contact</th>
            <th>Stage</th>
            <th>Amount</th>
            <th>Probability</th>
            <th>Close Date</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {deals.map(
            (deal) => (
              <tr key={deal.id}>
                <td>
                  <div className="deal-name-cell">
                    <strong>
                      <Link
                        to={`/deals/${deal.id}`}
                      >
                        {deal.name}
                      </Link>
                    </strong>

                    <span>
                      Updated{" "}
                      {formatDate(
                        deal.updated_at,
                      )}
                    </span>
                  </div>
                </td>


                <td>
                  {deal.company_id ? (
                    <Link
                      to={`/companies/${deal.company_id}`}
                    >
                      {companyNames.get(
                        deal.company_id,
                      ) || "Company"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>


                <td>
                  {deal.contact_id ? (
                    <Link
                      to={`/contacts/${deal.contact_id}`}
                    >
                      {contactNames.get(
                        deal.contact_id,
                      ) || "Contact"}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>


                <td>
                  <button
                    type="button"
                    className={
                      `deal-stage-badge stage-${deal.stage}`
                    }
                    onClick={() =>
                      onHistory(deal)
                    }
                  >
                    {stageLabel(
                      deal.stage,
                    )}
                  </button>
                </td>


                <td>
                  <strong className="deal-amount">
                    {formatCurrency(
                      deal.amount,
                    )}
                  </strong>
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


                <td>
                  <span
                    className={
                      deal.owner_membership_id
                        ? "owner-badge"
                        : "owner-badge unassigned"
                    }
                  >
                    {ownerName(
                      deal,
                    )}
                  </span>
                </td>


                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-history-button"
                      onClick={() =>
                        onHistory(
                          deal,
                        )
                      }
                    >
                      History
                    </button>

                    <button
                      type="button"
                      className="table-edit-button"
                      onClick={() =>
                        onEdit(
                          deal,
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
                          deal,
                        )
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