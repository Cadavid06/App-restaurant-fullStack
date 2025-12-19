/**
 * Módulo de utilidad para la creación de JSON Web Tokens (JWT).
 */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

/**
 * Crea un token de acceso JWT para un usuario dado.
 * Envuelve la función jwt.sign en una Promesa.
 */
export function createdAccessToken(user) {
    return new Promise((resolve, reject) => {
        jwt.sign(
            { 
                id: user.user_id, 
                role: user.role_id,
                // ✅ AGREGADO: Guardamos el ID del restaurante en el token
                restaurant_id: user.restaurant_id 
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
}