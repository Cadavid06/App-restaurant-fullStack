/**
 * Contiene la lógica de negocio para las operaciones de las categorias (CRUD).
 */

import pool from "../db.js";

/**
 * Crea una nueva categoría en la base de datos
 */
export const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    //1. Verifica que el campo name se mande como es debido
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Category name is required" });

    //2. Verifica que no exista la categoría a crear
    const exists = await pool.query("SELECT 1 FROM category WHERE name = $1", [
      name.trim(),
    ]);
    if (exists.rows.length > 0)
      return res.status(409).json({ message: "Category already exists" });

    //3. Inserta la nueva categoría en la base de datos
    const newCategory = await pool.query(
      "INSERT INTO category (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );

    //4. responde con la categoría creada
    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory.rows[0],
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Obtiene todas las categorías de la base de datos
 */
export const getCategories = async (req, res) => {
  try {
    //1. Verifica que haya categorías creadas
    const categories = await pool.query("SELECT * FROM category");
    if (categories.rows.length === 0)
      return res.status(200).json({ message: "No categories found", data: [] });

    //2. Responde con el listado de todas las categorías
    return res.json(categories.rows);
  } catch (error) {
    console.error("Error displaying categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Obtiene solo una categoría por ID
 */
export const getCategory = async (req, res) => {
  const { id } = req.params;

  try {
    //1. Verifica que exista la categoría a obtener por ID
    const categories = await pool.query(
      "SELECT * FROM category WHERE category_id = $1",
      [id]
    );
    if (categories.rows.length === 0)
      return res.status(404).json({ message: "Category not found" });

    //2. Responde con la categoría obtenida
    res.json(categories.rows[0]);
  } catch (error) {
    console.error("Error displaying category:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Actualiza categorías de la base de datos
 */
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    //1. Verifica que el campo name se mande como es debido
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Category name is required" });

    //2. Verifica que la categoría exista
    const exists = await pool.query(
      "SELECT 1 FROM category WHERE name = $1 AND category_id != $2",
      [name.trim(), id]
    );
    if (exists.rows.length > 0)
      return res.status(409).json({ message: "Category already exists" });

    //3. Actualiza el nombre la categoría en la base de datos
    const result = await pool.query(
      "UPDATE category SET name = $1 WHERE category_id = $2 RETURNING *",
      [name.trim(), id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Category not found" });

    //4. Responde con la categoría actualizada
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Elimina categorías de la base de datos
 */
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    //1. Elimina una categoría de la bd por medio del id
    const result = await pool.query(
      "DELETE FROM category WHERE category_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Category not found" });

    //2. Devuelve la categoría eliminada
    return res.json({
      message: "Category deleted successfully",
      deletedCategory: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete categories:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
