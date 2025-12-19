import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createRestaurant,
  getRestaurants,
  getRestaurant,
  updateRestaurant,
  deactivateRestaurant,
  deleteRestaurant,
  getRestaurantStats,
} from "../controllers/restaurant.controllers.js";

const router = Router();

// ✅ 1. Autenticación global (todos deben estar logueados)
router.use(authRequired);

// 👑 RUTAS EXCLUSIVAS DE DEVELOPER (ROL 3)
// Solo el Dev puede crear, listar todos, editar, desactivar o borrar
router.post("/restaurants", authorizeRoles(3), createRestaurant);
router.get("/restaurants", authorizeRoles(3), getRestaurants);
router.put("/restaurants/:id", authorizeRoles(3), updateRestaurant);
router.patch("/restaurants/:id/deactivate", authorizeRoles(3), deactivateRestaurant);
router.delete("/restaurants/:id", authorizeRoles(3), deleteRestaurant);

// 🔓 RUTAS COMPARTIDAS (ROL 1, 2 y 3)
// Admin y Empleado necesitan ver SU propio restaurante
router.get("/restaurants/:id", authorizeRoles(1, 2, 3), getRestaurant);
router.get("/restaurants/:id/stats", authorizeRoles(1, 3), getRestaurantStats); // Quizás Stats solo Admin y Dev

export default router;