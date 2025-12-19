import jwt from "jsonwebtoken";
import pool from "../db.js";

export const authRequired = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      "SELECT user_id, role_id, restaurant_id FROM users WHERE user_id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ message: "Unauthorized" });

    const dbUser = result.rows[0];
    let activeRestaurantId = dbUser.restaurant_id;

    // 👑 NUEVA LÓGICA DE ROLE 3 (DEVELOPER)
    if (dbUser.role_id === 3) {
      const headerTenant = req.headers["x-tenant-id"];
      // Si el Developer nos dice a qué restaurante quiere "suplantar", le hacemos caso
      if (
        headerTenant &&
        headerTenant !== "null" &&
        headerTenant !== "undefined"
      ) {
        activeRestaurantId = parseInt(headerTenant, 10);
      }
      // Si no manda header, activeRestaurantId se queda en NULL (correcto para ver lista global)
    }
    // 🛡️ LÓGICA PARA MORTALES (Admin/Empleado)
    else if (!activeRestaurantId) {
      // Si un usuario normal no tiene restaurante, es un error de seguridad grave.
      return res
        .status(403)
        .json({ message: "Access denied: No restaurant assigned." });
    }

    req.user = {
      id: dbUser.user_id,
      role: dbUser.role_id,
      restaurant_id: activeRestaurantId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
