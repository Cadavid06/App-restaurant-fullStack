/**
 * Contiene la lógica de negocio para las operaciones de autenticación (registro, login, logout).
 */
import pool from "../db.js";
import bcrypt from "bcryptjs";
import { createdAccessToken } from "../libs/jwt.js";

/**
 * Registra un nuevo usuario en la base de datos.
 * Solo puede ser ejecutado por un usuario con rol de Administrador.
 * Implementa una transacción para asegurar la integridad de los datos.
 */
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Obtiene un cliente del pool para iniciar una transacción
  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Inicia la transacción

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
      await client.query("ROLLBACK"); // Deshace la transacción
      return res.status(400).json({ message: "The role does not exist" });
    }

    const roleId = roleFound.rows[0].role_id;

    // 3. Verifica si el usuario ya existe (por email)
    const userFound = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userFound.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "User already exists" });
    }

    // 4. Cifra la contraseña antes de almacenarla
    const passwordHash = await bcrypt.hash(password, 10);

    // 5. Inserta el nuevo usuario en la base de datos
    const newUser = await client.query(
      `INSERT INTO users (name, email, password, role_id)
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, name, email, role_id`,
      [name, email, passwordHash, roleId]
    );

    // 6. Crea el token de acceso JWT
    const token = await createdAccessToken(newUser.rows[0]);

    // 7. Establece el token como una cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true, // No accesible mediante JavaScript en el navegador
      secure: process.env.NODE_ENV === "production", // Solo sobre HTTPS en prod
      sameSite: "none", // Necesario si la API y el cliente están en dominios diferentes
    });

    await client.query("COMMIT"); // Confirma la transacción

    // 8. Responde con el usuario registrado y el token
    return res.status(201).json({
      message: "User registered successfully",
      user: newUser.rows[0],
      token: token,
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Deshace la transacción en caso de error
    console.error("Error during register:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release(); // Libera el cliente de vuelta al pool
  }
};

/**
 * Procesa el inicio de sesión de un usuario.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Busca el usuario por email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json(["Usuario no encontrado"]);
    }

    const userFound = result.rows[0];

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

export const verifyToken = async (req, res) => {
  try {
    // En este punto, authRequired ya pasó,
    // y req.user tiene { id, role } del usuario autenticado
    const { id, role } = req.user

    const result = await pool.query("SELECT user_id, email, role_id, name FROM users WHERE user_id = $1", [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" })
    }

    const userFound = result.rows[0]

    return res.json({
      id: userFound.user_id,
      email: userFound.email,
      role: userFound.role_id,
      name: userFound.name, // ✅ ESTO ES LO QUE FALTABA
    })
  } catch (error) {
    console.error("verifyToken error:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
