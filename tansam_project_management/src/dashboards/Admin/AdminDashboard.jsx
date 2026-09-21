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
  AdminPanelSettings,
  Biotech,
  Layers,
  WorkOutline,
  PeopleAlt,
  Apartment,
  Refresh,
} from "@mui/icons-material";
import { fetchAdminDashboardCounts } from "../../services/admin/admin.roles.api";
import "./admincss/AdminDashboard.css";

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
    className={`admin-stat-card ${colorTheme || ""}`}
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <CardContent className="admin-stat-content">
      <Box className="admin-stat-header">
        <Typography className="admin-stat-title">{title}</Typography>
        <Box className="admin-stat-icon-wrapper">{icon}</Box>
      </Box>

      <Typography className="admin-stat-total">{total ?? 0}</Typography>
      <Typography className="admin-stat-label">Total Records</Typography>

      <Box className="admin-stat-footer">
        <div className="admin-status-badge admin-active-badge">
          <span className="admin-badge-dot"></span>
          <span className="admin-badge-name">{activeLabel}</span>
          <span className="admin-badge-count">{active ?? 0}</span>
        </div>
        <div className="admin-status-badge admin-inactive-badge">
          <span className="admin-badge-dot"></span>
          <span className="admin-badge-name">{inactiveLabel}</span>
          <span className="admin-badge-count">{inactive ?? 0}</span>
        </div>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCounts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await fetchAdminDashboardCounts();
      setCounts(data);
    } catch (err) {
      console.error("Failed to fetch admin dashboard counts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCounts();
  }, []);

  if (loading) {
    return (
      <Box className="admin-dashboard-loader">
        <CircularProgress size={44} thickness={4} sx={{ color: "#00646e" }} />
      </Box>
    );
  }

  const cards = [
    {
      title: "Roles",
      values: counts?.roles || { total: 0, active: 0, inactive: 0 },
      icon: <AdminPanelSettings />,
      theme: "theme-roles",
      path: "/admin/roles",
    },
    {
      title: "Labs",
      values: counts?.labs || { total: 0, active: 0, inactive: 0 },
      icon: <Biotech />,
      theme: "theme-labs",
      path: "/admin/labs",
    },
    {
      title: "Project Types",
      values: counts?.projectTypes || { total: 0, active: 0, inactive: 0 },
      icon: <Layers />,
      theme: "theme-project-types",
      path: "/admin/project-types",
    },
    {
      title: "Client Types",
      values: counts?.clientTypes || { total: 0, active: 0, inactive: 0 },
      icon: <Apartment />,
      theme: "theme-client-types",
      path: "/admin/client-types",
    },
    {
      title: "Work Categories",
      values: counts?.workCategories || { total: 0, active: 0, inactive: 0 },
      icon: <WorkOutline />,
      theme: "theme-work-categories",
      path: "/admin/work-categories",
    },
    {
      title: "Users",
      values: counts?.users || { total: 0, active: 0, inactive: 0 },
      icon: <PeopleAlt />,
      theme: "theme-users",
      path: "/admin/users",
    },
  ];

  return (
    <Box className="admin-dashboard-container">
      {/* Header */}
      <Box className="admin-dashboard-header">
        <Box>
          <Typography variant="h4" className="admin-dashboard-title">
            Admin Overview
          </Typography>
          <Typography className="admin-dashboard-subtitle">
            A snapshot of your workspace configuration, master masters, and personnel.
          </Typography>
        </Box>
        <Tooltip title="Refresh metrics">
          <IconButton
            onClick={() => loadCounts(true)}
            className="admin-refresh-btn"
            disabled={refreshing}
          >
            <Refresh className={refreshing ? "spin" : ""} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Cards Grid */}
      <Box className="admin-dashboard-cards-grid">
        {cards.map(({ title, values, icon, theme, path }) => (
          <StatCard
            key={title}
            title={title}
            total={values.total}
            active={values.active}
            inactive={values.inactive}
            icon={icon}
            colorTheme={theme}
            onClick={path ? () => navigate(path) : undefined}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AdminDashboard;