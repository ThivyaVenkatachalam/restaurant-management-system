const express    = require('express');
const router     = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getDashboard, getRevenueByDate, getTopItems } = require('../controllers/reportcontroller');

router.get('/dashboard', verifyToken, isAdmin, getDashboard);
router.get('/revenue',   verifyToken, isAdmin, getRevenueByDate);
router.get('/top-items', verifyToken, isAdmin, getTopItems);

module.exports = router;