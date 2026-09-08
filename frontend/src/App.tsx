import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import PublicLayout from "./layouts/PublicLayout";
import RequireAuth from "./routes/RequireAuth";

import ActivitiesPage from "./pages/ActivitiesPage";
import CompaniesPage from "./pages/CompaniesPage";
import CompanyDetailsPage from "./pages/CompanyDetailsPage";
import ContactsPage from "./pages/ContactsPage";
import ContactDetailsPage from "./pages/ContactDetailsPage";
import DashboardPage from "./pages/DashboardPage";
import DealDetailsPage from "./pages/DealDetailsPage";
import DealsPage from "./pages/DealsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";


export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
      </Route>


      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/companies"
            element={<CompaniesPage />}
          />

          <Route
            path="/companies/:companyId"
            element={<CompanyDetailsPage />}
          />

          <Route
            path="/contacts"
            element={<ContactsPage />}
          />

          <Route
            path="/contacts/:contactId"
            element={<ContactDetailsPage />}
          />

          <Route
            path="/deals"
            element={<DealsPage />}
          />

          <Route
            path="/deals/:dealId"
            element={<DealDetailsPage />}
          />

          <Route
            path="/activities"
            element={<ActivitiesPage />}
          />

          <Route
            path="/members"
            element={<MembersPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>


      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}