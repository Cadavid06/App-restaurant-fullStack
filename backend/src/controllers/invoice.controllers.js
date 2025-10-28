import pool from "../db.js";

export const createInvoice = async (req, res) => {
  const { payment_method } = req.body;
  const idOrder = req.params.id;
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

    const orderFound = await client.query(
      `SELECT order_id, date_time FROM "order" 
        WHERE order_id  = $1`,
      [idOrder]
    );
    if (orderFound.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const existsInvoice = await client.query(
      "SELECT invoice_id FROM invoice WHERE order_id = $1",
      [idOrder]
    );
    if (existsInvoice.rows.length > 0)
      return res.status(404).json({ message: "Invoice already exists" });

    const orderDetail = await client.query(
      `SELECT amount, unit_price FROM order_detail WHERE order_id = $1`,
      [idOrder]
    );
    if (orderDetail.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Cannot create invoice without products" });
    }

    const total_payment = orderDetail.rows.reduce(
      (acc, item) => acc + Number(item.amount) * Number(item.unit_price),
      0
    );

    const dateInvoice = new Date();

    const newInvoice = await client.query(
      `INSERT INTO invoice (order_id, date_time, total_payment, payment_method, employee_id) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [idOrder, dateInvoice, total_payment, payment_method, idEmployee]
    );

    // ✅ Actualiza el status de la orden a "Completado"
    await client.query(`UPDATE "order" SET status = $1 WHERE order_id = $2`, [
      "Completado",
      idOrder,
    ]);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Invoice created successfully",
      invoice: newInvoice.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating invoice:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getInvoices = async (req, res) => {
  try {
    const invoiceFound = await pool.query("SELECT * FROM invoice");
    if (invoiceFound.rows.length === 0)
      return res.status(200).json({ message: "No invoices found", data: [] });

    return res.json({
      success: true,
      Invoices: invoiceFound.rows,
    });
  } catch (error) {
    console.error("Error displaying invoices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    // Query para obtener la factura con productos
    const invoiceQuery = await pool.query(
      `SELECT i.invoice_id, i.order_id, i.date_time, i.total_payment, i.payment_method, i.employee_id,
              od.amount, od.unit_price, p.name
       FROM invoice i
       LEFT JOIN order_detail od ON i.order_id = od.order_id
       LEFT JOIN product p ON od.product_id = p.product_id
       WHERE i.order_id = $1`,
      [id]
    );

    if (invoiceQuery.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Agrupar productos en un array
    const invoiceData = invoiceQuery.rows[0];
    const products = invoiceQuery.rows.map((row) => ({
      name: row.name,
      amount: Number(row.amount),
      price: Number(row.unit_price),
      subtotal: Number(row.amount) * Number(row.unit_price),
    }));

    const invoice = {
      ...invoiceData,
      products,
    };

    return res.json({
      success: true,
      orders: [invoice], // Mantén la estructura para compatibilidad con el frontend
    });
  } catch (error) {
    console.error("Error displaying invoices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM invoice WHERE invoice_id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Invoice not found" });

    return res.json({
      message: "Invoice deleted successfully",
      deletedInvoice: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete invoice:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
