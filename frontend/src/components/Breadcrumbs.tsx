import {
  Link,
  useLocation,
} from "react-router-dom";


const labels: Record<string, string> = {
  dashboard: "Dashboard",
  companies: "Companies",
  contacts: "Contacts",
  deals: "Deals",
  activities: "Activities",
  members: "Workspace Members",
  profile: "My Profile",
  settings: "Settings",
};


export default function Breadcrumbs() {
  const location = useLocation();

  const segments =
    location.pathname
      .split("/")
      .filter(Boolean);


  return (
    <nav
      className="breadcrumbs"
      aria-label="Breadcrumb"
    >
      <Link to="/dashboard">
        Scoping Matrix
      </Link>

      {segments.map(
        (segment, index) => {
          const path =
            "/" +
            segments
              .slice(0, index + 1)
              .join("/");

          const isLast =
            index ===
            segments.length - 1;

          return (
            <span
              className="breadcrumb-item"
              key={path}
            >
              <span className="breadcrumb-separator">
                /
              </span>

              {isLast ? (
                <span>
                  {labels[segment] ??
                    segment}
                </span>
              ) : (
                <Link to={path}>
                  {labels[segment] ??
                    segment}
                </Link>
              )}
            </span>
          );
        },
      )}
    </nav>
  );
}