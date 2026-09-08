import { useState } from "react";
import type { FormEventHandler } from "react";

import { Link } from "react-router-dom";

import { apiRequest } from "../lib/api";
import { AuthContainer } from "./LoginPage";


type ForgotPasswordResponse = {
  message: string;
};


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit: FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");
      setLoading(true);

      try {
        const response =
          await apiRequest<ForgotPasswordResponse>(
            "/auth/forgot-password",
            {
              method: "POST",
              body: JSON.stringify({
                email,
              }),
            },
          );

        setMessage(
          response.message,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to process request",
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <AuthContainer
      title="Forgot password?"
      description="Enter your email and we will send you a secure reset link."
    >
      <form
        className="auth-form"
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

        <label>
          Email address

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </label>

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send Reset Link"}
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