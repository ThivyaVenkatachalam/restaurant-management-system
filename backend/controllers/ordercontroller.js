const pool = require('../config/db');

// GET all orders
const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT orders.*, 
             restaurant_tables.number AS table_number,
             users.name AS staff_name
      FROM orders
      JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
    `);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single order with items
const getOrder = async (req, res) => {
  try {
    // Get order details
    const [orders] = await pool.query(`
      SELECT orders.*,
             restaurant_tables.number AS table_number,
             users.name AS staff_name
      FROM orders
      JOIN restaurant_tables ON orders.table_id = restaurant_tables.id
      JOIN users ON orders.user_id = users.id
      WHERE orders.id = ?
    `, [req.params.id]);

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Get order items
    const [items] = await pool.query(`
      SELECT order_items.*,
             menu_items.name AS item_name,
             menu_items.price AS item_price
      FROM order_items
      JOIN menu_items ON order_items.menu_item_id = menu_items.id
      WHERE order_items.order_id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: { ...orders[0], items }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE order
const createOrder = async (req, res) => {
  try {
    const { table_id, items } = req.body;
    const user_id = req.user.id;

    console.log('Creating order:', { table_id, items, user_id }); // debug

    if (!table_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Table and items are required'
      });
    }
    // Calculate total price
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const [menuItems] = await pool.query(
        'SELECT * FROM menu_items WHERE id = ? AND is_available = true',
        [item.menu_item_id]
      );

      if (menuItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menu_item_id} not found or unavailable`
        });
      }

      const price = menuItems[0].price * item.quantity;
      total += price;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity:     item.quantity,
        price:        menuItems[0].price
      });
    }

    // Create order
    const [result] = await pool.query(
      'INSERT INTO orders (table_id, user_id, total) VALUES (?, ?, ?)',
      [table_id, user_id, total]
    );

    const order_id = result.insertId;

    // Insert order items
    for (const item of orderItems) {
      await pool.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [order_id, item.menu_item_id, item.quantity, item.price]
      );
    }

    // Update table status to occupied
    await pool.query(
      "UPDATE restaurant_tables SET status = 'occupied' WHERE id = ?",
      [table_id]
    );

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { id: order_id, table_id, total, items: orderItems }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'preparing', 'served', 'paid'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get order to find table
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?', [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    // If order is paid → set table back to available
    if (status === 'paid') {
      await pool.query(
        "UPDATE restaurant_tables SET status = 'available' WHERE id = ?",
        [orders[0].table_id]
      );
    }

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE order (admin only)
const deleteOrder = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?', [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

    // Set table back to available
    await pool.query(
      "UPDATE restaurant_tables SET status = 'available' WHERE id = ?",
      [orders[0].table_id]
    );

    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus, deleteOrder };