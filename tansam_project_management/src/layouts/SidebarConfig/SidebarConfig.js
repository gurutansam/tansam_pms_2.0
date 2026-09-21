// SidebarConfig.js
export const SIDEBAR_MENU = {
  admin: [
    { label: "Dashboard", path: "/admin" },
    { label: "Create Users", path: "/admin/users" },
    {
      label: "Master Table",
      children: [
        { label: "Create Roles", path: "/admin/roles" },
        { label: "Create Labs", path: "/admin/labs" },
        { label: "Project Types", path: "/admin/project-types" },
        { label: "Client Types", path: "/admin/client-types" },
        { label: "Work Categories", path: "/admin/work-categories" },
        { label: "Reports (Demo)", path: "/admin/reports" },
      ],
    },
  ],

  coordinator: [
    { label: "New Opportunities", path: "/coordinator/opportunities" },
    { label: "Opportunities Tracker", path: "/coordinator/opportunities-tracker" },
    { label: "Forecast", path: "/ceo/ceoforecast" },
  ],

  tl: [
    { label: "Dashboard", path: "/tl" },
    { label: "Create Project", path: "/tl/create-project" },
    { label: "Project Dashboard", path: "/tl/follow-up" },
    {
      label: "Project Team",
      children: [
        { label: "Departments", path: "/tl/department" },
        { label: "Team Member", path: "/tl/team-member" },
        { label: "Assign Team", path: "/tl/assign-team" },
      ],
    },
  ],

  finance: [
    { label: "Quotations", path: "/finance/quotations" },
    { label: "Terms", path: "/finance/terms" },
  ],

  ceo: [
    { label: "Dashboard", path: "/ceo" },
    { label: "Projects", path: "/ceo/ceoprojects" },
    { label: "Quotation", path: "/ceo/ceoquotation" },
    { label: "Forecast", path: "/ceo/ceoforecast" },
    { label: "DB View", path: "/ceo/ceodbview" },
  ],
};
