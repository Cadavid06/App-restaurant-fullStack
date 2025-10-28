/**
 * Define las rutas relacionadas con la autenticación (registro, login, logout).
 */
import { Router } from "express";
import { login, logout, register, verifyToken } from "../controllers/auth.controllers.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { authRequired } from "../middlewares/validateToken.js";

// Inicializa el enrutador de Express
const router = Router();

// POST /api/login: Ruta para el inicio de sesión
router.post("/login", login);

// POST /api/register: Ruta para el registro de un nuevo usuario.
// Requiere:
// 1. authRequired: Que el usuario esté autenticado (por ejemplo, para que solo un admin pueda registrar).
// 2. authorizeRoles(1): Que el usuario autenticado tenga el rol ID 1 (Admin) para realizar esta acción.
router.post("/register", authRequired, authorizeRoles(1), register);

// POST /api/logout: Ruta para cerrar la sesión (limpia la cookie del token)
router.post("/logout", logout);

router.get("/verify", authRequired, verifyToken);


// Exporta el enrutador
export default router;
