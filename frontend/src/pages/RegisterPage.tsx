import { useState } from "react";
import type { FormEventHandler } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { apiRequest } from "../lib/api";
import { AuthContainer } from "./LoginPage";


export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    workspace_name: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  function update(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }


  const handleSubmit: FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        await apiRequest(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({
              email: form.email,
              password: form.password,
              first_name:
                form.first_name || null,
              last_name:
                form.last_name || null,
              phone:
                form.phone || null,
              workspace_name:
                form.workspace_name,
            }),
          },
        );

        navigate(
          "/login",
          {
            replace: true,
          },
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to create account",
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <AuthContainer
      title="Create your account"
      description="Create your Scoping Matrix workspace."
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
      >
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
              value={form.first_name}
              onChange={(event) =>
                update(
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
              value={form.last_name}
              onChange={(event) =>
                update(
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
              update(
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
              update(
                "phone",
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Workspace name

          <input
            type="text"
            required
            minLength={2}
            value={form.workspace_name}
            onChange={(event) =>
              update(
                "workspace_name",
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Password

          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(event) =>
              update(
                "password",
                event.target.value,
              )
            }
          />
        </label>

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthContainer>
  );
}