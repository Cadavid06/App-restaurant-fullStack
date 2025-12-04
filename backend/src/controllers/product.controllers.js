import pool from "../db.js";

export const createProduct = async (req, res) => {
  // 1. Agregamos 'size' al destructuring
  const { name, description, price, category, size } = req.body;

  try {
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validación de tipos
    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof category !== "string" 
      // Nota: No validamos size aquí estrictamente porque puede ser null/undefined
    ) {
      return res.status(400).json({ message: "Invalid field types" });
    }

    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "The price must be a number greater than 0" });
    }

    // --- Lógica para Categoría (Buscar ID por nombre) ---
    const categoryFound = await pool.query(
      "SELECT category_id FROM category WHERE name = $1",
      [category.trim()]
    );
    if (categoryFound.rows.length === 0)
      return res.status(400).json({ message: "The category does not exist" });

    const category_id = categoryFound.rows[0].category_id;

    // --- Lógica para Tamaño (Buscar ID por nombre) ---
    let size_id = null; // Por defecto es null (para productos sin tamaño)
    
    if (size && size.trim() !== "") {
      const sizeFound = await pool.query(
        "SELECT size_id FROM sizes WHERE name = $1",
        [size.trim()]
      );
      
      // Si enviaron un tamaño pero no existe en la BD
      if (sizeFound.rows.length === 0) {
         return res.status(400).json({ message: "The size does not exist" });
      }
      
      size_id = sizeFound.rows[0].size_id;
    }

    // --- Insertar Producto ---
    const newProduct = await pool.query(
      `INSERT INTO product (name, description, price, category_id, size_id) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), description.trim(), price, category_id, size_id]
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
  try {
    // Agregamos el LEFT JOIN con sizes para traer el nombre del tamaño
    const products = await pool.query(`
      SELECT p.*, c.name AS category_name, s.name AS size_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
      LEFT JOIN sizes s ON p.size_id = s.size_id
      ORDER BY p.product_id ASC
    `);
    
    return res.json(products.rows);
    
  } catch (error) {
    console.error("Error displaying products:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await pool.query(
      "SELECT * FROM product WHERE product_id = $1",
      [id]
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

  try {
    // Validaciones básicas...
    if (isNaN(data.price) || data.price <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    // Buscar Category ID
    const categoryFound = await pool.query(
      "SELECT category_id FROM category WHERE name = $1",
      [data.category.trim()]
    );
    if (categoryFound.rows.length === 0)
      return res.status(400).json({ message: "The category does not exist" });
    const category_id = categoryFound.rows[0].category_id;

    // Buscar Size ID (Lógica nueva)
    let size_id = null;
    if (data.size && data.size.trim() !== "") {
      const sizeFound = await pool.query(
        "SELECT size_id FROM sizes WHERE name = $1",
        [data.size.trim()]
      );
      if (sizeFound.rows.length > 0) {
        size_id = sizeFound.rows[0].size_id;
      }
    }

    // Update
    const result = await pool.query(
      `UPDATE product 
       SET name = $1, description = $2, price = $3, category_id = $4, size_id = $5 
       WHERE product_id = $6 RETURNING *`,
      [data.name.trim(), data.description.trim(), data.price, category_id, size_id, id]
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

  try {
    const result = await pool.query(
      "DELETE FROM product WHERE product_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Product not found" });

    return res.json({
      message: "Product deleted successfully",
      deletedProduct: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
