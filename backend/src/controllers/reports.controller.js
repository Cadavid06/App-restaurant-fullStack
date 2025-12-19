import pool from "../db.js";

export const getReports = async (req, res) => {
  const { startDate, endDate } = req.query;
  const { restaurant_id } = req.user; // ✅ Obtenido del middleware

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required" });
  }

  try {
    // ✅ Reporte 1: Ingresos totales y número de facturas (filtrado por restaurante)
    const totalRevenueQuery = await pool.query(
      `SELECT 
        COUNT(i.invoice_id) AS total_invoices,
        COALESCE(SUM(i.total_payment), 0) AS total_revenue
      FROM invoice i
      WHERE DATE(i.date_time) >= $1 
        AND DATE(i.date_time) <= $2
        AND (i.restaurant_id = $3 OR i.restaurant_id IS NULL)`,
      [startDate, endDate, restaurant_id]
    );

    // ✅ Reporte 2: Productos más vendidos (top 10) - filtrado por restaurante
    const topProductsQuery = await pool.query(
      `SELECT 
        p.name,
        SUM(od.amount) AS total_sold,
        SUM(od.amount * od.unit_price) AS total_revenue
      FROM invoice i
      JOIN order_detail od ON i.order_id = od.order_id
      JOIN product p ON od.product_id = p.product_id
      WHERE DATE(i.date_time) >= $1 
        AND DATE(i.date_time) <= $2
        AND (i.restaurant_id = $3 OR i.restaurant_id IS NULL)
      GROUP BY p.product_id, p.name
      ORDER BY total_sold DESC
      LIMIT 10`,
      [startDate, endDate, restaurant_id]
    );

    // ✅ Reporte 3: Ingresos por empleado (solo empleados del restaurante)
    const revenueByEmployeeQuery = await pool.query(
      `SELECT 
        u.name AS employee_name,
        COUNT(i.invoice_id) AS invoices_handled,
        COALESCE(SUM(i.total_payment), 0) AS total_revenue
      FROM invoice i
      JOIN users u ON i.employee_id = u.user_id
      WHERE DATE(i.date_time) >= $1 
        AND DATE(i.date_time) <= $2
        AND (i.restaurant_id = $3 OR i.restaurant_id IS NULL)
        AND (u.restaurant_id = $3 OR u.restaurant_id IS NULL)
      GROUP BY u.user_id, u.name
      ORDER BY total_revenue DESC`,
      [startDate, endDate, restaurant_id]
    );

    res.json({
      period: { startDate, endDate },
      totalRevenue: totalRevenueQuery.rows[0],
      topProducts: topProductsQuery.rows,
      revenueByEmployee: revenueByEmployeeQuery.rows,
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
