import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Biotech,
  Layers,
  WorkOutline,
  Apartment,
  Refresh,
  AccountTree,
} from "@mui/icons-material";
import { fetchAdminDashboardCounts } from "../../services/admin/admin.roles.api";
import { fetchProjects } from "../../services/project.api";
import "./Ceocss/CeoDashboard.css";

const StatCard = ({
  title,
  total,
  active,
  inactive,
  icon,
  colorTheme,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  onClick,
}) => (
  <Card
    className={`ceo-stat-card ${colorTheme || ""}`}
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <CardContent className="ceo-stat-content">
      <Box className="ceo-stat-header">
        <Typography className="ceo-stat-title">{title}</Typography>
        <Box className="ceo-stat-icon-wrapper">{icon}</Box>
      </Box>

      <Typography className="ceo-stat-total">{total ?? 0}</Typography>
      <Typography className="ceo-stat-label">Total Records</Typography>

      <Box className="ceo-stat-footer">
        <div className="ceo-status-badge ceo-active-badge">
          <span className="ceo-badge-dot"></span>
          <span className="ceo-badge-name">{activeLabel}</span>
          <span className="ceo-badge-count">{active ?? 0}</span>
        </div>
        <div className="ceo-status-badge ceo-inactive-badge">
          <span className="ceo-badge-dot"></span>
          <span className="ceo-badge-name">{inactiveLabel}</span>
          <span className="ceo-badge-count">{inactive ?? 0}</span>
        </div>
      </Box>
    </CardContent>
  </Card>
);

const CeoDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [adminCounts, projectsData] = await Promise.allSettled([
        fetchAdminDashboardCounts(),
        fetchProjects(),
      ]);

      if (adminCounts.status === "fulfilled") {
        setCounts(adminCounts.value);
      }

      if (
        projectsData.status === "fulfilled" &&
        Array.isArray(projectsData.value)
      ) {
        const prjs = projectsData.value;
        const total = prjs.length;
        const active = prjs.filter((p) => {
          const s = (p.status || "").toLowerCase();
          return (
            s === "in progress" ||
            s === "in-progress" ||
            s === "planned" ||
            s === "active"
          );
        }).length;
        const completed = prjs.filter((p) => {
          const s = (p.status || "").toLowerCase();
          return s === "completed";
        }).length;
        setProjectStats({ total, active, completed });
      }
    } catch (err) {
      console.error("Failed to fetch CEO dashboard counts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Box className="ceo-dashboard-loader">
        <CircularProgress size={44} thickness={4} sx={{ color: "#00646e" }} />
      </Box>
    );
  }

  const cards = [
    {
      title: "Projects",
      values: {
        total: projectStats.total,
        active: projectStats.active,
        inactive: projectStats.completed,
      },
      activeLabel: "In Progress",
      inactiveLabel: "Completed",
      icon: <AccountTree />,
      theme: "theme-projects",
      path: "/ceo/ceoprojects",
    },
    {
      title: "Labs",
      values: counts?.labs || { total: 0, active: 0, inactive: 0 },
      activeLabel: "Active",
      inactiveLabel: "Inactive",
      icon: <Biotech />,
      theme: "theme-labs",
    },
    {
      title: "Project Types",
      values: counts?.projectTypes || { total: 0, active: 0, inactive: 0 },
      activeLabel: "Active",
      inactiveLabel: "Inactive",
      icon: <Layers />,
      theme: "theme-project-types",
    },
    {
      title: "Client Types",
      values: counts?.clientTypes || { total: 0, active: 0, inactive: 0 },
      activeLabel: "Active",
      inactiveLabel: "Inactive",
      icon: <Apartment />,
      theme: "theme-client-types",
    },
    {
      title: "Work Categories",
      values: counts?.workCategories || { total: 0, active: 0, inactive: 0 },
      activeLabel: "Active",
      inactiveLabel: "Inactive",
      icon: <WorkOutline />,
      theme: "theme-work-categories",
    },
  ];

  return (
    <Box className="ceo-dashboard-container">
      {/* Header */}
      <Box className="ceo-dashboard-header">
        <Box>
          <Typography variant="h4" className="ceo-dashboard-title">
            CEO Dashboard
          </Typography>
          <Typography className="ceo-dashboard-subtitle">
            Executive overview of operational projects, infrastructure, project classifications, and master categories.
          </Typography>
        </Box>
        <Tooltip title="Refresh metrics">
          <IconButton
            onClick={() => loadData(true)}
            className="ceo-refresh-btn"
            disabled={refreshing}
          >
            <Refresh className={refreshing ? "spin" : ""} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Cards Grid */}
      <Box className="ceo-dashboard-cards-grid">
        {cards.map(
          ({ title, values, icon, theme, activeLabel, inactiveLabel, path }) => (
            <StatCard
              key={title}
              title={title}
              total={values.total}
              active={values.active}
              inactive={values.inactive}
              activeLabel={activeLabel}
              inactiveLabel={inactiveLabel}
              icon={icon}
              colorTheme={theme}
              onClick={path ? () => navigate(path) : undefined}
            />
          )
        )}
      </Box>
    </Box>
  );
};

export default CeoDashboard;
