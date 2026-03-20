const express    = require('express');
const router     = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/ordercontroller');

router.get('/',          verifyToken, getOrders);
router.get('/:id',       verifyToken, getOrder);
router.post('/',         verifyToken, createOrder);
router.put('/:id/status', verifyToken, updateOrderStatus);
router.delete('/:id',    verifyToken, isAdmin, deleteOrder);

module.exports = router;