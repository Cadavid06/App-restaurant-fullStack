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

router.post("/productSize", authRequired, authorizeRoles(1), createSize);

router.get("/productSize", authRequired, authorizeRoles(1, 2), getSizes);

router.get("/productSize/:id", authRequired, authorizeRoles(1, 2), getSize);

router.put("/productSize/:id", authRequired, authorizeRoles(1), updateSize);

router.delete("/productSize/:id", authRequired, authorizeRoles(1), deleteSize);

export default router;
