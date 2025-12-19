/**
 * Controladores de autenticación con soporte multi-inquilino
 */
import pool from "../db.js";
import bcrypt from "bcryptjs";
import { createdAccessToken } from "../libs/jwt.js";

/**
 * Registra un nuevo usuario en la base de datos.
 * ✅ MODIFICADO: Ahora requiere restaurant_id (excepto para Developer)
 */
export const register = async (req, res) => {
  const { name, email, password, role, restaurant_id } = req.body;
  const { role: adminRole } = req.user || {}; // Usuario que está creando

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Validación de campos obligatorios
    if (!name || !email || !password || !role) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Verifica si el rol existe
    const roleFound = await client.query(
      "SELECT role_id FROM role WHERE name_role = $1",
      [role]
    );
    if (roleFound.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "The role does not exist" });
    }

    const roleId = roleFound.rows[0].role_id;

    // ✅ 3. Validar restaurant_id según el rol
    let finalRestaurantId = restaurant_id;

    // Si NO es Developer, el restaurant_id es obligatorio
    if (roleId !== 1) {
      if (!restaurant_id) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "restaurant_id is required for non-Developer users",
        });
      }

      // Verificar que el restaurante existe
      const restaurantExists = await client.query(
        "SELECT restaurant_id FROM restaurants WHERE restaurant_id = $1",
        [restaurant_id]
      );
      if (restaurantExists.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Restaurant does not exist" });
      }
    } else {
      // Developer puede tener restaurant_id NULL
      finalRestaurantId = restaurant_id || null;
    }

    // 4. Verifica si el usuario ya existe (por email)
    const userFound = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userFound.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User already exists" });
    }

    // 5. Cifra la contraseña antes de almacenarla
    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ 6. Inserta el nuevo usuario con restaurant_id
    const newUser = await client.query(
      `INSERT INTO users (name, email, password, role_id, restaurant_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING user_id, name, email, role_id, restaurant_id`,
      [name, email, passwordHash, roleId, finalRestaurantId]
    );

    // 7. Crea el token de acceso JWT
    const token = await createdAccessToken(newUser.rows[0]);

    // 8. Establece el token como una cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    await client.query("COMMIT");

    // 9. Responde con el usuario registrado y el token
    return res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
      token: token,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during register:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

/**
 * Procesa el inicio de sesión de un usuario.
 * ✅ Sin cambios significativos - el login no necesita filtrar por restaurante
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json(["Usuario no encontrado"]);

    const userFound = result.rows[0];

    // --- 🛡️ VALIDACIÓN ROBUSTA ---

    // 1. Si NO es Developer (Role 3), DEBE tener restaurante
    if (userFound.role_id !== 3 && !userFound.restaurant_id) {
      return res
        .status(403)
        .json(["Acceso denegado: Usuario sin restaurante asignado."]);
    }

    // 2. Si tiene restaurante, verificar estado
    if (userFound.restaurant_id) {
      const restaurantCheck = await pool.query(
        "SELECT is_active FROM restaurants WHERE restaurant_id = $1",
        [userFound.restaurant_id]
      );
      if (
        restaurantCheck.rows.length === 0 ||
        !restaurantCheck.rows[0].is_active
      ) {
        return res.status(403).json(["Restaurante inactivo o inexistente."]);
      }
    }

    // 2. Compara la contraseña proporcionada con la cifrada
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json(["Contraseña incorrecta"]);
    }

    // 3. Crea el token de acceso
    const token = await createdAccessToken(userFound);

    // 4. Establece el token como una cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // 5. Responde con el estado de éxito y los datos del usuario (sin la contraseña)
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: userFound.user_id,
        name: userFound.name,
        email: userFound.email,
        role: userFound.role_id,
        restaurant_id: userFound.restaurant_id, // ✅ Incluir restaurant_id
      },
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Cierra la sesión eliminando la cookie del token.
 */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.json({ message: "Logged out" });
};

/**
 * Verifica el token y devuelve los datos del usuario
 */
export const verifyToken = async (req, res) => {
  try {
    const { id, role } = req.user;

    const result = await pool.query(
      "SELECT user_id, email, role_id, name, restaurant_id FROM users WHERE user_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userFound = result.rows[0];

    return res.json({
      id: userFound.user_id,
      email: userFound.email,
      role: userFound.role_id,
      name: userFound.name,
      restaurant_id: userFound.restaurant_id, // ✅ Incluir restaurant_id
    });
  } catch (error) {
    console.error("verifyToken error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
