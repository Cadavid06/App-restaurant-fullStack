import { Router } from "express";
import { getReports } from "../controllers/reports.controller.js";
import { authRequired } from "../middlewares/validateToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.get("/reports", authRequired, authorizeRoles(1), getReports);

export default router;