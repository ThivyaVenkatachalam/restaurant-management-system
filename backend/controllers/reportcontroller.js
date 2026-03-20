const pool = require('../config/db');

// GET dashboard summary
const getDashboard = async (req, res) => {
  try {
    // Total orders today
    const [todayOrders] = await pool.query(`
      SELECT COUNT(*) AS total_orders,
             SUM(total) AS total_revenue
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);

    // Orders by status
    const [ordersByStatus] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `);

    // Available tables
    const [availableTables] = await pool.query(`
      SELECT 
        COUNT(*) AS total_tables,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) AS reserved
      FROM restaurant_tables
    `);

    // Top 5 selling items
    const [topItems] = await pool.query(`
      SELECT menu_items.name,
             SUM(order_items.quantity) AS total_sold,
             SUM(order_items.quantity * order_items.price) AS total_revenue
      FROM order_items
      JOIN menu_items ON order_items.menu_item_id = menu_items.id
      GROUP BY menu_items.id
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Total revenue this month
    const [monthRevenue] = await pool.query(`
      SELECT SUM(total) AS monthly_revenue
      FROM orders
      WHERE MONTH(created_at) = MONTH(CURDATE())
      AND YEAR(created_at) = YEAR(CURDATE())
      AND status = 'paid'
    `);

    res.json({
      success: true,
      data: {
        today: {
          total_orders:  todayOrders[0].total_orders,
          total_revenue: todayOrders[0].total_revenue || 0
        },
        orders_by_status: ordersByStatus,
        tables:           availableTables[0],
        top_items:        topItems,
        monthly_revenue:  monthRevenue[0].monthly_revenue || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET revenue by date range
const getRevenueByDate = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Please provide from and to date. Example: ?from=2026-03-01&to=2026-03-14'
      });
    }

    const [revenue] = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total_orders,
        SUM(total) AS total_revenue
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ?
      AND status = 'paid'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [from, to]);

    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) AS total_orders,
        SUM(total) AS total_revenue
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ?
      AND status = 'paid'
    `, [from, to]);

    res.json({
      success: true,
      data: {
        summary:    summary[0],
        daily:      revenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET most ordered items
const getTopItems = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT 
        menu_items.name,
        categories.name AS category,
        SUM(order_items.quantity)              AS total_ordered,
        SUM(order_items.quantity * order_items.price) AS total_revenue
      FROM order_items
      JOIN menu_items  ON order_items.menu_item_id = menu_items.id
      JOIN categories  ON menu_items.category_id   = categories.id
      GROUP BY menu_items.id
      ORDER BY total_ordered DESC
    `);

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getRevenueByDate, getTopItems };