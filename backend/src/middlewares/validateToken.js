/**
 * Middleware para verificar la autenticación del usuario a través de un JWT.
 * Si el token es válido, adjunta la información básica del usuario (id, role)
 * al objeto 'req'.
 */
import jwt from "jsonwebtoken";
import pool from "../db.js";

/**
 * Middleware que comprueba si un token de acceso es válido y autentica al usuario.
 */
export const authRequired = async (req, res, next) => {
    try {
        // 1. Obtener el token de las cookies o del encabezado 'Authorization'
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(" ")[1]; // Extrae el token si usa el formato Bearer

        if (!token) return res.status(401).json({ message: "No token provided" }); // 401 Unauthorized

        // 2. Verificar la validez del token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Buscar el usuario en la base de datos usando el ID decodificado
        const user = await pool.query(
            "SELECT user_id, role_id FROM users WHERE user_id = $1",
            [decoded.id]
        );

        if (user.rows.length === 0)
            return res.status(401).json({ message: "Unauthorized" });

        // 4. Adjuntar la información esencial del usuario (ID y Rol) a la solicitud
        // Esto será usado por otros middlewares (como authorizeRoles) o controladores
        req.user = {
            id: user.rows[0].user_id,
            role: user.rows[0].role_id,
        };

        // 5. Continuar con el siguiente middleware o controlador
        next();
    } catch (error) {
        // Manejo de errores de JWT (expiración, firma inválida, etc.)
        console.error("authRequired error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
};
