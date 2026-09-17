import { useLocation } from "react-router-dom";
import "./CSS/TopBar.css";

const titleFromPath = (pathname) => {
  const item = pathname.split("/").filter(Boolean).at(-1);
  if (!item || ["admin", "finance", "tl", "ceo", "coordinator"].includes(item)) return "Overview";
  return item.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function TopBar({ user, onLogout }) {
  const { pathname } = useLocation();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-eyebrow">Workspace</span>
        <span className="page-title">{titleFromPath(pathname)}</span>
      </div>
      <div className="topbar-right">
        <span className="user-name">{user?.name || user?.role || "Account"}</span>
        <button className="logout-btn" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  );
}