import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">
            Simple. Visual. Connected.
          </span>

          <h1>
            Manage your customer
            relationships with clarity.
          </h1>

          <p>
            Scoping Matrix brings your
            companies, contacts, deals,
            activities, and team into one
            organized workspace.
          </p>

          <div className="hero-actions">
            <Link
              to="/register"
              className="hero-primary"
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="hero-secondary"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-dashboard-card">
            <div className="mini-header">
              <div>
                <strong>
                  Sales Overview
                </strong>
                <span>
                  This month
                </span>
              </div>

              <span className="mini-badge">
                +18.4%
              </span>
            </div>

            <div className="mini-metrics">
              <div>
                <span>
                  Pipeline
                </span>
                <strong>
                  $284K
                </strong>
              </div>

              <div>
                <span>
                  Deals
                </span>
                <strong>
                  19
                </strong>
              </div>

              <div>
                <span>
                  Activities
                </span>
                <strong>
                  31
                </strong>
              </div>
            </div>

            <div className="mini-chart">
              <span style={{ height: "38%" }} />
              <span style={{ height: "55%" }} />
              <span style={{ height: "48%" }} />
              <span style={{ height: "72%" }} />
              <span style={{ height: "68%" }} />
              <span style={{ height: "92%" }} />
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <article>
          <div className="feature-icon blue">
            01
          </div>

          <h2>
            Know your customers
          </h2>

          <p>
            Keep companies and contacts
            organized in one workspace.
          </p>
        </article>

        <article>
          <div className="feature-icon orange">
            02
          </div>

          <h2>
            Track every opportunity
          </h2>

          <p>
            Follow deals from lead through
            negotiation and close.
          </p>
        </article>

        <article>
          <div className="feature-icon red">
            03
          </div>

          <h2>
            Stay on top of work
          </h2>

          <p>
            Manage calls, meetings, tasks,
            notes, and follow-ups.
          </p>
        </article>
      </section>
    </div>
  );
}