import { Router } from "express";
import { createInvoice, deleteInvoice, getInvoice, getInvoices } from "../controllers/invoice.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createInvoiceSchema } from "../schemas/invoice.schema.js";

const router = Router();

router.post("/invoice/:id", authRequired, validateId, authorizeRoles(1, 2, 3), validateSchema(createInvoiceSchema), createInvoice);

router.get("/invoice/", authRequired, authorizeRoles(1, 2, 3), getInvoices);
router.get("/invoice/:id", authRequired, validateId, authorizeRoles(1, 2, 3), getInvoice);

router.delete("/invoice/:id", authRequired, validateId, authorizeRoles(1, 2, 3), deleteInvoice);

export default router;
