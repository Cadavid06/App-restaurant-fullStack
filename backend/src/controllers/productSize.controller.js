import pool from "../db.js";

export const createSize = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Size name is required" });
    }

    const exists = await pool.query("SELECT * FROM sizes WHERE name = $1", [
      name.trim(),
    ]);

    if (exists.rows.length > 0)
      return res.status(400).json({ message: "Size alredy exists" });

    const newSize = await pool.query(
      "INSERT INTO sizes (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );

    return res.status(201).json({
      message: "Size created successfully",
      size: newSize.rows[0],
    });
  } catch (error) {
    console.error("Error creating size:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSizes = async (req, res) => {
  try {
    const sizes = await pool.query("SELECT * FROM sizes");
    if (sizes.rows.length === 0)
      return res.status(404).json({ message: "No sizes found", data: [] });
    return res.json(sizes.rows);
  } catch (error) {
    console.error("Error displaying sizes", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSize = async (req, res) => {
  const { id } = req.params;

  try {
    const sizeFound = await pool.query(
      "SELECT * FROM sizes WHERE size_id = $1",
      [id]
    );
    if (sizeFound.rows.length > 0)
      return res.status(404).json({ message: "Size not found" });

    res.json(sizeFound.rows[0]);
  } catch (error) {
    console.error("Error displaying size", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSize = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    if (!name || name.trim() === "")
      return res.status(400).json({ message: "Size name is required" });

    const exists = await pool.query(
      "SELECT 1 FROM sizes WHERE name = $1 AND size_id != $2",
      [name.trim(), id]
    );

    if (exists.rows.length > 0)
      return res.status(409).json({ message: "Size already exists" });

    const result = await pool.query(
      "UPDATE sizes SET name = $1 WHERE size_id = $2 RETURNING *",
      [name.trim(), id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Size not found" });

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating size:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSize = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM sizes WHERE size_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Size not found" });

    return res.json({
      message: "Size deleted successfully",
      deletedSize: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete sizes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
