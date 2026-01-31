import pool from "../db.js";
import moment from "moment-timezone";

export const createInvoice = async (req, res) => {
  const { payment_method } = req.body;
  const idOrder = req.params.id;
  const { id: idEmployee, role, restaurant_id } = req.user || {}; // ✅ Extraer restaurant_id

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
        .json({ message: "Only employees or admins can create invoices" });
    }

    // ✅ Verificar que la orden pertenezca al restaurante del usuario
    const orderFound = await client.query(
      `SELECT order_id, date_time, restaurant_id FROM "order" 
        WHERE order_id = $1`,
      [idOrder]
    );

    if (orderFound.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Validar que la orden pertenezca al mismo restaurante (excepto Developer)
    const orderRestaurantId = orderFound.rows[0].restaurant_id;
    if (role !== 3 && orderRestaurantId !== restaurant_id) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "Order does not belong to your restaurant" });
    }

    const existsInvoice = await client.query(
      "SELECT invoice_id FROM invoice WHERE order_id = $1",
      [idOrder]
    );
    if (existsInvoice.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Invoice already exists" });
    }

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

    const dateInvoice = moment().tz("America/Bogota").toDate();

    // ✅ Insertar factura con restaurant_id de la orden
    const newInvoice = await client.query(
      `INSERT INTO invoice (order_id, date_time, total_payment, payment_method, employee_id, restaurant_id) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        idOrder,
        dateInvoice,
        total_payment,
        payment_method,
        idEmployee,
        orderRestaurantId,
      ]
    );

    // Actualiza el status de la orden a "Completado"
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
  const { role, restaurant_id } = req.user; // ✅ Extraer del usuario

  try {
    let invoiceFound;

    // ✅ Developer puede ver todas las facturas
    if (role === 3 && !restaurant_id) {
      invoiceFound = await pool.query(
        "SELECT * FROM invoice ORDER BY date_time DESC"
      );
    } else {
      // ✅ Admin/Empleado solo ven facturas de su restaurante
      invoiceFound = await pool.query(
        "SELECT * FROM invoice WHERE restaurant_id = $1 ORDER BY date_time DESC",
        [restaurant_id]
      );
    }

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
  const { role, restaurant_id } = req.user; // ✅ Extraer del usuario

  try {
    // ✅ Query para obtener la factura con productos
    let invoiceQuery;

    if (role === 3 && !restaurant_id) {
      // Developer puede ver cualquier factura
      invoiceQuery = await pool.query(
        `SELECT i.invoice_id, i.order_id, i.date_time, i.total_payment, i.payment_method, i.employee_id, i.restaurant_id,
                od.amount, od.unit_price, p.name
         FROM invoice i
         LEFT JOIN order_detail od ON i.order_id = od.order_id
         LEFT JOIN product p ON od.product_id = p.product_id
         WHERE i.order_id = $1`,
        [id]
      );
    } else {
      // Admin/Empleado solo pueden ver facturas de su restaurante
      invoiceQuery = await pool.query(
        `SELECT i.invoice_id, i.order_id, i.date_time, i.total_payment, i.payment_method, i.employee_id, i.restaurant_id,
                od.amount, od.unit_price, p.name
         FROM invoice i
         LEFT JOIN order_detail od ON i.order_id = od.order_id
         LEFT JOIN product p ON od.product_id = p.product_id
         WHERE i.order_id = $1 AND i.restaurant_id = $2`,
        [id, restaurant_id]
      );
    }

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
      orders: [invoice],
    });
  } catch (error) {
    console.error("Error displaying invoices:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  const { role, restaurant_id } = req.user; // ✅ Extraer del usuario

  try {
    let result;

    if (role === 3 && !restaurant_id) {
      // Developer puede eliminar cualquier factura
      result = await pool.query(
        "DELETE FROM invoice WHERE invoice_id = $1 RETURNING *",
        [id]
      );
    } else {
      // Admin/Empleado solo pueden eliminar facturas de su restaurante
      result = await pool.query(
        "DELETE FROM invoice WHERE invoice_id = $1 AND restaurant_id = $2 RETURNING *",
        [id, restaurant_id]
      );
    }

    if (result.rowCount === 0)
      return res
        .status(404)
        .json({ message: "Invoice not found or unauthorized" });

    return res.json({
      message: "Invoice deleted successfully",
      deletedInvoice: result.rows[0],
    });
  } catch (error) {
    console.error("Error delete invoice:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
