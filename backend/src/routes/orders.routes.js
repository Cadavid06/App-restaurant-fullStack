import { Router } from "express";
import { createOrder, deleteOrder, getOrder, getOrders, updateOrder } from "../controllers/order.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.post("/order", authRequired, authorizeRoles(1, 2, 3), createOrder);

router.get("/order", authRequired, authorizeRoles(1, 2, 3), getOrders);
router.get("/order/:id", validateId, authRequired, authorizeRoles(1, 2, 3), getOrder);

router.put("/order/:id", validateId, authRequired, authorizeRoles(1, 2, 3), updateOrder);
router.delete("/order/:id", validateId, authRequired, authorizeRoles(1, 2, 3), deleteOrder);


export default router;