import type {
  FormEventHandler,
} from "react";

import {
  contactName,
  memberName,
} from "../../lib/crm";

import type {
  Company,
  Contact,
  DealStage,
  WorkspaceMember,
} from "../../types/crm";


export type DealFormData = {
  name: string;
  amount: string;
  stage: DealStage;
  probability: string;
  expected_close_date: string;
  description: string;

  company_id: string;
  contact_id: string;
  owner_membership_id: string;
};


export const emptyDealForm:
  DealFormData = {
    name: "",
    amount: "",
    stage: "lead",
    probability: "",
    expected_close_date: "",
    description: "",

    company_id: "",
    contact_id: "",
    owner_membership_id: "",
  };


const stages: {
  value: DealStage;
  label: string;
}[] = [
  {
    value: "lead",
    label: "Lead",
  },
  {
    value: "qualified",
    label: "Qualified",
  },
  {
    value: "proposal",
    label: "Proposal",
  },
  {
    value: "negotiation",
    label: "Negotiation",
  },
  {
    value: "won",
    label: "Won",
  },
  {
    value: "lost",
    label: "Lost",
  },
];


type Props = {
  form: DealFormData;

  companies: Company[];
  contacts: Contact[];
  members: WorkspaceMember[];

  canManageOwners: boolean;
  saving: boolean;
  error: string;

  onChange: (
    field: keyof DealFormData,
    value: string,
  ) => void;

  onSubmit:
    FormEventHandler<HTMLFormElement>;

  onCancel: () => void;
};


export default function DealForm({
  form,
  companies,
  contacts,
  members,
  canManageOwners,
  saving,
  error,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  const availableContacts =
    form.company_id
      ? contacts.filter(
          (contact) =>
            contact.company_id ===
            form.company_id,
        )
      : contacts;


  return (
    <form
      className="company-form"
      onSubmit={onSubmit}
    >
      {error && (
        <div className="form-error">
          {error}
        </div>
      )}


      <div className="form-section">
        <div className="form-section-heading">
          <h3>
            Opportunity
          </h3>

          <p>
            Core deal information.
          </p>
        </div>


        <label>
          Deal name *

          <input
            required
            maxLength={255}
            value={form.name}
            onChange={(event) =>
              onChange(
                "name",
                event.target.value,
              )
            }
          />
        </label>


        <div className="form-row">
          <label>
            Amount

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) =>
                onChange(
                  "amount",
                  event.target.value,
                )
              }
            />
          </label>


          <label>
            Stage

            <select
              value={form.stage}
              onChange={(event) =>
                onChange(
                  "stage",
                  event.target.value,
                )
              }
            >
              {stages.map(
                (stage) => (
                  <option
                    key={stage.value}
                    value={stage.value}
                  >
                    {stage.label}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>


        <div className="form-row">
          <label>
            Probability %

            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.probability}
              onChange={(event) =>
                onChange(
                  "probability",
                  event.target.value,
                )
              }
            />
          </label>


          <label>
            Expected close date

            <input
              type="date"
              value={
                form.expected_close_date
              }
              onChange={(event) =>
                onChange(
                  "expected_close_date",
                  event.target.value,
                )
              }
            />
          </label>
        </div>
      </div>


      <div className="form-section">
        <div className="form-section-heading">
          <h3>
            Relationships
          </h3>

          <p>
            Link the deal to CRM records.
          </p>
        </div>


        <div className="form-row">
          <label>
            Company

            <select
              value={form.company_id}
              onChange={(event) =>
                onChange(
                  "company_id",
                  event.target.value,
                )
              }
            >
              <option value="">
                No Company
              </option>

              {companies.map(
                (company) => (
                  <option
                    key={company.id}
                    value={company.id}
                  >
                    {company.name}
                  </option>
                ),
              )}
            </select>
          </label>


          <label>
            Contact

            <select
              value={form.contact_id}
              onChange={(event) =>
                onChange(
                  "contact_id",
                  event.target.value,
                )
              }
            >
              <option value="">
                No Contact
              </option>

              {availableContacts.map(
                (contact) => (
                  <option
                    key={contact.id}
                    value={contact.id}
                  >
                    {contactName(contact)}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>


        {canManageOwners && (
          <label>
            Owner

            <select
              value={
                form.owner_membership_id
              }
              onChange={(event) =>
                onChange(
                  "owner_membership_id",
                  event.target.value,
                )
              }
            >
              <option value="">
                Unassigned
              </option>

              {members.map(
                (member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {memberName(member)}
                    {" · "}
                    {member.role}
                  </option>
                ),
              )}
            </select>
          </label>
        )}


        <label>
          Description

          <textarea
            rows={5}
            value={form.description}
            onChange={(event) =>
              onChange(
                "description",
                event.target.value,
              )
            }
          />
        </label>
      </div>


      <div className="modal-actions">
        <button
          type="button"
          className="secondary-button"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary-button"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Deal"}
        </button>
      </div>
    </form>
  );
}