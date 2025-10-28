import pool from "../db.js";

export const createProduct = async (req, res) => {
  const { name, description, price, category } = req.body;

  try {
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof category !== "string"
    ) {
      return res.status(400).json({ message: "Invalid field types" });
    }

    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .json({ message: "The price must be a number greater than 0" });
    }

    const normalizedName = name.trim().toLowerCase();

    const categoryFound = await pool.query(
      "SELECT category_id FROM category WHERE name = $1",
      [category.trim()]
    );
    if (categoryFound.rows.length === 0)
      return res.status(400).json({ message: "The category does not exist" });

    const category_id = categoryFound.rows[0].category_id;

    const productFound = await pool.query(
      "SELECT 1 FROM product WHERE LOWER(name) = $1",
      [normalizedName]
    );
    if (productFound.rows.length > 0)
      return res.status(409).json({ message: "Product already exists" });

    const newProduct = await pool.query(
      `INSERT INTO product (name, description, price, category_id) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), description.trim(), price, category_id]
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
    const products = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.category_id
    `);
    if (products.rows.length === 0)
      return res.status(200).json({ message: "No products found", data: [] });

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
    if (
      typeof data.name !== "string" ||
      typeof data.description !== "string" ||
      typeof data.category !== "string"
    ) {
      return res.status(400).json({ message: "Invalid field types" });
    }

    if (isNaN(data.price) || data.price <= 0) {
      return res
        .status(400)
        .json({ message: "The price must be a number greater than 0" });
    }

    const categoryFound = await pool.query(
      "SELECT category_id FROM category WHERE name = $1",
      [data.category.trim()]
    );
    if (categoryFound.rows.length === 0)
      return res.status(400).json({ message: "The category does not exist" });

    const category_id = categoryFound.rows[0].category_id;

    const result = await pool.query(
      `UPDATE product SET name = $1, description = $2, price = $3, category_id = $4 
      WHERE product_id = $5 RETURNING *`,
      [data.name.trim(), data.description.trim(), data.price, category_id, id]
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
