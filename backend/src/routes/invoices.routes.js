import { Router } from "express";
import { createInvoice, deleteInvoice, getInvoice, getInvoices } from "../controllers/invoice.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/invoice/:id", authRequired, authorizeRoles(1, 2, 3), createInvoice);

router.get("/invoice/", authRequired, authorizeRoles(1, 2, 3), getInvoices);
router.get("/invoice/:id", authRequired, authorizeRoles(1, 2, 3), getInvoice);

router.delete("/invoice/:id", authRequired, authorizeRoles(1, 2, 3), deleteInvoice);

export default router;
