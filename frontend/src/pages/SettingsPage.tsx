import {
  Link,
  useOutletContext,
} from "react-router-dom";

import type {
  AppOutletContext,
} from "../layouts/AppLayout";


function roleLabel(
  role: string,
) {
  return (
    role.charAt(0).toUpperCase() +
    role.slice(1)
  );
}


export default function SettingsPage() {
  const {
    user,
    workspace,
  } =
    useOutletContext<AppOutletContext>();


  return (
    <>
      <div className="page-header">
        <div>
          <h1>
            Settings
          </h1>

          <p>
            Account and workspace
            information for Scoping Matrix.
          </p>
        </div>
      </div>


      <section className="card dashboard-workspace-card">
        <div className="card-header">
          <div>
            <h2>
              Workspace
            </h2>

            <p>
              Current workspace
              configuration.
            </p>
          </div>
        </div>


        <div className="workspace-detail-grid">
          <div>
            <span>
              Workspace Name
            </span>

            <strong>
              {workspace.workspace_name}
            </strong>
          </div>


          <div>
            <span>
              Workspace Slug
            </span>

            <strong>
              {workspace.workspace_slug}
            </strong>
          </div>


          <div>
            <span>
              Your Role
            </span>

            <strong className="workspace-role">
              {roleLabel(
                workspace.role,
              )}
            </strong>
          </div>


          <div>
            <span>
              Membership
            </span>

            <strong>
              Active
            </strong>
          </div>
        </div>
      </section>


      <section className="card dashboard-workspace-card">
        <div className="card-header">
          <div>
            <h2>
              Account
            </h2>

            <p>
              Your Scoping Matrix
              account information.
            </p>
          </div>

          <Link
            to="/profile"
            className="primary-button"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Edit Profile
          </Link>
        </div>


        <div className="workspace-detail-grid">
          <div>
            <span>
              Name
            </span>

            <strong>
              {[
                user.first_name,
                user.last_name,
              ]
                .filter(Boolean)
                .join(" ") ||
                "Not provided"}
            </strong>
          </div>


          <div>
            <span>
              Email
            </span>

            <strong>
              {user.email}
            </strong>
          </div>


          <div>
            <span>
              Phone
            </span>

            <strong>
              {user.phone ||
                "Not provided"}
            </strong>
          </div>


          <div>
            <span>
              Account Status
            </span>

            <strong>
              {user.is_active
                ? "Active"
                : "Inactive"}
            </strong>
          </div>
        </div>
      </section>


      {(workspace.role === "owner" ||
        workspace.role === "admin") && (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>
                Workspace Members
              </h2>

              <p>
                Manage who can access
                this workspace.
              </p>
            </div>

            <Link
              to="/members"
              className="secondary-button"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Manage Members
            </Link>
          </div>
        </section>
      )}
    </>
  );
}