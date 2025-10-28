/**
 * Módulo de utilidad para la creación de JSON Web Tokens (JWT).
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Carga las variables de entorno para acceder a JWT_SECRET
dotenv.config();

/**
 * Crea un token de acceso JWT para un usuario dado.
 * Envuelve la función jwt.sign en una Promesa.
 */
export function createdAccessToken(user) {
    return new Promise((resolve, reject) => {
        // Genera el token con el ID y el Rol del usuario en el payload
        jwt.sign(
            { id: user.user_id, role: user.role_id },
            process.env.JWT_SECRET, // Clave secreta para firmar el token
            { expiresIn: "24h" }, // El token expira en 1 hora
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
}
