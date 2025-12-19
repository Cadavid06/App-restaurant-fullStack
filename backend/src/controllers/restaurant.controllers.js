/**
 * Controladores para la gestión de restaurantes (multi-inquilino)
 * Solo accesible por el rol Developer (role_id = 1)
 */
import pool from "../db.js";

/**
 * Crear un nuevo restaurante
 * Solo Developer puede crear restaurantes
 */
export const createRestaurant = async (req, res) => {
  const { name, address, phone } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Validaciones
    if (!name || name.trim() === "") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Restaurant name is required" });
    }

    // Verificar que no exista un restaurante con el mismo nombre
    const exists = await client.query(
      "SELECT 1 FROM restaurants WHERE name = $1",
      [name.trim()]
    );

    if (exists.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ message: "Restaurant name already exists" });
    }

    // Crear el restaurante
    const newRestaurant = await client.query(
      `INSERT INTO restaurants (name, address, phone, is_active) 
       VALUES ($1, $2, $3, TRUE) RETURNING *`,
      [name.trim(), address?.trim() || null, phone?.trim() || null]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: newRestaurant.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

/**
 * Obtener todos los restaurantes
 * Solo Developer puede ver todos los restaurantes
 */
export const getRestaurants = async (req, res) => {
  try {
    const restaurants = await pool.query(
      "SELECT * FROM restaurants ORDER BY created_at DESC"
    );

    if (restaurants.rows.length === 0) {
      return res
        .status(200)
        .json({ message: "No restaurants found", data: [] });
    }

    return res.json(restaurants.rows);
  } catch (error) {
    console.error("Error displaying restaurants:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Obtener un restaurante específico por ID
 */
export const getRestaurant = async (req, res) => {
  const { id } = req.params;
  const { role, restaurant_id } = req.user;

  try {
    // 🛡️ VALIDACIÓN DE SEGURIDAD
    // Si NO es Developer (Rol 3)...
    if (role !== 3) {
      // ...verificamos que el ID solicitado coincida con su ID asignado.
      // Usamos '==' para evitar errores si uno es string y el otro number
      if (id != restaurant_id) {
        return res
          .status(403)
          .json({ message: "No tienes permiso para ver este restaurante." });
      }
    }

    const restaurant = await pool.query(
      "SELECT * FROM restaurants WHERE restaurant_id = $1",
      [id]
    );

    if (restaurant.rows.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.json(restaurant.rows[0]);
  } catch (error) {
    console.error("Error displaying restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/**
 * Actualizar información de un restaurante
 */
export const updateRestaurant = async (req, res) => {
  const { id } = req.params;
  const { name, address, phone, is_active } = req.body;

  try {
    // Validaciones
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Restaurant name is required" });
    }

    // Verificar que no exista otro restaurante con el mismo nombre
    const exists = await pool.query(
      "SELECT 1 FROM restaurants WHERE name = $1 AND restaurant_id != $2",
      [name.trim(), id]
    );

    if (exists.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Restaurant name already exists" });
    }

    // Actualizar restaurante
    const result = await pool.query(
      `UPDATE restaurants 
       SET name = $1, address = $2, phone = $3, is_active = $4 
       WHERE restaurant_id = $5 RETURNING *`,
      [
        name.trim(),
        address?.trim() || null,
        phone?.trim() || null,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.json({
      message: "Restaurant updated successfully",
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Desactivar un restaurante (soft delete)
 * No se elimina físicamente, solo se marca como inactivo
 */
export const deactivateRestaurant = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE restaurants SET is_active = FALSE 
       WHERE restaurant_id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    return res.json({
      message: "Restaurant deactivated successfully",
      restaurant: result.rows[0],
    });
  } catch (error) {
    console.error("Error deactivating restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Eliminar permanentemente un restaurante (usar con precaución)
 * Esto eliminará en cascada todos los datos asociados
 */
export const deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el restaurante existe
    const restaurant = await client.query(
      "SELECT * FROM restaurants WHERE restaurant_id = $1",
      [id]
    );

    if (restaurant.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Contar usuarios asociados
    const userCount = await client.query(
      "SELECT COUNT(*) FROM users WHERE restaurant_id = $1",
      [id]
    );

    // Advertir si hay datos asociados
    const hasUsers = parseInt(userCount.rows[0].count) > 0;

    // Eliminar el restaurante (cascada se encargará del resto)
    const result = await client.query(
      "DELETE FROM restaurants WHERE restaurant_id = $1 RETURNING *",
      [id]
    );

    await client.query("COMMIT");

    return res.json({
      message: "Restaurant deleted permanently",
      warning: hasUsers ? "Associated users were also deleted" : null,
      deletedRestaurant: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting restaurant:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

/**
 * Obtener estadísticas de un restaurante
 */
export const getRestaurantStats = async (req, res) => {
  const { id } = req.params;

  try {
    // Validar que el restaurante existe
    const restaurant = await pool.query(
      "SELECT * FROM restaurants WHERE restaurant_id = $1",
      [id]
    );

    if (restaurant.rows.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Obtener estadísticas
    const stats = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE restaurant_id = $1) AS total_users,
        (SELECT COUNT(*) FROM product WHERE restaurant_id = $1) AS total_products,
        (SELECT COUNT(*) FROM "order" WHERE restaurant_id = $1) AS total_orders,
        (SELECT COUNT(*) FROM invoice WHERE restaurant_id = $1) AS total_invoices,
        (SELECT COALESCE(SUM(total_payment), 0) FROM invoice WHERE restaurant_id = $1) AS total_revenue`,
      [id]
    );

    return res.json({
      restaurant: restaurant.rows[0],
      stats: stats.rows[0],
    });
  } catch (error) {
    console.error("Error getting restaurant stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
