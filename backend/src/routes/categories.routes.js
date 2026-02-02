/**
 * Define las rutas de la API para la gestión de Categorías (CRUD).
 * Todas las operaciones requieren autenticación.
 */

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { validateId } from "../middlewares/validateParams.js";
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/category.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema.js";

const router = Router();

// POST /api/category: Crea una nueva categoría.
router.post("/category", authRequired, authorizeRoles(1, 3), validateSchema(createCategorySchema), createCategory);

// GET /api/category: Obtiene todas las categorías
router.get("/category", authRequired, authorizeRoles(1, 2, 3), getCategories);
// GET /api/category/:id Obtiene las categorías por ID
router.get("/category/:id", authRequired, validateId, authorizeRoles(1, 2, 3), getCategory);
// PUT /api/category/:id Actualizar todas las categorías
router.put("/category/:id", authRequired, validateId, authorizeRoles(1, 3), validateSchema(updateCategorySchema), updateCategory);
// DELETE /api/category/:id Eliminar una categorías
router.delete("/category/:id", authRequired, validateId, authorizeRoles(1, 3), deleteCategory);

export default router;