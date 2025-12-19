/**
 * Controladores para categorías con soporte multi-inquilino
 */

import pool from "../db.js";

export const createCategory = async (req, res) => {
  const { name } = req.body;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Category name is required" });

    // ✅ Verificar que no exista la categoría en ESTE restaurante
    const exists = await pool.query(
      "SELECT 1 FROM category WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
      [name.trim(), restaurant_id]
    );
    if (exists.rows.length > 0)
      return res
        .status(409)
        .json({ message: "Category already exists in your restaurant" });

    // ✅ Insertar categoría con restaurant_id
    const newCategory = await pool.query(
      "INSERT INTO category (name, restaurant_id) VALUES ($1, $2) RETURNING *",
      [name.trim(), restaurant_id]
    );

    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategories = async (req, res) => {
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Filtrar categorías SOLO del restaurante actual
    const categories = await pool.query(
      "SELECT * FROM category WHERE restaurant_id = $1 OR restaurant_id IS NULL ORDER BY category_id ASC",
      [restaurant_id]
    );

    if (categories.rows.length === 0)
      return res.status(200).json({ message: "No categories found", data: [] });

    return res.json(categories.rows);
  } catch (error) {
    console.error("Error displaying categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategory = async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Verificar que la categoría pertenezca al restaurante
    const categories = await pool.query(
      "SELECT * FROM category WHERE category_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
      [id, restaurant_id]
    );
    if (categories.rows.length === 0)
      return res.status(404).json({ message: "Category not found" });

    res.json(categories.rows[0]);
  } catch (error) {
    console.error("Error displaying category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Category name is required" });

    // ✅ Verificar que no exista otra categoría con el mismo nombre en este restaurante
    const exists = await pool.query(
      "SELECT 1 FROM category WHERE name = $1 AND category_id != $2 AND (restaurant_id = $3 OR restaurant_id IS NULL)",
      [name.trim(), id, restaurant_id]
    );
    if (exists.rows.length > 0)
      return res
        .status(409)
        .json({ message: "Category already exists in your restaurant" });

    // ✅ Actualizar solo si pertenece al restaurante
    const result = await pool.query(
      "UPDATE category SET name = $1 WHERE category_id = $2 AND (restaurant_id = $3 OR restaurant_id IS NULL) RETURNING *",
      [name.trim(), id, restaurant_id]
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Category not found or unauthorized" });

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Eliminar solo si pertenece al restaurante
    const result = await pool.query(
      "DELETE FROM category WHERE category_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL) RETURNING *",
      [id, restaurant_id]
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Category not found or unauthorized" });

    return res.json({
      message: "Category deleted successfully",
      deletedCategory: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
