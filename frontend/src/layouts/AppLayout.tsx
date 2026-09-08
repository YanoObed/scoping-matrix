import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Breadcrumbs from "../components/Breadcrumbs";

import {
  apiRequest,
  clearAccessToken,
} from "../lib/api";


export type CurrentUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_active: boolean;
  is_superuser: boolean;
};


export type CurrentWorkspace = {
  membership_id: string;
  workspace_id: string;
  workspace_name: string;
  workspace_slug: string;
  role: "owner" | "admin" | "member";
};


export type AppOutletContext = {
  user: CurrentUser;
  setUser: React.Dispatch<
    React.SetStateAction<CurrentUser | null>
  >;
  workspace: CurrentWorkspace;
};


const WORKSPACE_KEY =
  "scoping_matrix_workspace_id";


const navigation = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: "▦",
  },
  {
    to: "/companies",
    label: "Companies",
    icon: "🏢",
  },
  {
    to: "/contacts",
    label: "Contacts",
    icon: "👤",
  },
  {
    to: "/deals",
    label: "Deals",
    icon: "💼",
  },
  {
    to: "/activities",
    label: "Activities",
    icon: "✓",
  },
];


const managementNavigation = [
  {
    to: "/members",
    label: "Workspace Members",
    icon: "👥",
  },
  {
    to: "/profile",
    label: "My Profile",
    icon: "●",
  },
  {
    to: "/settings",
    label: "Settings",
    icon: "⚙",
  },
];


export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    user,
    setUser,
  ] = useState<CurrentUser | null>(
    null,
  );

  const [
    workspaces,
    setWorkspaces,
  ] = useState<
    CurrentWorkspace[]
  >([]);

  const [
    workspace,
    setWorkspace,
  ] = useState<
    CurrentWorkspace | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");


  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);


  useEffect(() => {
    let active = true;

    async function loadApplication() {
      try {
        const [
          currentUser,
          workspaceList,
        ] = await Promise.all([
          apiRequest<CurrentUser>(
            "/auth/me",
          ),

          apiRequest<
            CurrentWorkspace[]
          >(
            "/workspaces",
          ),
        ]);

        if (!active) {
          return;
        }

        setUser(currentUser);
        setWorkspaces(
          workspaceList,
        );

        if (
          workspaceList.length === 0
        ) {
          setLoadError(
            "Your account is not connected to a workspace.",
          );

          return;
        }


        const savedWorkspaceId =
          localStorage.getItem(
            WORKSPACE_KEY,
          );


        const selected =
          workspaceList.find(
            (item) =>
              item.workspace_id ===
              savedWorkspaceId,
          ) ||
          workspaceList[0];


        setWorkspace(selected);

        localStorage.setItem(
          WORKSPACE_KEY,
          selected.workspace_id,
        );
      } catch {
        clearAccessToken();

        if (active) {
          navigate(
            "/login",
            {
              replace: true,
            },
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadApplication();

    return () => {
      active = false;
    };
  }, [navigate]);


  function changeWorkspace(
    workspaceId: string,
  ) {
    const selected =
      workspaces.find(
        (item) =>
          item.workspace_id ===
          workspaceId,
      );

    if (!selected) {
      return;
    }

    setWorkspace(selected);

    localStorage.setItem(
      WORKSPACE_KEY,
      selected.workspace_id,
    );

    navigate(
      "/dashboard",
    );
  }


  function logout() {
    clearAccessToken();

    localStorage.removeItem(
      WORKSPACE_KEY,
    );

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  }


  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-mark">
          SM
        </div>

        <p>
          Loading Scoping Matrix...
        </p>
      </div>
    );
  }


  if (loadError) {
    return (
      <div className="app-loading">
        <div className="loading-mark">
          SM
        </div>

        <p>
          {loadError}
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    );
  }


  if (!user || !workspace) {
    return null;
  }


  const displayName =
    [
      user.first_name,
      user.last_name,
    ]
      .filter(Boolean)
      .join(" ") ||
    user.email;


  const initials =
    [
      user.first_name?.[0],
      user.last_name?.[0],
    ]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    user.email[0].toUpperCase();


  const roleLabel =
    workspace.role
      .charAt(0)
      .toUpperCase() +
    workspace.role.slice(1);


  return (
    <div className="app-shell">
      <aside
        className={
          `sidebar ${
            sidebarOpen
              ? "sidebar-open"
              : ""
          }`
        }
      >
        <NavLink
          to="/dashboard"
          className="brand"
        >
          <div className="brand-mark">
            SM
          </div>

          <div>
            <strong>
              Scoping Matrix
            </strong>

            <span>
              Customer Management
            </span>
          </div>
        </NavLink>


        <div className="nav-label">
          Workspace
        </div>


        {workspaces.length > 1 && (
          <select
            className="workspace-selector"
            value={
              workspace.workspace_id
            }
            onChange={(event) =>
              changeWorkspace(
                event.target.value,
              )
            }
          >
            {workspaces.map(
              (item) => (
                <option
                  key={
                    item.workspace_id
                  }
                  value={
                    item.workspace_id
                  }
                >
                  {
                    item.workspace_name
                  }
                </option>
              ),
            )}
          </select>
        )}


        <nav className="nav-list">
          {navigation.map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({
                  isActive,
                }) =>
                  `nav-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                {item.label}
              </NavLink>
            ),
          )}
        </nav>


        <div className="nav-label">
          Management
        </div>

        <nav className="nav-list">
          {managementNavigation.map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({
                  isActive,
                }) =>
                  `nav-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <span className="nav-icon">
                  {item.icon}
                </span>

                {item.label}
              </NavLink>
            ),
          )}
        </nav>


        <div className="sidebar-user">
          <strong>
            {displayName}
          </strong>

          <span>
            {user.email}
          </span>

          <span>
            {
              workspace.workspace_name
            }
            {" · "}
            {roleLabel}
          </span>
        </div>
      </aside>


      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="menu-button"
              aria-label="Open navigation"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              ☰
            </button>

            <div className="workspace-title">
              <strong>
                {
                  workspace.workspace_name
                }
              </strong>

              <span>
                {roleLabel}
                {" · "}
                Scoping Matrix
              </span>
            </div>
          </div>


          <div className="topbar-right">
            <input
              className="global-search"
              type="search"
              placeholder="Search Scoping Matrix..."
            />

            <NavLink
              to="/profile"
              className="avatar avatar-link"
              title={displayName}
            >
              {initials}
            </NavLink>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </header>


        <div className="page-container">
          <Breadcrumbs />

          <Outlet
            context={{
              user,
              setUser,
              workspace,
            }}
          />
        </div>


        <footer className="app-footer">
          <div>
            <strong>
              Scoping Matrix
            </strong>

            <span>
              {
                workspace.workspace_name
              }
            </span>
          </div>

          <div className="app-footer-links">
            <span>
              © 2026 Scoping Matrix
            </span>

            <a href="mailto:obadiayano45@gmail.com">
              Support
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}