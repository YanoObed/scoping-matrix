import {
  useEffect,
  useState,
} from "react";

import type {
  FormEventHandler,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import type {
  AppOutletContext,
} from "../layouts/AppLayout";

import {
  apiRequest,
} from "../lib/api";


export default function ProfilePage() {
  const {
    user,
    setUser,
  } =
    useOutletContext<AppOutletContext>();

  const [form, setForm] =
    useState({
      first_name:
        user.first_name ?? "",
      last_name:
        user.last_name ?? "",
      email:
        user.email,
      phone:
        user.phone ?? "",
    });

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  useEffect(() => {
    setForm({
      first_name:
        user.first_name ?? "",
      last_name:
        user.last_name ?? "",
      email:
        user.email,
      phone:
        user.phone ?? "",
    });
  }, [user]);


  function updateField(
    field: keyof typeof form,
    value: string,
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }


  const handleSubmit:
    FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");
      setLoading(true);

      try {
        const updatedUser =
          await apiRequest<
            AppOutletContext["user"]
          >(
            "/auth/me",
            {
              method: "PATCH",
              body: JSON.stringify({
                email:
                  form.email,
                first_name:
                  form.first_name ||
                  null,
                last_name:
                  form.last_name ||
                  null,
                phone:
                  form.phone ||
                  null,
              }),
            },
          );

        setUser(updatedUser);

        setMessage(
          "Your profile has been updated.",
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to update profile",
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            My Profile
          </h1>

          <p>
            Update your Scoping Matrix
            account details.
          </p>
        </div>
      </div>


      <div className="profile-grid">
        <section className="card profile-summary">
          <div className="profile-avatar">
            {(
              user.first_name?.[0] ??
              user.email[0]
            ).toUpperCase()}
          </div>

          <h2>
            {[
              user.first_name,
              user.last_name,
            ]
              .filter(Boolean)
              .join(" ") ||
              "Scoping Matrix User"}
          </h2>

          <p>
            {user.email}
          </p>

          {user.phone && (
            <span>
              {user.phone}
            </span>
          )}
        </section>


        <section className="card profile-form-card">
          <div className="card-header">
            <div>
              <h2>
                Personal Details
              </h2>

              <p>
                Keep your contact
                information up to date.
              </p>
            </div>
          </div>


          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >
            {message && (
              <div className="form-success">
                {message}
              </div>
            )}

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}


            <div className="form-row">
              <label>
                First name

                <input
                  type="text"
                  autoComplete="given-name"
                  value={
                    form.first_name
                  }
                  onChange={(event) =>
                    updateField(
                      "first_name",
                      event.target.value,
                    )
                  }
                />
              </label>


              <label>
                Last name

                <input
                  type="text"
                  autoComplete="family-name"
                  value={
                    form.last_name
                  }
                  onChange={(event) =>
                    updateField(
                      "last_name",
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>


            <label>
              Email address

              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
              />
            </label>


            <label>
              Phone number

              <input
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value,
                  )
                }
              />
            </label>


            <div className="profile-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}