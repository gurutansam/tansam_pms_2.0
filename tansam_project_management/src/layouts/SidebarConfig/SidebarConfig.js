  // SidebarConfig.js
  export const SIDEBAR_MENU = {
    admin: [
      { label: "Dashboard", path: "/admin" },
      { label: "Create Users", path: "/admin/users" },
        // { label: "Project", path: "/admin/project" },

      {
        label: "Master Table",
        children: [
          { label: "Create Roles", path: "/admin/roles" },
          { label: "Create Labs", path: "/admin/labs" },
          { label: "Project Types", path: "/admin/project-types" },
          { label: "Client Types", path: "/admin/client-types" },
          { label: "Work Categories", path: "/admin/work-categories" },
          { label: "Reports", path: "/admin/reports" },
        ],
      },
    ],

    coordinator: [
      // { label: "Dashboard", path: "/coordinator" },
      { label: "New Opportunities", path: "/coordinator/opportunities" },
       { label: "Forecast", path: "/ceo/ceoforecast" },
      // { label: "Opportunities-Tracker", path: "/coordinator/Opportunities-tracker" },
    ],

    tl: [
      { label: "Dashboard", path: "/tl" },
      // { label: "Project Types", path: "/tl/project-types" },
      { label: "Create Project", path: "/tl/create-project" },
      { label: "Project Dashboard", path: "/tl/follow-up" },
      // { label: "Summary", path: "/tl/summary" },

      // 🔥 SEPARATE SECTION (AFTER SUMMARY)
      {
        label: "Project Team",
        children: [
          { label: "Departments", path: "/tl/department" },

          { label: "Team Member", path: "/tl/team-member" },
       
          { label: "Assign Team", path: "/tl/assign-team" },
     
          // { label: "Time Tracking", path: "/tl/time-tracking" },
        ],
      },
    ],

  finance: [
    // { label: "Dashboard", path: "/finance" },
    { label: "Quotations", path: "/finance/quotations" },
    // { label: "Quotation Follow-up", path: "/finance/quotation-followup" },
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
