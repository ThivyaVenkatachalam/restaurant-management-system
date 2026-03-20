const express    = require('express');
const router     = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  getMenuItems,
  getMenuByCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menucontroller');

router.get('/',                    verifyToken, getMenuItems);
router.get('/category/:categoryId', verifyToken, getMenuByCategory);
router.post('/',                   verifyToken, isAdmin, createMenuItem);
router.put('/:id',                 verifyToken, isAdmin, updateMenuItem);
router.delete('/:id',              verifyToken, isAdmin, deleteMenuItem);

module.exports = router;