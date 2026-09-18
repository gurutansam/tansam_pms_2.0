import express from "express";
import {
  getProjectFollowups,
 
  updateProjectFollowup,
} from "../controllers/projectFollowup.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teamLeadMiddleware } from "../middlewares/teamlead.middleware.js";
import { roleMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/**
 * VIEW FOLLOWUPS — TEAM LEAD + ADMIN
 */
router.get(
  "/project-followups",
  authMiddleware,
  roleMiddleware(["TEAM LEAD", "ADMIN", "CEO", "FINANCE", "MD"]),
  getProjectFollowups
);

/**
 * CREATE FOLLOWUP — TEAM LEAD ONLY
 */
// router.post(
//   "/project-followups",
//   authMiddleware,
//   teamLeadMiddleware,
//   createProjectFollowup
// );

/**
 * UPDATE FOLLOWUP — TEAM LEAD ONLY
 */
router.put(
  "/project-followups/:projectId",
  authMiddleware,
  teamLeadMiddleware,
  updateProjectFollowup
);

export default router;
