import { Router } from "express";
import { createOrder, deleteOrder, getOrder, getOrders, updateOrder } from "../controllers/order.controllers.js";
import { authRequired } from "../middlewares/validateToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.post("/order", authRequired, authorizeRoles(1, 2), createOrder);

router.get("/order", authRequired, authorizeRoles(1, 2), getOrders);
router.get("/order/:id", authRequired, authorizeRoles(1, 2), getOrder);

router.put("/order/:id", authRequired, authorizeRoles(1, 2), updateOrder);
router.delete("/order/:id", authRequired, authorizeRoles(1, 2), deleteOrder);


export default router;