import { useState } from "react";
import type { FormEventHandler } from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { apiRequest } from "../lib/api";
import { AuthContainer } from "./LoginPage";


export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token") ?? "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit: FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!token) {
        setError(
          "This password reset link is invalid.",
        );

        return;
      }

      if (
        password !== confirmPassword
      ) {
        setError(
          "Passwords do not match.",
        );

        return;
      }

      setLoading(true);

      try {
        await apiRequest(
          "/auth/reset-password",
          {
            method: "POST",
            body: JSON.stringify({
              token,
              new_password: password,
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
            : "Unable to reset password",
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <AuthContainer
      title="Create a new password"
      description="Choose a secure password for your Scoping Matrix account."
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

        {!token && (
          <div className="form-error">
            This reset link does not
            contain a valid token.
          </div>
        )}

        <label>
          New password

          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value,
              )
            }
          />
        </label>

        <label>
          Confirm password

          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value,
              )
            }
          />
        </label>

        <button
          type="submit"
          className="auth-submit"
          disabled={
            loading || !token
          }
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>

        <p className="auth-switch">
          <Link to="/login">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthContainer>
  );
}