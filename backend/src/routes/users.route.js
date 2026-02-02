import { Router } from "express";
import {
  deleteUsers,
  getUser,
  getUsers,
  updateUsers,
} from "../controllers/users.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { updateUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.get("/user", authRequired, authorizeRoles(1, 3), getUsers);

router.get("/user/:id", authRequired, validateId, authorizeRoles(1, 3), getUser);

router.put("/user/:id", authRequired, validateId, authorizeRoles(1, 3), validateSchema(updateUserSchema), updateUsers);

router.delete("/user/:id", authRequired, validateId, authorizeRoles(1, 3), deleteUsers);

export default router;
