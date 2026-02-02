import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateId } from "../middlewares/validateParams.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createSizeSchema, updateSizeSchema } from "../schemas/productSize.schema.js";
import {
  createSize,
  deleteSize,
  getSize,
  getSizes,
  updateSize,
} from "../controllers/productSize.controller.js";

const router = Router();

router.post("/productSize", authRequired, authorizeRoles(1, 3), validateSchema(createSizeSchema), createSize);

router.get("/productSize", authRequired, authorizeRoles(1, 2, 3), getSizes);

router.get("/productSize/:id", authRequired, validateId, authorizeRoles(1, 2, 3), getSize);

router.put("/productSize/:id", authRequired, validateId, authorizeRoles(1, 3), validateSchema(updateSizeSchema), updateSize);

router.delete("/productSize/:id", authRequired, validateId, authorizeRoles(1, 3), deleteSize);

export default router;
