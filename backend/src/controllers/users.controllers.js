import pool from "../db.js"; // ✅ Importa pool
import bcrypt from "bcryptjs"; // ✅ Para cifrar contraseña

export const getUsers = async (req, res) => {
  try {
    const users = await pool.query(`SELECT user_id, name, email, role_id FROM users`); // ✅ No devolver password
    if (users.rows.length === 0) {
      return res.status(200).json({ message: "No users found", data: [] });
    }
    res.json(users.rows);
  } catch (error) {
    console.error("Error displaying users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query(`SELECT user_id, name, email, role_id FROM users WHERE user_id = $1`, [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error displaying user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUsers = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  const client = await pool.connect(); // ✅ Usa pool.connect para transacción
  try {
    await client.query("BEGIN");

    // ✅ Validaciones correctas
    if (typeof name !== "string" || typeof email !== "string") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid field types for name or email" });
    }

    // ✅ Verifica rol si se proporciona
    let roleId = null;
    if (role) {
      const roleFound = await client.query("SELECT role_id FROM role WHERE name_role = $1", [role]);
      if (roleFound.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "The role does not exist" });
      }
      roleId = roleFound.rows[0].role_id;
    }

    // ✅ Verifica si usuario existe
    const user = await client.query(`SELECT * FROM users WHERE user_id = $1`, [id]);
    if (user.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Cifra contraseña solo si se proporciona
    let passwordHash = user.rows[0].password;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const result = await client.query(
      `UPDATE users SET name = $1, email = $2, password = $3${roleId ? ", role_id = $4" : ""} WHERE user_id = $${roleId ? 4 : 3} RETURNING user_id, name, email, role_id`,
      roleId ? [name.trim(), email.trim(), passwordHash, roleId, id] : [name.trim(), email.trim(), passwordHash, id]
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

export const deleteUsers = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id, name, email",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
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