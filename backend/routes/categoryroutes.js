const express      = require('express');
const router       = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categorycontroller');

router.get('/',       verifyToken, getCategories);
router.post('/',      verifyToken, isAdmin, createCategory);
router.delete('/:id', verifyToken, isAdmin, deleteCategory);

module.exports = router;