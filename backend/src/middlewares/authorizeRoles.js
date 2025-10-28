/**
 * Middleware de fábrica para verificar que el usuario autenticado
 * tenga alguno de los roles permitidos.
 */

/**
 * Función de fábrica que devuelve un middleware.
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // El rol del usuario se obtiene del objeto req.user,
        // el cual fue establecido previamente por authRequired.
        const { role } = req.user;

        // Verifica si el rol del usuario está incluido en los roles permitidos
        if (!allowedRoles.includes(role)) {
            // 403 Forbidden: El usuario está autenticado, pero no tiene permiso
            return res.status(403).json({ message: "Access denied" });
        }

        // Si el rol es permitido, pasa al siguiente middleware/controlador
        next();
    };
};
