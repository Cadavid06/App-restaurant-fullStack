/**
 * Define las rutas de la API para la gestión de Categorías (CRUD).
 * Todas las operaciones requieren autenticación.
 */

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/category.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = Router();

// POST /api/category: Crea una nueva categoría.
router.post("/category", authRequired, authorizeRoles(1), createCategory);

// GET /api/category: Obtiene todas las categorías
router.get("/category", authRequired, authorizeRoles(1, 2), getCategories);
// GET /api/category/:id Obtiene las categorías por ID
router.get("/category/:id", authRequired, authorizeRoles(1, 2), getCategory);
// PUT /api/category/:id Actualizar todas las categorías
router.put("/category/:id", authRequired, authorizeRoles(1), updateCategory);
// DELETE /api/category/:id Eliminar una categorías
router.delete("/category/:id", authRequired, authorizeRoles(1), deleteCategory);

export default router;