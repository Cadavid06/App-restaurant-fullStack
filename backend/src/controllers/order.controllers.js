import pool from "../db.js";

export const createOrder = async (req, res) => {
  const { tableNumber, products } = req.body;
  const { id: idEmployee, role, restaurant_id } = req.user || {};

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

    // ✅ Validar que todos los productos pertenezcan al restaurante
    for (const item of products) {
      const productFound = await client.query(
        "SELECT * FROM product WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
        [item.name, restaurant_id]
      );
      if (productFound.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          message: `Product '${item.name}' not found in your restaurant`,
        });
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

    // ✅ Crear orden con restaurant_id
    const newOrder = await client.query(
      `INSERT INTO "order" (employee_id, date_time, table_number, status, restaurant_id) 
      VALUES ($1, NOW(), $2, $3, $4) RETURNING *`,
      [idEmployee, tableNumber, "Pendiente", restaurant_id]
    );

    const idOrder = newOrder.rows[0].order_id;

    // ✅ Insertar detalles de la orden
    for (const item of products) {
      const { name, amount } = item;

      const productFound = await client.query(
        "SELECT * FROM product WHERE name = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
        [name, restaurant_id]
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

    // Obtener orden completa
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
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Filtrar órdenes SOLO del restaurante actual
    const ordersFound = await pool.query(
      `
      SELECT 
        o.*,
        CASE WHEN i.invoice_id IS NOT NULL THEN true ELSE false END AS has_invoice
      FROM "order" o
      LEFT JOIN invoice i ON o.order_id = i.order_id
      WHERE o.restaurant_id = $1 OR o.restaurant_id IS NULL
      ORDER BY o.date_time DESC
    `,
      [restaurant_id]
    );

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
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  try {
    // ✅ Verificar que la orden pertenezca al restaurante
    const orderFound = await pool.query(
      'SELECT * FROM "order" WHERE order_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)',
      [id, restaurant_id]
    );

    if (orderFound.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Obtener productos del pedido
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
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ✅ Verificar que la orden pertenezca al restaurante
    const orderCheck = await client.query(
      'SELECT * FROM "order" WHERE order_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)',
      [id, restaurant_id]
    );
    if (orderCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    if (typeof data.tableNumber !== "number" || data.tableNumber <= 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid field types" });
    }

    for (const item of data.products) {
      if (typeof item.name !== "string" || item.amount <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid field types" });
      }
    }

    // Actualizar orden
    const result = await client.query(
      `UPDATE "order" SET table_number = $1 
      WHERE order_id = $2 AND (restaurant_id = $3 OR restaurant_id IS NULL) RETURNING *`,
      [data.tableNumber, id, restaurant_id]
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
        const key = p.product_id;
        if (!acc[key]) acc[key] = { ...p, amount: p.amount };
        else acc[key].amount += p.amount;
        return acc;
      }, {})
    );

    for (const item of mergedProducts) {
      // ✅ Verificar que el producto pertenezca al restaurante
      const productClient = await client.query(
        "SELECT product_id, price FROM product WHERE product_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)",
        [item.product_id, restaurant_id]
      );
      if (productClient.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ message: "Product not found in your restaurant" });
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

    const idsProducts = data.products.map((p) => p.product_id);
    if (idsProducts.length > 0) {
      await client.query(
        `DELETE FROM order_detail
         WHERE order_id = $1 AND product_id NOT IN (${idsProducts.join(",")})`,
        [id]
      );
    }

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
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware
  const client = await pool.connect();

  try {
    // ✅ Verificar que la orden pertenezca al restaurante
    const orderCheck = await client.query(
      'SELECT * FROM "order" WHERE order_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL)',
      [id, restaurant_id]
    );
    if (orderCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    const invoiceCheck = await client.query(
      "SELECT * FROM invoice WHERE order_id = $1",
      [id]
    );

    if (invoiceCheck.rows.length > 0) {
      console.log(
        `⚠️ Pedido ${id} tiene una factura asociada. La factura se conservará.`
      );
    }

    await client.query("BEGIN");

    await client.query("DELETE FROM order_detail WHERE order_id = $1", [id]);

    const result = await client.query(
      'DELETE FROM "order" WHERE order_id = $1 AND (restaurant_id = $2 OR restaurant_id IS NULL) RETURNING *',
      [id, restaurant_id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    await client.query("COMMIT");

    if (invoiceCheck.rows.length > 0) {
      return res.status(200).json({
        message: "El pedido fue eliminado, pero la factura se conserva.",
        deletedOrder: result.rows[0],
        hasInvoice: true,
      });
    }

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
