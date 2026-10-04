import { Router } from "express";
import { getVMs, createVM, updateVM, deleteVM } from "../controllers/vmController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
const router = Router();
router.get("/", authenticateToken, getVMs);
router.post("/", authenticateToken, requireAdmin, createVM);
router.put("/:id", authenticateToken, requireAdmin, updateVM);
router.delete("/:id", authenticateToken, requireAdmin, deleteVM);
export default router;
