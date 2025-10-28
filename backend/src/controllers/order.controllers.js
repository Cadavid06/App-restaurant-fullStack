import pool from "../db.js";

export const createOrder = async (req, res) => {
  const { tableNumber, products } = req.body;
  const { id: idEmployee, role } = req.user || {};

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!idEmployee) {
      await client.query("ROLLBACK");
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (![1, 2].includes(role)) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "Only employees or admins can create orders" });
    }

    if (!tableNumber || !Array.isArray(products) || products.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "All fields are required" });
    }

    for (const item of products) {
      const productFound = await client.query(
        "SELECT * FROM product WHERE name = $1",
        [item.name]
      );
      if (productFound.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Product not found" });
      }

      const productId = productFound.rows[0].product_id;

      if (
        typeof productId !== "number" ||
        !Number.isInteger(item.amount) ||
        item.amount <= 0
      ) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message:
            "Each product must have numeric productId and positive integer amount",
        });
      }
    }

    const newOrder = await client.query(
      `INSERT INTO "order" (employee_id, date_time, table_number, status) 
      VALUES ($1, NOW(), $2, $3) RETURNING *`,
      [idEmployee, tableNumber, "Pendiente"]
    );

    const idOrder = newOrder.rows[0].order_id;

    for (const item of products) {
      const { name, amount } = item;

      const productFound = await client.query(
        "SELECT * FROM product WHERE name = $1",
        [name]
      );
      if (productFound.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Product not found" });
      }

      const productId = productFound.rows[0].product_id;

      const price = productFound.rows[0].price;

      await client.query(
        `INSERT INTO order_detail (order_id, product_id, amount, unit_price) 
        VALUES ($1, $2, $3, $4)`,
        [idOrder, productId, amount, price]
      );
    }

    await client.query("COMMIT");

    const full = await pool.query(
      `SELECT o.order_id, o.employee_id, o.table_number, o.date_time, o.status,
              od.detail_id, od.product_id, od.amount, od.unit_price
       FROM "order" o
       JOIN order_detail od ON o.order_id = od.order_id
       WHERE o.order_id = $1`,
      [idOrder]
    );

    const orderInfo = {
      ...newOrder.rows[0],
      details: full.rows.map((r) => ({
        detail_id: r.detail_id,
        product_id: r.product_id,
        amount: r.amount,
        unit_price: r.unit_price,
      })),
    };

    return res.status(201).json({
      message: "Order created successfully",
      order: orderInfo,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getOrders = async (req, res) => {
  try {
    // Query con JOIN para incluir indicador de factura
    const ordersFound = await pool.query(`
      SELECT 
        o.*,
        CASE WHEN i.invoice_id IS NOT NULL THEN true ELSE false END AS has_invoice
      FROM "order" o
      LEFT JOIN invoice i ON o.order_id = i.order_id
    `);

    if (ordersFound.rows.length === 0) {
      return res.status(200).json({ message: "No orders found", data: [] });
    }

    return res.json(ordersFound.rows);
  } catch (error) {
    console.error("Error displaying orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrder = async (req, res) => {
  const { id } = req.params;
  try {
    // Obtener la orden básica
    const orderFound = await pool.query(
      'SELECT * FROM "order" WHERE order_id = $1',
      [id]
    );

    if (orderFound.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Obtener los productos del pedido con JOIN
    const productsFound = await pool.query(
      `SELECT 
        od.detail_id,
        od.product_id,
        od.amount,
        od.unit_price,
        p.name,
        p.price
      FROM order_detail od
      JOIN product p ON od.product_id = p.product_id
      WHERE od.order_id = $1`,
      [id]
    );

    // Construir respuesta completa
    const orderWithProducts = {
      ...orderFound.rows[0],
      products: productsFound.rows.map((p) => ({
        detail_id: p.detail_id,
        product_id: p.product_id,
        name: p.name,
        amount: p.amount,
        price: p.unit_price || p.price,
      })),
    };

    res.json(orderWithProducts);
  } catch (error) {
    console.error("Error displaying order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (
      typeof data.tableNumber !== "number" ||
      data.tableNumber <= 0
    ) {
      return res.status(400).json({ message: "Invalid field types" });
    }

    for (const item of data.products) {
      if (typeof item.name !== "string" || item.amount <= 0)
        return res.status(400).json({ message: "Invalid field types" });
    }

    const result = await client.query(
      `UPDATE "order" SET table_number = $1 
      WHERE order_id = $2 RETURNING *`,
      [data.tableNumber, id]
    );
    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const details = await client.query(
      "SELECT detail_id, product_id FROM order_detail WHERE order_id = $1",
      [id]
    );

    const mergedProducts = Object.values(
      data.products.reduce((acc, p) => {
        const name = p.name.trim().toLowerCase();
        if (!acc[name]) acc[name] = { ...p, amount: p.amount };
        else acc[name].amount += p.amount;
        return acc;
      }, {})
    );

    for (const item of mergedProducts) {
      const productClient = await client.query(
        "SELECT product_id, price FROM product WHERE name = $1",
        [item.name.trim()]
      );
      if (productClient.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Product not found" });
      }

      const { product_id, price } = productClient.rows[0];

      const existing = details.rows.find((d) => d.product_id === product_id);
      if (existing) {
        await client.query(
          `UPDATE order_detail SET amount = $1, unit_price = $2 
          WHERE detail_id = $3`,
          [item.amount, price, existing.detail_id]
        );
      } else {
        await client.query(
          `INSERT INTO order_detail (order_id, product_id, amount, unit_price)
          VALUES ($1, $2, $3, $4)`,
          [id, product_id, item.amount, price]
        );
      }
    }

    const nameProducts = data.products.map((n) => n.name.trim());
    const allIds = await client.query(
      "SELECT product_id FROM product WHERE name = ANY($1)",
      [nameProducts]
    );

    const idsProducts = allIds.rows.map((i) => i.product_id);

    await client.query(
      `DELETE FROM order_detail
       WHERE order_id = $1 AND product_id NOT IN (${idsProducts.join(",")})`,
      [id]
    );

    await client.query("COMMIT");
    return res.status(200).json({ message: "Order updated successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    // ✅ Verificar si el pedido tiene una factura
    const invoiceCheck = await client.query(
      "SELECT * FROM invoice WHERE order_id = $1",
      [id]
    );

    if (invoiceCheck.rows.length > 0) {
      // Si existe una factura, mostramos un aviso, pero permitimos continuar
      console.log(
        `⚠️ Pedido ${id} tiene una factura asociada. La factura se conservará.`
      );
    }

    await client.query("BEGIN");

    // Primero elimina los detalles del pedido
    await client.query("DELETE FROM order_detail WHERE order_id = $1", [id]);

    // Luego elimina el pedido
    const result = await client.query(
      'DELETE FROM "order" WHERE order_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    await client.query("COMMIT");

    // ✅ Si el pedido tenía factura, informamos
    if (invoiceCheck.rows.length > 0) {
      return res.status(200).json({
        message: "El pedido fue eliminado, pero la factura se conserva.",
        deletedOrder: result.rows[0],
        hasInvoice: true,
      });
    }

    // ✅ Caso normal sin factura
    return res.status(200).json({
      message: "Pedido eliminado correctamente",
      deletedOrder: result.rows[0],
      hasInvoice: false,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting order:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
