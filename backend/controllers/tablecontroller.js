const pool = require('../config/db');

// GET all tables
const getTables = async (req, res) => {
  try {
    const [tables] = await pool.query(
      'SELECT * FROM restaurant_tables ORDER BY number ASC'
    );
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET available tables only
const getAvailableTables = async (req, res) => {
  try {
    const [tables] = await pool.query(
      "SELECT * FROM restaurant_tables WHERE status = 'available' ORDER BY number ASC"
    );
    res.json({ success: true, data: tables });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE table (admin only)
const createTable = async (req, res) => {
  try {
    const { number, capacity } = req.body;

    if (!number || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Table number and capacity are required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO restaurant_tables (number, capacity) VALUES (?, ?)',
      [number, capacity]
    );

    res.status(201).json({
      success: true,
      message: 'Table created',
      data: { id: result.insertId, number, capacity, status: 'available' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE table status
const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['available', 'occupied', 'reserved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be available, occupied or reserved'
      });
    }

    await pool.query(
      'UPDATE restaurant_tables SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ success: true, message: `Table status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE table (admin only)
const deleteTable = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM restaurant_tables WHERE id = ?', [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.json({ success: true, message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTables, getAvailableTables, createTable, updateTableStatus, deleteTable };