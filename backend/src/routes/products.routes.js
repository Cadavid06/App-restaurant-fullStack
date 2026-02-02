import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";

const router = Router();

router.post("/product", authRequired, authorizeRoles(1, 3), validateSchema(createProductSchema), createProduct);

router.get("/product", authRequired, authorizeRoles(1, 2, 3), getProducts);
router.get("/product/:id", authRequired, validateId, authorizeRoles(1, 2, 3), getProduct);

router.put("/product/:id", authRequired, validateId, authorizeRoles(1, 3), validateSchema(updateProductSchema), updateProduct);

router.delete("/product/:id", authRequired, validateId, authorizeRoles(1, 3), deleteProduct);

export default router;