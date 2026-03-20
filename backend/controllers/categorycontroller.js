const pool = require('../config/db');

// GET all categories
const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE category (admin only)
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (name) VALUES (?)', [name]
    );

    res.status(201).json({
      success: true,
      message: 'Category created',
      data: { id: result.insertId, name }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE category (admin only)
const deleteCategory = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCategories, createCategory, deleteCategory };