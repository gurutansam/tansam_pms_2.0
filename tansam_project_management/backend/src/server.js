import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { ensureDatabaseExists, connectDB, closeDB } from "./config/db.js";
import { initSchemas } from "./schema/main.schema.js";

const PORT = process.env.PORT;

const shutdown = async (signal) => {
  console.log(`${signal} received; closing MySQL pool...`);
  await closeDB();
  process.exit(0);
};

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    const db = await connectDB();
    await initSchemas(db, {
      admin: true, coordinator: true, project: true, assignTeam: true,
      department: true, member: true, finance: true, projectType: true,
      projectFollowup: true, createCeoForecastSchema: true,
    });
    app.set("db", db);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Server startup failed:", err);
    await closeDB();
    process.exit(1);
  }
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
startServer();