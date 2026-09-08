import { useState } from "react";
import type { FormEventHandler, ReactNode } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  apiRequest,
  setAccessToken,
} from "../lib/api";


type TokenResponse = {
  access_token: string;
  token_type: string;
};


export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit: FormEventHandler<HTMLFormElement> =
    async (event) => {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        const response =
          await apiRequest<TokenResponse>(
            "/auth/login",
            {
              method: "POST",
              body: JSON.stringify({
                email,
                password,
              }),
            },
          );

        setAccessToken(
          response.access_token,
        );

        const destination =
          (
            location.state as {
              from?: string;
            } | null
          )?.from ?? "/dashboard";

        navigate(
          destination,
          {
            replace: true,
          },
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to sign in",
        );
      } finally {
        setLoading(false);
      }
    };


  return (
    <AuthContainer
      title="Welcome back"
      description="Sign in to your Scoping Matrix workspace."
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

        <label>
          Password

          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </label>

        <div className="auth-between">
          <span />

          <Link to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading
            ? "Signing in..."
            : "Sign In"}
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </form>
    </AuthContainer>
  );
}


type AuthContainerProps = {
  title: string;
  description: string;
  children: ReactNode;
};


export function AuthContainer({
  title,
  description,
  children,
}: AuthContainerProps) {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-heading">
          <span className="auth-logo">
            SM
          </span>

          <h1>{title}</h1>

          <p>{description}</p>
        </div>

        {children}
      </div>
    </section>
  );
}