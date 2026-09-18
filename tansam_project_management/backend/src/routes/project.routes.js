import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

import { uploadPO } from "../middlewares/upload.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teamLeadMiddleware } from "../middlewares/teamlead.middleware.js";
import { roleMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

/**
 * GET PROJECTS — VIEW ACCESS
 */
router.get(
  "/projects",
  authMiddleware,
  roleMiddleware(["TEAM LEAD", "ADMIN", "FINANCE", "CEO", "MD"]),
  getProjects
);

/**
 * CREATE PROJECT — TEAM LEAD ONLY
 */
router.post(
  "/projects",
  authMiddleware,
  teamLeadMiddleware,
  uploadPO.single("poFile"),
  createProject
);

/**
 * UPDATE PROJECT — TEAM LEAD ONLY
 */
router.put(
  "/projects/:id",
  authMiddleware,
  teamLeadMiddleware,
  uploadPO.single("poFile"),
  updateProject
);

/**
 * DELETE PROJECT — TEAM LEAD ONLY
 */
router.delete(
  "/projects/:id",
  authMiddleware,
  teamLeadMiddleware,
  deleteProject
);

export default router;
