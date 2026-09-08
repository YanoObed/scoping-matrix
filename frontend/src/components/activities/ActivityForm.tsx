import type {
  FormEventHandler,
} from "react";

import {
  contactName,
  memberName,
} from "../../lib/crm";

import type {
  ActivityType,
  Company,
  Contact,
  Deal,
  WorkspaceMember,
} from "../../types/crm";


export type ActivityFormData = {
  type: ActivityType;
  subject: string;
  description: string;

  due_at: string;
  completed_at: string;

  company_id: string;
  contact_id: string;
  deal_id: string;
  owner_membership_id: string;
};


export const emptyActivityForm:
  ActivityFormData = {
    type: "task",
    subject: "",
    description: "",

    due_at: "",
    completed_at: "",

    company_id: "",
    contact_id: "",
    deal_id: "",
    owner_membership_id: "",
  };


const types: {
  value: ActivityType;
  label: string;
}[] = [
  {
    value: "call",
    label: "Call",
  },
  {
    value: "email",
    label: "Email",
  },
  {
    value: "meeting",
    label: "Meeting",
  },
  {
    value: "task",
    label: "Task",
  },
  {
    value: "note",
    label: "Note",
  },
];


type Props = {
  form: ActivityFormData;

  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  members: WorkspaceMember[];

  canManageOwners: boolean;
  saving: boolean;
  error: string;

  onChange: (
    field: keyof ActivityFormData,
    value: string,
  ) => void;

  onSubmit:
    FormEventHandler<HTMLFormElement>;

  onCancel: () => void;
};


export default function ActivityForm({
  form,
  companies,
  contacts,
  deals,
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


  const availableDeals =
    deals.filter(
      (deal) =>
        (!form.company_id ||
          deal.company_id ===
            form.company_id) &&
        (!form.contact_id ||
          deal.contact_id ===
            form.contact_id),
    );


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
            Activity
          </h3>

          <p>
            Activity details.
          </p>
        </div>


        <div className="form-row">
          <label>
            Type *

            <select
              value={form.type}
              onChange={(event) =>
                onChange(
                  "type",
                  event.target.value,
                )
              }
            >
              {types.map(
                (type) => (
                  <option
                    key={type.value}
                    value={type.value}
                  >
                    {type.label}
                  </option>
                ),
              )}
            </select>
          </label>


          {canManageOwners ? (
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
          ) : (
            <div />
          )}
        </div>


        <label>
          Subject *

          <input
            required
            maxLength={255}
            value={form.subject}
            onChange={(event) =>
              onChange(
                "subject",
                event.target.value,
              )
            }
          />
        </label>


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


      <div className="form-section">
        <div className="form-section-heading">
          <h3>
            Related Records
          </h3>

          <p>
            Link to CRM records.
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


        <label>
          Deal

          <select
            value={form.deal_id}
            onChange={(event) =>
              onChange(
                "deal_id",
                event.target.value,
              )
            }
          >
            <option value="">
              No Deal
            </option>

            {availableDeals.map(
              (deal) => (
                <option
                  key={deal.id}
                  value={deal.id}
                >
                  {deal.name}
                </option>
              ),
            )}
          </select>
        </label>
      </div>


      <div className="form-section">
        <div className="form-section-heading">
          <h3>
            Schedule
          </h3>

          <p>
            Due and completion time.
          </p>
        </div>


        <div className="form-row">
          <label>
            Due date & time

            <input
              type="datetime-local"
              value={form.due_at}
              onChange={(event) =>
                onChange(
                  "due_at",
                  event.target.value,
                )
              }
            />
          </label>


          <label>
            Completed date & time

            <input
              type="datetime-local"
              value={
                form.completed_at
              }
              onChange={(event) =>
                onChange(
                  "completed_at",
                  event.target.value,
                )
              }
            />
          </label>
        </div>
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
            : "Save Activity"}
        </button>
      </div>
    </form>
  );
}