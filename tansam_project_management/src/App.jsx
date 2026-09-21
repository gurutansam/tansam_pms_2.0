import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Login from "./auth/Login.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

/* ADMIN */
import AdminDashboard from "./dashboards/Admin/AdminDashboard.jsx";
import Users from "./dashboards/Admin/Users.jsx";
import Roles from "./dashboards/Admin/Roles.jsx";
import Labs from "./dashboards/Admin/Labs.jsx";
import Reports from "./dashboards/Admin/Reports.jsx";
import CreateProjectType from "./dashboards/Admin/CreateProjectType.jsx";
import ClientType from "./dashboards/Admin/ClientType.jsx";
import CreateWorkCategories from "./dashboards/Admin/CreateWorkCategories.jsx";

/* COORDINATOR */
import CoordinatorDashboard from "./dashboards/Coordinator/CoordinatorDashboard.jsx";
import Opportunities from "./dashboards/Coordinator/Opportunities.jsx";
import OpportunitiesTracker from "./dashboards/Coordinator/OpportunitiesTacker.jsx";
import Quotations from "./dashboards/Finance/Quotations.jsx";
import Terms from "./dashboards/Finance/terms.jsx";
import QuotationFollowup from "./dashboards/Finance/QuotationFollowup.jsx";
// import FinanceReports from "./dashboards/Finance/Reports.jsx";
import FinanceDashboard from "./dashboards/Finance/FinanceDashboard.jsx";
import GenerateQuotation from "./dashboards/Finance/generateQuotation.jsx";

/* TEAM LEADER */
import TLDashboard from "./dashboards/tl/pages/TLDashboard.jsx";
import CreateProject from "./dashboards/tl/pages/CreateProject.jsx";
import ProjectFollowUp from "./dashboards/tl/pages/ProjectFollowUp.jsx";
// import Summary from "./tl/pages/Summary.jsx";
import AssignTeam from "./dashboards/tl/pages/AssignTeam.jsx";
import Department from "./dashboards/tl/pages/department.jsx";
import TeamMember from "./dashboards/tl/pages/teammember.jsx";
// import ProjectTypes from "./tl/pages/projectTypes.jsx";

/* CEO */
import CeoDashboard from "./dashboards/Ceo/CeoDashboard.jsx";
import CeoProjects from "./dashboards/Ceo/Ceoprojects.jsx";
import CeoQuotation from "./dashboards/Ceo/Ceoquotation.jsx";
import CeoForecast from "./dashboards/Ceo/CeoForecast.jsx";
import CeoDbView from "./dashboards/Ceo/CeoDbView.jsx";



function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const PrivateRoute = ({ children }) =>
    user ? children : <Navigate to="/" replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <DashboardLayout user={user} setUser={setUser} />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="labs" element={<Labs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="project-types" element={<CreateProjectType />} />
          <Route path="client-types" element={<ClientType />} />
          <Route path="work-categories" element={<CreateWorkCategories />} />
        </Route>
<Route
  path="/finance"
  element={
    <PrivateRoute>
      <DashboardLayout user={user} setUser={setUser} />
    </PrivateRoute>
  }
>
  <Route index element={<Quotations/>} />
  <Route path="quotations" element={<Quotations />} />
  <Route path="quotation-followup" element={<QuotationFollowup />} />
 <Route path="terms" element={<Terms />} />
 <Route path="generateQuotation" element ={<GenerateQuotation/>} />
  {/* Add other finance children routes here, like Reports */}
  <Route path="reports" element={<Reports />} />
</Route>

        {/* COORDINATOR */}
        <Route
          path="/coordinator"
          element={
            <PrivateRoute>
              <DashboardLayout user={user} setUser={setUser} />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="opportunities" replace />} />
          {/* <Route index element={<Opportunities />} /> */}
          <Route path="opportunities" element={<Opportunities />} />
          <Route
            path="opportunities-tracker"
            element={<OpportunitiesTracker />}
          />
        </Route>

        {/* CEO */}
        <Route
          path="/ceo"
          element={
            <PrivateRoute>
              <DashboardLayout user={user} setUser={setUser} />
            </PrivateRoute>
          }
        >
          <Route index element={<CeoDashboard />} />
          <Route path="dashboard" element={<CeoDashboard />} />
          <Route path="ceoprojects" element={<CeoProjects />} />
          <Route path="ceoquotation" element={<CeoQuotation />} />
          <Route path="ceoforecast" element={<CeoForecast />} />
          <Route path="ceodbview" element={<CeoDbView />} />
        </Route>


        {/* TEAM LEADER */}
        <Route
          path="/tl"
          element={
            <PrivateRoute>
              <DashboardLayout user={user} setUser={setUser} />
            </PrivateRoute>
          }
        >
          <Route index element={<TLDashboard />} />
          <Route path="create-project" element={<CreateProject />} />
          <Route path="follow-up" element={<ProjectFollowUp />} />
          {/* <Route path="summary" element={<Summary />} /> */}
          <Route path="assign-team" element={<AssignTeam />} />
          <Route path="department" element={<Department />} />
          <Route path="team-member" element={<TeamMember />} />
          {/* <Route path="project-types" element={<ProjectTypes />} /> */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>  
  );
}

export default App;
