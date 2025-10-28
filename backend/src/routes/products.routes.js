import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.post("/product", authRequired, authorizeRoles(1), createProduct);

router.get("/product", authRequired, authorizeRoles(1, 2), getProducts);
router.get("/product/:id", authRequired, authorizeRoles(1, 2), getProduct);

router.put("/product/:id", authRequired, authorizeRoles(1), updateProduct);

router.delete("/product/:id", authRequired, authorizeRoles(1), deleteProduct);

export default router;