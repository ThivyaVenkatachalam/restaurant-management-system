const express    = require('express');
const router     = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getTables,
  getAvailableTables,
  createTable,
  updateTableStatus,
  deleteTable
} = require('../controllers/tablecontroller');

router.get('/',            verifyToken, getTables);
router.get('/available',   verifyToken, getAvailableTables);
router.post('/',           verifyToken, isAdmin, createTable);
router.put('/:id/status',  verifyToken, updateTableStatus);
router.delete('/:id',      verifyToken, isAdmin, deleteTable);

module.exports = router;