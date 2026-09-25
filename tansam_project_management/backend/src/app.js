  import express from "express";
  import cors from "cors";

  import authRoutes from "./routes/auth.routes.js";
  import adminRoutes from "./routes/admin.routes.js";
  import coordinatorRoutes from "./routes/coordinator.routes.js";
  import quotationRoutes from "./routes/quotationRoutes.js";
  import projectRoutes from "./routes/project.routes.js";
  import assignTeamRoutes from "./routes/assignTeam.routes.js";
  import departmentRoutes from "./routes/department.routes.js";
  import membersRoutes from "./routes/members.routes.js";
  import projectTypeRoutes from "./routes/projectType.routes.js";
  import terms from "./routes/terms.routes.js"
  import quotationFollowup from "./routes/quotationFollowup.routes.js";
  import projectFollowupRoutes from "./routes/projectFollowup.routes.js";

 
import generatedQuotationRoutes from "./routes/generatedQuotation.routes.js";

import CeoforecastRoutes from "./routes/Ceo.forecast.routes.js";
import CeoDBroutes from "./routes/ceoDB.routes.js";

    import path from "path";

  const app = express();

  /**
   * CORS configuration
   * Frontend: Vite (http://localhost:5173)
   */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pms.tansam.org"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "x-user-role",
      "x-user-name",
    ],
    credentials: true,
  })
);


  // Parse JSON request body
  app.use(express.json());

  // Routes
  /* ================= SERVE UPLOADED FILES ================= */
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);


  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/coordinator", coordinatorRoutes);
  app.use("/api/quotations", quotationRoutes);
  app.use("/api/quotation-followups",  quotationFollowup);
  app.use("/api/generatequotation", generatedQuotationRoutes)
  app.use("/api/terms", terms);
  app.use("/api", projectRoutes);
  app.use("/api", assignTeamRoutes);
  app.use("/api", departmentRoutes);
  app.use("/api", membersRoutes);
  app.use("/api", projectTypeRoutes);
  app.use("/api", projectFollowupRoutes);
  app.use("/api/ceo/forecast", CeoforecastRoutes);
  app.use("/api/ceo/db", CeoDBroutes);



  export default app;