import "../CSS/TLDashboard.css";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFolder,
  FiActivity,
  FiPlus,
} from "react-icons/fi";

import { fetchProjects } from "../../../services/project.api";
import { fetchProjectFollowups } from "../../../services/projectFollowup.api";

/* ===== Relative Time Helper ===== */
const timeAgo = (date) => {
  if (!date) return "Recently";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return "Recently";

  const diff = (Date.now() - parsed.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return parsed.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};

export default function TLDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [projData, followData] = await Promise.all([
          fetchProjects().catch(() => []),
          fetchProjectFollowups().catch(() => []),
        ]);
        setProjects(projData || []);
        setFollowups(followData || []);
      } catch (err) {
        console.error("Dashboard data load failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= METRICS ================= */
  const totalProjects = projects.length;

  const inProgressCount = useMemo(() => {
    return followups.filter(
      (f) => f.status?.toLowerCase() === "in progress"
    ).length;
  }, [followups]);

  const completedCount = useMemo(() => {
    return followups.filter(
      (f) => f.status?.toLowerCase() === "completed"
    ).length;
  }, [followups]);

  const onHoldCount = useMemo(() => {
    return followups.filter(
      (f) => f.status?.toLowerCase() === "on hold"
    ).length;
  }, [followups]);

  const plannedCount = useMemo(() => {
    return Math.max(
      0,
      totalProjects - (inProgressCount + completedCount + onHoldCount)
    );
  }, [totalProjects, inProgressCount, completedCount, onHoldCount]);

  /* ================= ACTIVE PROJECTS PROGRESS ================= */
  const activeProjects = useMemo(() => {
    return followups
      .filter((f) => f.status?.toLowerCase() !== "completed")
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .slice(0, 5)
      .map((f) => ({
        id: f.projectId || f.id,
        projectName: f.projectName || `Project ${f.projectId}`,
        clientName: f.clientName || "—",
        status: f.status || "In Progress",
        progress: Number(f.progress) || 0,
        milestoneDueDate: f.milestoneDueDate,
      }));
  }, [followups]);

  /* ================= RECENT ACTIVITY ================= */
  const recentActivities = useMemo(() => {
    return [...followups]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
      )
      .slice(0, 6)
      .map((f) => ({
        id: f.followupId || f.id || f.projectId,
        projectId: f.projectId,
        projectName: f.projectName || `Project ${f.projectId}`,
        clientName: f.clientName || "",
        status: f.status || "In Progress",
        progress: Number(f.progress) || 0,
        updatedAt: f.updatedAt || f.createdAt,
      }));
  }, [followups]);

  return (
    <div className="tl-dashboard">
      {/* ================= HEADER ================= */}
      <div className="tl-dashboard-header">
        <div>
          <h2 className="tl-dashboard-title">Team Lead Dashboard</h2>
          <p className="tl-dashboard-subtitle">
            Project progress tracking, operational milestones, and recent updates.
          </p>
        </div>
        <div className="tl-header-actions">
          <button
            className="tl-btn tl-btn-secondary"
            onClick={() => navigate("/tl/follow-up")}
          >
            <FiActivity /> Project Board
          </button>
          <button
            className="tl-btn tl-btn-primary"
            onClick={() => navigate("/tl/create-project")}
          >
            <FiPlus /> New Project
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="tl-stats-grid">
        <div
          className="tl-stat-card theme-total"
          onClick={() => navigate("/tl/follow-up")}
        >
          <div className="tl-stat-header">
            <span className="tl-stat-label">Total Projects</span>
            <div className="tl-stat-icon">
              <FiFolder />
            </div>
          </div>
          <h3 className="tl-stat-value">{totalProjects}</h3>
          <div className="tl-stat-footer">
            <span>Managed across all teams</span>
            <FiArrowUpRight className="tl-arrow-icon" />
          </div>
        </div>

        <div
          className="tl-stat-card theme-progress"
          onClick={() => navigate("/tl/follow-up")}
        >
          <div className="tl-stat-header">
            <span className="tl-stat-label">In Progress</span>
            <div className="tl-stat-icon">
              <FiClock />
            </div>
          </div>
          <h3 className="tl-stat-value">{inProgressCount}</h3>
          <div className="tl-stat-footer">
            <span>Currently under active execution</span>
            <FiArrowUpRight className="tl-arrow-icon" />
          </div>
        </div>

        <div
          className="tl-stat-card theme-completed"
          onClick={() => navigate("/tl/follow-up")}
        >
          <div className="tl-stat-header">
            <span className="tl-stat-label">Completed</span>
            <div className="tl-stat-icon">
              <FiCheckCircle />
            </div>
          </div>
          <h3 className="tl-stat-value">{completedCount}</h3>
          <div className="tl-stat-footer">
            <span>Successfully delivered</span>
            <FiArrowUpRight className="tl-arrow-icon" />
          </div>
        </div>

        <div
          className="tl-stat-card theme-hold"
          onClick={() => navigate("/tl/follow-up")}
        >
          <div className="tl-stat-header">
            <span className="tl-stat-label">On Hold</span>
            <div className="tl-stat-icon">
              <FiAlertCircle />
            </div>
          </div>
          <h3 className="tl-stat-value">{onHoldCount}</h3>
          <div className="tl-stat-footer">
            <span>Requires review or unblocking</span>
            <FiArrowUpRight className="tl-arrow-icon" />
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="tl-bottom-grid">
        {/* ===== PROJECT PROGRESS OVERVIEW ===== */}
        <div className="tl-panel">
          <div className="tl-panel-header">
            <div>
              <h3 className="tl-panel-title">Active Projects Progress</h3>
              <p className="tl-panel-sub">
                Current progress of ongoing projects
              </p>
            </div>
            <button
              className="tl-link-btn"
              onClick={() => navigate("/tl/follow-up")}
            >
              View all
            </button>
          </div>

          {/* Status Breakdown Bar */}
          {totalProjects > 0 && (
            <div className="tl-distribution-bar-wrapper">
              <div className="tl-distribution-bar">
                <div
                  className="tl-dist-segment seg-progress"
                  style={{
                    width: `${(inProgressCount / totalProjects) * 100}%`,
                  }}
                  title={`In Progress: ${inProgressCount}`}
                />
                <div
                  className="tl-dist-segment seg-completed"
                  style={{
                    width: `${(completedCount / totalProjects) * 100}%`,
                  }}
                  title={`Completed: ${completedCount}`}
                />
                <div
                  className="tl-dist-segment seg-hold"
                  style={{
                    width: `${(onHoldCount / totalProjects) * 100}%`,
                  }}
                  title={`On Hold: ${onHoldCount}`}
                />
                <div
                  className="tl-dist-segment seg-planned"
                  style={{
                    width: `${(plannedCount / totalProjects) * 100}%`,
                  }}
                  title={`Planned: ${plannedCount}`}
                />
              </div>
              <div className="tl-distribution-legend">
                <span>
                  <span className="legend-dot seg-progress" /> In Progress ({inProgressCount})
                </span>
                <span>
                  <span className="legend-dot seg-completed" /> Completed ({completedCount})
                </span>
                <span>
                  <span className="legend-dot seg-hold" /> On Hold ({onHoldCount})
                </span>
                <span>
                  <span className="legend-dot seg-planned" /> Planned ({plannedCount})
                </span>
              </div>
            </div>
          )}

          {/* Progress List */}
          <div className="tl-progress-list">
            {loading ? (
              <div className="tl-empty-state">Loading projects...</div>
            ) : activeProjects.length === 0 ? (
              <div className="tl-empty-state">No active projects found</div>
            ) : (
              activeProjects.map((p) => (
                <div key={p.id} className="tl-progress-item">
                  <div className="tl-progress-info">
                    <div>
                      <h4 className="tl-project-name">{p.projectName}</h4>
                      <span className="tl-project-client">{p.clientName}</span>
                    </div>
                    <div className="tl-progress-meta">
                      <span
                        className={`tl-status-badge ${p.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {p.status}
                      </span>
                      <span className="tl-progress-percent">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="tl-progress-track">
                    <div
                      className="tl-progress-fill"
                      style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ===== RECENT ACTIVITY ===== */}
        <div className="tl-panel">
          <div className="tl-panel-header">
            <div>
              <h3 className="tl-panel-title">Recent Activity</h3>
              <p className="tl-panel-sub">Latest project updates & status changes</p>
            </div>
          </div>

          <div className="tl-activity-feed">
            {loading ? (
              <div className="tl-empty-state">Loading activity...</div>
            ) : recentActivities.length === 0 ? (
              <div className="tl-empty-state">No recent activity</div>
            ) : (
              recentActivities.map((a) => (
                <div key={`${a.id}-${a.projectId}`} className="tl-activity-card">
                  <div className="tl-activity-content">
                    <div className="tl-activity-top">
                      <h4 className="tl-activity-project-name">
                        {a.projectName}
                      </h4>
                      <span className="tl-activity-time">
                        <FiClock className="time-icon" /> {timeAgo(a.updatedAt)}
                      </span>
                    </div>

                    <div className="tl-activity-bottom">
                      {a.clientName && (
                        <span className="tl-activity-client">
                          {a.clientName}
                        </span>
                      )}
                      <span
                        className={`tl-status-badge ${a.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {a.status}
                      </span>
                      <span className="tl-activity-progress-tag">
                        {a.progress}% completed
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
