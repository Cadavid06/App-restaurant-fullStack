import { Router } from "express";
import { createOrder, deleteOrder, getOrder, getOrders, updateOrder } from "../controllers/order.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createOrderSchema, updateOrderSchema } from "../schemas/order.schema.js";

const router = Router();

router.post("/order", authRequired, authorizeRoles(1, 2, 3), validateSchema(createOrderSchema), createOrder);

router.get("/order", authRequired, authorizeRoles(1, 2, 3), getOrders);
router.get("/order/:id", authRequired, validateId, authorizeRoles(1, 2, 3), getOrder);

router.put("/order/:id", authRequired, validateId, authorizeRoles(1, 2, 3), validateSchema(updateOrderSchema), updateOrder);
router.delete("/order/:id", authRequired, validateId, authorizeRoles(1, 2, 3), deleteOrder);


export default router;