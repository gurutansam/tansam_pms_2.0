import express from "express";
import {
  getAllDbTables,
  getTableData,
  downloadTableData,
} from "../controllers/ceoDbView.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= CEO DB VIEW ================= */
router.use(authMiddleware);
router.get("/tables", getAllDbTables);
router.get("/table/:table", getTableData);
router.get("/table/:table/download", downloadTableData);

export default router;
