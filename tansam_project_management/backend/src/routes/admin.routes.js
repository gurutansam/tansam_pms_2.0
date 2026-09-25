import express from "express";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getLabs,
  createLab,
  updateLab,
  deleteLab,
  getProjectTypes,
  createProjectType,
  updateProjectType,
  deleteProjectType,
  getWorkCategories,
  createWorkCategory,
  updateWorkCategory,
  deleteWorkCategory,
  getUsers,
  createUser,
  updateUser,
  getClientTypes,
  createClientType,
  updateClientType,
  deleteClientType,
  getAdminDashboardCounts,
} from "../controllers/admin.controller.js";
import {getOpportunities,} from "../controllers/coordinator.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

// ADMIN ONLY
router.get("/roles", authMiddleware, roleMiddleware(["ADMIN","COORDINATOR"]), getRoles);
router.post("/roles", authMiddleware, roleMiddleware(["ADMIN"]), createRole);
router.put("/roles/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateRole);
router.delete("/roles/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteRole);

// LABS (ADMIN)
router.get("/labs", authMiddleware, roleMiddleware(["ADMIN", "FINANCE","COORDINATOR","TEAM LEAD"]), getLabs);
router.post("/labs", authMiddleware, roleMiddleware(["ADMIN"]), createLab);
router.put("/labs/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateLab);
router.delete("/labs/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteLab);

// PROJECT TYPES (ADMIN)
router.get(
  "/project-types",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM LEAD"]),
  getProjectTypes
);

router.post("/project-types", authMiddleware, roleMiddleware(["ADMIN"]), createProjectType);
router.put("/project-types/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateProjectType);
router.delete("/project-types/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteProjectType);

// CLIENT TYPES (ADMIN)
router.get(
  "/client-types",
  authMiddleware,
  roleMiddleware(["ADMIN", "TEAM LEAD","COORDINATOR"]),
  getClientTypes
);

router.post(
  "/client-types",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  createClientType
);

router.put(
  "/client-types/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateClientType
);
router.delete(
  "/client-types/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteClientType
);


// WORK CATEGORIES (ADMIN)
router.get("/work-categories", authMiddleware, roleMiddleware(["ADMIN","TEAM LEAD","FINANCE","COORDINATOR","CEO"]), getWorkCategories);
router.post("/work-categories", authMiddleware, roleMiddleware(["ADMIN"]), createWorkCategory);
router.put("/work-categories/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateWorkCategory);
router.delete("/work-categories/:id", authMiddleware, roleMiddleware(["ADMIN"]), deleteWorkCategory);

// 👤 USERS (ADMIN)
router.get("/users", authMiddleware, roleMiddleware(["ADMIN","COORDINATOR"]), getUsers);
router.post("/users", authMiddleware, roleMiddleware(["ADMIN"]), createUser);
router.put("/users/:id", authMiddleware, roleMiddleware(["ADMIN"]), updateUser);

// COORDINATOR – OPPORTUNITY ROUTES (ADMIN)
router.get(
  "/opportunities",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getOpportunities
);
router.get("/dashboard-counts", getAdminDashboardCounts);


export default router;