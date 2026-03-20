const pool = require('../config/db');

// GET all menu items
const getMenuItems = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT menu_items.*, categories.name AS category_name
      FROM menu_items
      JOIN categories ON menu_items.category_id = categories.id
      ORDER BY categories.name, menu_items.name
    `);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET menu items by category
const getMenuByCategory = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT menu_items.*, categories.name AS category_name
      FROM menu_items
      JOIN categories ON menu_items.category_id = categories.id
      WHERE menu_items.category_id = ?
      AND menu_items.is_available = true
    `, [req.params.categoryId]);

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE menu item (admin only)
const createMenuItem = async (req, res) => {
  try {
    const { category_id, name, description, price } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, price and category are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO menu_items (category_id, name, description, price) VALUES (?, ?, ?, ?)',
      [category_id, name, description, price]
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created',
      data: { id: result.insertId, name, price }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE menu item (admin only)
const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, is_available } = req.body;

    await pool.query(
      `UPDATE menu_items
       SET name=?, description=?, price=?, is_available=?
       WHERE id=?`,
      [name, description, price, is_available, req.params.id]
    );

    res.json({ success: true, message: 'Menu item updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE menu item (admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM menu_items WHERE id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMenuItems, getMenuByCategory, createMenuItem, updateMenuItem, deleteMenuItem };