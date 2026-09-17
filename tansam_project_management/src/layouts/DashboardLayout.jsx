import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./CSS/Layout.css";

export default function DashboardLayout({ user, setUser }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };
  return (
    <div className="app-shell">
      <Sidebar role={user?.role} />
      <div className="app-main">
        <TopBar user={user} onLogout={handleLogout} />
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}