import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createSize,
  deleteSize,
  getSize,
  getSizes,
  updateSize,
} from "../controllers/productSize.controller.js";

const router = Router();

router.post("/productSize", authRequired, authorizeRoles(1, 3), createSize);

router.get("/productSize", authRequired, authorizeRoles(1, 2, 3), getSizes);

router.get("/productSize/:id", authRequired, authorizeRoles(1, 2, 3), getSize);

router.put("/productSize/:id", authRequired, authorizeRoles(1, 3), updateSize);

router.delete("/productSize/:id", authRequired, authorizeRoles(1, 3), deleteSize);

export default router;
