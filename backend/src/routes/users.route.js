import { Router } from "express";
import {
  deleteUsers,
  getUser,
  getUsers,
  updateUsers,
} from "../controllers/users.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get("/user", authRequired, authorizeRoles(1), getUsers);

router.get("/user/:id", authRequired, authorizeRoles(1), getUser);

router.put("/user/:id", authRequired, authorizeRoles(1), updateUsers);

router.delete("/user/:id", authRequired, authorizeRoles(1), deleteUsers);

export default router;
