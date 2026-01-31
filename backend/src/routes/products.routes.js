import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

router.post("/product", authRequired, authorizeRoles(1, 3), createProduct);

router.get("/product", authRequired, authorizeRoles(1, 2, 3), getProducts);
router.get("/product/:id", validateId, authRequired, authorizeRoles(1, 2, 3), getProduct);

router.put("/product/:id", validateId, authRequired, authorizeRoles(1, 3), updateProduct);

router.delete("/product/:id", validateId, authRequired, authorizeRoles(1, 3), deleteProduct);

export default router;