import pool from "../db.js";

export const createProduct = async (req, res) => {
  const { name, description, price, category, size } = req.body;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // La estructura y tipos de `name`, `description`, `price` y `category` la valida Zod (`createProductSchema`).
    // Aquí solo comprobamos existencia de categoría/tamaño y reglas de negocio.
    const categoryFound = await pool.query(
      "SELECT category_id FROM category WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
      [category.trim(), restaurant_id]
    );
    if (categoryFound.rows.length === 0)
      return res.status(400).json({ message: "The category does not exist" });

    const category_id = categoryFound.rows[0].category_id;

    // ✅ Buscar tamaño SOLO dentro del restaurante actual
    let size_id = null;

    if (size && size.trim() !== "") {
      const sizeFound = await pool.query(
        "SELECT size_id FROM sizes WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
        [size.trim(), restaurant_id]
      );

      if (sizeFound.rows.length === 0) {
        return res.status(400).json({ message: "The size does not exist" });
      }

      size_id = sizeFound.rows[0].size_id;
    }

    // ✅ Insertar producto con restaurant_id
    const newProduct = await pool.query(
      `INSERT INTO product (name, description, price, category_id, size_id, restaurant_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name.trim(),
        description.trim(),
        price,
        category_id,
        size_id,
        restaurant_id,
      ]
    );

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct.rows[0],
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  const { restaurant_id, role } = req.user;

  try {
    let productsQuery;
    let params = [];

    // Si es Developer en modo global, puede ver todos los productos
    if (role === 3 && !restaurant_id) {
      productsQuery = `
        SELECT p.*, c.name AS category_name, s.name AS size_name
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        LEFT JOIN sizes s ON p.size_id = s.size_id
        ORDER BY p.product_id ASC
      `;
    } else {
      // Admin/Empleado o Developer con restaurant seleccionado: ver productos de su restaurante y globales
      productsQuery = `
        SELECT p.*, c.name AS category_name, s.name AS size_name
        FROM product p
        LEFT JOIN category c ON p.category_id = c.category_id
        LEFT JOIN sizes s ON p.size_id = s.size_id
        WHERE p.restaurant_id = $1 OR p.restaurant_id IS NULL
        ORDER BY p.product_id ASC
      `;
      params = [restaurant_id];
    }

    const products = await pool.query(productsQuery, params);

    return res.json(products.rows);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getProduct = async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Verificar que el producto pertenezca al restaurante
    const product = await pool.query(
      "SELECT * FROM product WHERE product_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
      [id, restaurant_id]
    );
    if (product.rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json(product.rows[0]);
  } catch (error) {
    console.error("Error displaying product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // El precio y otros tipos ya fueron validados por Zod (`updateProductSchema`).

    // ✅ Verificar que el producto pertenezca al restaurante antes de actualizar
    const productCheck = await pool.query(
      "SELECT * FROM product WHERE product_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
      [id, restaurant_id]
    );
    if (productCheck.rows.length === 0)
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });

    // ✅ Buscar categoría dentro del restaurante
    const categoryFound = await pool.query(
      "SELECT category_id FROM category WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
      [data.category.trim(), restaurant_id]
    );
    if (categoryFound.rows.length === 0)
      return res.status(400).json({ message: "The category does not exist" });
    const category_id = categoryFound.rows[0].category_id;

    // ✅ Buscar tamaño dentro del restaurante
    let size_id = null;
    if (data.size && data.size.trim() !== "") {
      const sizeFound = await pool.query(
        "SELECT size_id FROM sizes WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
        [data.size.trim(), restaurant_id]
      );
      if (sizeFound.rows.length > 0) {
        size_id = sizeFound.rows[0].size_id;
      }
    }

    // ✅ Actualizar producto (mantiene el restaurant_id original)
    const result = await pool.query(
      `UPDATE product 
       SET name = $1, description = $2, price = $3, category_id = $4, size_id = $5 
       WHERE product_id = $6 AND (restaurant_id = $7 OR restaurant_id IS NULL) RETURNING *`,
      [
        data.name.trim(),
        data.description.trim(),
        data.price,
        category_id,
        size_id,
        id,
        restaurant_id,
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Product not found" });

    return res.status(201).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Solo eliminar si pertenece al restaurante
    const result = await pool.query(
      "DELETE FROM product WHERE product_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL) RETURNING *",
      [id, restaurant_id]
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized" });

    return res.json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
