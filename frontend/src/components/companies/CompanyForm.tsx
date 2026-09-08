import type {
  FormEventHandler,
} from "react";

import type {
  WorkspaceMember,
} from "../../types/crm";

import {
  memberName,
} from "../../lib/crm";


export type CompanyFormData = {
  name: string;
  domain: string;
  website: string;
  phone: string;
  industry: string;
  employee_count: string;
  annual_revenue: string;
  description: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_region: string;
  postal_code: string;
  country: string;
  owner_membership_id: string;
};


export const emptyCompanyForm:
  CompanyFormData = {
    name: "",
    domain: "",
    website: "",
    phone: "",
    industry: "",
    employee_count: "",
    annual_revenue: "",
    description: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_region: "",
    postal_code: "",
    country: "",
    owner_membership_id: "",
  };


type Props = {
  form: CompanyFormData;
  members: WorkspaceMember[];
  canManageOwners: boolean;
  saving: boolean;
  error: string;

  onChange: (
    field: keyof CompanyFormData,
    value: string,
  ) => void;

  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};


export default function CompanyForm({
  form,
  members,
  canManageOwners,
  saving,
  error,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
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
            Company Information
          </h3>

          <p>
            Basic organization details.
          </p>
        </div>


        <div className="form-row">
          <label>
            Company name *

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

          <label>
            Industry

            <input
              maxLength={150}
              value={form.industry}
              onChange={(event) =>
                onChange(
                  "industry",
                  event.target.value,
                )
              }
            />
          </label>
        </div>


        <div className="form-row">
          <label>
            Domain

            <input
              maxLength={255}
              placeholder="example.com"
              value={form.domain}
              onChange={(event) =>
                onChange(
                  "domain",
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            Website

            <input
              maxLength={500}
              placeholder="https://example.com"
              value={form.website}
              onChange={(event) =>
                onChange(
                  "website",
                  event.target.value,
                )
              }
            />
          </label>
        </div>


        <div className="form-row">
          <label>
            Phone

            <input
              type="tel"
              maxLength={50}
              value={form.phone}
              onChange={(event) =>
                onChange(
                  "phone",
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            Employees

            <input
              type="number"
              min="0"
              step="1"
              value={
                form.employee_count
              }
              onChange={(event) =>
                onChange(
                  "employee_count",
                  event.target.value,
                )
              }
            />
          </label>
        </div>


        <div className="form-row">
          <label>
            Annual revenue

            <input
              type="number"
              min="0"
              step="0.01"
              value={
                form.annual_revenue
              }
              onChange={(event) =>
                onChange(
                  "annual_revenue",
                  event.target.value,
                )
              }
            />
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
          Description

          <textarea
            rows={4}
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
            Address
          </h3>

          <p>
            Optional company location.
          </p>
        </div>


        <label>
          Address line 1

          <input
            maxLength={255}
            value={form.address_line1}
            onChange={(event) =>
              onChange(
                "address_line1",
                event.target.value,
              )
            }
          />
        </label>


        <label>
          Address line 2

          <input
            maxLength={255}
            value={form.address_line2}
            onChange={(event) =>
              onChange(
                "address_line2",
                event.target.value,
              )
            }
          />
        </label>


        <div className="form-row">
          <label>
            City

            <input
              maxLength={100}
              value={form.city}
              onChange={(event) =>
                onChange(
                  "city",
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            State / Region

            <input
              maxLength={100}
              value={
                form.state_region
              }
              onChange={(event) =>
                onChange(
                  "state_region",
                  event.target.value,
                )
              }
            />
          </label>
        </div>


        <div className="form-row">
          <label>
            Postal code

            <input
              maxLength={30}
              value={
                form.postal_code
              }
              onChange={(event) =>
                onChange(
                  "postal_code",
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            Country

            <input
              maxLength={100}
              value={form.country}
              onChange={(event) =>
                onChange(
                  "country",
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
            : "Save Company"}
        </button>
      </div>
    </form>
  );
}