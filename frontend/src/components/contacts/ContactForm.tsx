import type {
  FormEventHandler,
} from "react";

import {
  memberName,
} from "../../lib/crm";

import type {
  Company,
  WorkspaceMember,
} from "../../types/crm";


export type ContactFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile_phone: string;
  job_title: string;
  department: string;
  linkedin_url: string;
  description: string;

  company_id: string;
  owner_membership_id: string;

  address_line1: string;
  address_line2: string;
  city: string;
  state_region: string;
  postal_code: string;
  country: string;
};


export const emptyContactForm:
  ContactFormData = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile_phone: "",
    job_title: "",
    department: "",
    linkedin_url: "",
    description: "",

    company_id: "",
    owner_membership_id: "",

    address_line1: "",
    address_line2: "",
    city: "",
    state_region: "",
    postal_code: "",
    country: "",
  };


type Props = {
  form: ContactFormData;
  companies: Company[];
  members: WorkspaceMember[];
  canManageOwners: boolean;
  saving: boolean;
  error: string;

  onChange: (
    field: keyof ContactFormData,
    value: string,
  ) => void;

  onSubmit:
    FormEventHandler<HTMLFormElement>;

  onCancel: () => void;
};


export default function ContactForm({
  form,
  companies,
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
            Personal Information
          </h3>

          <p>
            Basic contact details.
          </p>
        </div>


        <div className="form-row">
          <label>
            First name *

            <input
              required
              maxLength={100}
              value={form.first_name}
              onChange={(event) =>
                onChange(
                  "first_name",
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            Last name

            <input
              maxLength={100}
              value={form.last_name}
              onChange={(event) =>
                onChange(
                  "last_name",
                  event.target.value,
                )
              }
            />
          </label>
        </div>


        <div className="form-row">
          <label>
            Email

            <input
              type="email"
              maxLength={320}
              value={form.email}
              onChange={(event) =>
                onChange(
                  "email",
                  event.target.value,
                )
              }
            />
          </label>

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
        </div>


        <div className="form-row">
          <label>
            Mobile phone

            <input
              type="tel"
              maxLength={50}
              value={form.mobile_phone}
              onChange={(event) =>
                onChange(
                  "mobile_phone",
                  event.target.value,
                )
              }
            />
          </label>

          <label>
            LinkedIn

            <input
              maxLength={500}
              value={form.linkedin_url}
              onChange={(event) =>
                onChange(
                  "linkedin_url",
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
            Work Information
          </h3>

          <p>
            Company and role details.
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
            Job title

            <input
              maxLength={150}
              value={form.job_title}
              onChange={(event) =>
                onChange(
                  "job_title",
                  event.target.value,
                )
              }
            />
          </label>
        </div>


        <div className="form-row">
          <label>
            Department

            <input
              maxLength={150}
              value={form.department}
              onChange={(event) =>
                onChange(
                  "department",
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
            Optional contact location.
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
              value={form.postal_code}
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
            : "Save Contact"}
        </button>
      </div>
    </form>
  );
}