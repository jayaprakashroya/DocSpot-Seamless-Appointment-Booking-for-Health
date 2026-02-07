const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const doctorController = require('../controllers/doctorController');
const adminController = require('../controllers/adminController');
const router = express.Router();

// Get admin statistics (total users, doctors, appointments, pending approvals)
router.get('/stats', auth, requireAdmin, adminController.getStats);

// List pending doctor applications (admin only, paginated)
router.get('/pending-doctors', auth, requireAdmin, doctorController.listPending);

// Public demo overview for quick testing (no auth)
router.get('/sample-overview', adminController.sampleOverview);

// Approve doctor (admin only)
router.post('/approve-doctor/:id', auth, requireAdmin, doctorController.approveDoctor);

// Reject doctor (admin only)
router.post('/reject-doctor/:id', auth, requireAdmin, doctorController.rejectDoctor);

module.exports = router;
