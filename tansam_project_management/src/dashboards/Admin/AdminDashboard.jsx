import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { AdminPanelSettings, Biotech, Layers, WorkOutline, PeopleAlt, Apartment } from "@mui/icons-material";
import { fetchAdminDashboardCounts } from "../../services/admin/admin.roles.api";
import "./admincss/AdminDashboard.css";

const StatCard = ({ title, total, active, inactive, icon }) => (
  <Card className="siemens-card">
    <CardContent className="siemens-card-content">
      <Box className="siemens-card-header">
        <Typography className="siemens-title">{title}</Typography>
        <Box className="siemens-icon">{icon}</Box>
      </Box>
      <Typography className="siemens-total">{total}</Typography>
      <Typography className="siemens-total-label">Total records</Typography>
      <Box className="siemens-status">
        <div className="status-box active-box"><span className="status-label">Active</span><span className="status-count">{active}</span></div>
        <div className="status-box inactive-box"><span className="status-label">Inactive</span><span className="status-count">{inactive}</span></div>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCounts = async () => {
      try { setCounts(await fetchAdminDashboardCounts()); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadCounts();
  }, []);

  if (loading) return <Box className="siemens-loader"><CircularProgress /></Box>;

  const cards = [
    ["Roles", counts.roles, <AdminPanelSettings />], ["Labs", counts.labs, <Biotech />],
    ["Project Types", counts.projectTypes, <Layers />], ["Client Types", counts.clientTypes, <Apartment />],
    ["Work Categories", counts.workCategories, <WorkOutline />], ["Users", counts.users, <PeopleAlt />],
  ];
  return (
    <Box className="siemens-dashboard">
      <Box className="siemens-header">
        <Typography className="siemens-main-title">Admin Overview</Typography>
        <Typography className="siemens-subtitle">A snapshot of your workspace configuration and people.</Typography>
      </Box>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {cards.map(([title, values, icon]) => (
          <Grid key={title} size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard title={title} {...values} icon={icon} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
export default AdminDashboard;