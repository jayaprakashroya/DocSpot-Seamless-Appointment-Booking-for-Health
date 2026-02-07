const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { requireDoctor } = require('../middlewares/roleMiddleware');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');
const router = express.Router();

// List approved doctors with search and pagination
router.get('/', doctorController.getDoctors);

// Get current doctor's profile (protected)
router.get('/profile', auth, requireDoctor, doctorController.getCurrentDoctorProfile);

// Get doctor by ID with full profile
router.get('/:id', doctorController.getDoctorById);

// Check slot availability for a doctor
router.get('/availability/check', doctorController.checkAvailability);

// Apply as doctor (user becomes doctor)
router.post('/apply', auth, doctorController.applyAsDoctor);

// Get doctor's appointments (doctor only)
router.get('/:id/appointments', auth, requireDoctor, appointmentController.listDoctorAppointments);

module.exports = router;
