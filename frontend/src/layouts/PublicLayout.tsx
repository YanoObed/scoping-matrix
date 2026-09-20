import {
  Link,
  Outlet,
} from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <Link
          to="/"
          className="public-brand"
        >
          <span className="public-brand-mark">
            SM
          </span>

          <span>
            <strong>
              Scoping Matrix
            </strong>

            <small>
              Customer Relationship Management
            </small>
          </span>
        </Link>

        <nav className="public-navigation">
          <Link
            to="/login"
            className="text-button"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="header-button"
          >
            Create Account
          </Link>
        </nav>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div>
          <strong>
            Scoping Matrix
          </strong>

          <span>
            Organize relationships.
            Track opportunities.
            Grow with clarity.
          </span>
        </div>

        <div className="footer-links">
          <span>
            © 2026 Scoping Matrix · Obadia Yano
          </span>

          <a href="#privacy">
            Privacy
          </a>

          <a href="#terms">
            Terms
          </a>

          <a href="mailto:obadiayano45@gmail.com">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}