import pool from "../db.js";
import bcrypt from "bcryptjs";

/**
 * ✅ Obtener usuarios del mismo restaurante
 * (excepto Developer que puede ver todos)
 */
export const getUsers = async (req, res) => {
  const { restaurant_id, role } = req.user;

  try {
    let users;

    // Si es Developer (role 1), puede ver todos los usuarios
    if (role === 3 && !restaurant_id) {
      users = await pool.query(
        `SELECT user_id, name, email, role_id, restaurant_id 
         FROM users 
         WHERE name != $1 
         ORDER BY user_id ASC`,
        ["Developer"]
      );
    } else {
      // Admin o Empleado: solo ven usuarios de su restaurante
      users = await pool.query(
        `SELECT user_id, name, email, role_id, restaurant_id 
         FROM users 
         WHERE name != $1 
           AND (restaurant_id = $2 OR restaurant_id IS NULL)
         ORDER BY user_id ASC`,
        ["Developer", restaurant_id]
      );
    }

    if (users.rows.length === 0) {
      return res.status(200).json({ message: "No users found", data: [] });
    }

    res.json(users.rows);
  } catch (error) {
    console.error("Error displaying users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ✅ Obtener un usuario específico
 * Solo si pertenece al mismo restaurante (o si es Developer)
 */
export const getUser = async (req, res) => {
  const { id } = req.params;
  const { restaurant_id, role } = req.user;

  try {
    let user;

    if (role === 3 && !restaurant_id) {
      // Developer puede ver cualquier usuario
      user = await pool.query(
        `SELECT user_id, name, email, role_id, restaurant_id 
         FROM users WHERE user_id = $1`,
        [id]
      );
    } else {
      // Admin/Empleado solo puede ver usuarios de su restaurante
      user = await pool.query(
        `SELECT user_id, name, email, role_id, restaurant_id 
         FROM users 
         WHERE user_id = $1 
           AND (restaurant_id = $2 OR restaurant_id IS NULL)`,
        [id, restaurant_id]
      );
    }

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error displaying user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * ✅ Actualizar usuario
 * Solo si pertenece al mismo restaurante (o si es Developer)
 */
export const updateUsers = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, restaurant_id } = req.body; // Datos a actualizar
  const { restaurant_id: adminrestaurant_id, role: adminRole } = req.user; // Datos del que ejecuta

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Validaciones de forma y tipo (manejado por Zod `updateUserSchema`).

    // ✅ Verificar permisos de búsqueda
    let userQuery;

    // CORRECCIÓN 1: Usar 'adminrestaurant_id' para saber si el dev está en modo global
    if (adminRole === 3 && !adminrestaurant_id) {
      // Developer Global: Busca en toda la tabla
      userQuery = await client.query(`SELECT * FROM users WHERE user_id = $1`, [
        id,
      ]);
    } else {
      // Admin/Empleado/Dev Local: Busca solo en su restaurante
      userQuery = await client.query(
        `SELECT * FROM users WHERE user_id = $1 
         AND (restaurant_id = $2 OR restaurant_id IS NULL)`,
        [id, adminrestaurant_id]
      );
    }

    if (userQuery.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "User not found or unauthorized" });
    }

    const user = userQuery.rows[0];

    // Mapea role a role_id
    let roleId = user.role_id;
    if (role) {
      const roleFound = await client.query(
        "SELECT role_id FROM role WHERE name_role = $1",
        [role]
      );
      if (roleFound.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "The role does not exist" });
      }
      roleId = roleFound.rows[0].role_id;
    }

    // ✅ Validar cambio de restaurant_id
    let finalrestaurant_id = user.restaurant_id;

    if (restaurant_id !== undefined) {
      // CORRECCIÓN 2: Verificar si es ROL 3 (Developer)
      if (adminRole !== 3) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          message: "Only Developer can change restaurant assignment",
        });
      }

      if (restaurant_id !== null && restaurant_id !== "") {
        const restaurantExists = await client.query(
          "SELECT restaurant_id FROM restaurants WHERE restaurant_id = $1",
          [restaurant_id]
        );
        if (restaurantExists.rows.length === 0) {
          await client.query("ROLLBACK");
          return res.status(400).json({ message: "Restaurant does not exist" });
        }
        finalrestaurant_id = restaurant_id;
      } else {
        // Permitir asignar null si se envía null (para convertir en dev o global user)
        finalrestaurant_id = null;
      }
    }

    // Password
    let passwordHash = user.password;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    // Update
    const result = await client.query(
      `UPDATE users 
       SET name = $1, email = $2, password = $3, role_id = $4, restaurant_id = $5
       WHERE user_id = $6 
       RETURNING user_id, name, email, role_id, restaurant_id`,
      [name.trim(), email.trim(), passwordHash, roleId, finalrestaurant_id, id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not updated" });
    }

    await client.query("COMMIT");
    return res.status(200).json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

/**
 * ✅ Eliminar usuario
 * Solo si pertenece al mismo restaurante (o si es Developer)
 */
export const deleteUsers = async (req, res) => {
  const { id } = req.params;
  const { restaurant_id, role } = req.user;

  try {
    let result;

    if (role === 3 && !restaurant_id) {
      // Developer puede eliminar cualquier usuario
      result = await pool.query(
        "DELETE FROM users WHERE user_id = $1 RETURNING user_id, name, email",
        [id]
      );
    } else {
      // Admin/Empleado solo puede eliminar usuarios de su restaurante
      result = await pool.query(
        `DELETE FROM users 
         WHERE user_id = $1 
           AND (restaurant_id = $2 OR restaurant_id IS NULL)
         RETURNING user_id, name, email`,
        [id, restaurant_id]
      );
    }

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or unauthorized" });
    }

    return res.json({
      message: "User deleted successfully",
      deletedUser: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
