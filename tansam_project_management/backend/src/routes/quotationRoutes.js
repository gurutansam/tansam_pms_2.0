import express from "express";
import {
  getQuotations,
  addQuotation,
  updateQuotation,
  deleteQuotation,
  downloadQuotationDocx,
   generateQuotationNo,
} from "../controllers/quotation.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Only apply authMiddleware globally (authentication only)
router.use(authMiddleware);

// GET quotations - Allow FINANCE + TEAM LEAD + COORDINATOR (if needed)
router.get(
  "/",
  roleMiddleware(["FINANCE", "TEAM LEAD", "COORDINATOR", "CEO", "MD"]),
  getQuotations
);
// routes/quotation.routes.js
router.get(
  "/generate-quotation-no",
  roleMiddleware(["FINANCE"]),
  generateQuotationNo
);

// Restrict write/delete/download to FINANCE only
router.post(
  "/",
  roleMiddleware(["FINANCE","COORDINATOR"]), // ← COORDINATOR now allowed
  addQuotation
);

router.put(
  "/:id",
  roleMiddleware(["FINANCE","COORDINATOR"]), // ← COORDINATOR now allowed
  updateQuotation
);

router.delete(
  "/:id",
  roleMiddleware(["FINANCE","COORDINATOR"]), // ← COORDINATOR now allowed
  deleteQuotation
);

router.get(
  "/:id/docx",
  roleMiddleware(["FINANCE","COORDINATOR"]), // ← COORDINATOR now allowed
  downloadQuotationDocx
);

export default router;