const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middlewares/authMiddleware');
const { requireAdminOrDoctor, requireDoctor } = require('../middlewares/roleMiddleware');
const appointmentController = require('../controllers/appointmentController');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Create appointment (with optional document upload)
router.post('/book', auth, upload.single('document'), appointmentController.createAppointment);

// List user's appointments (paginated)
router.get('/me', auth, appointmentController.listUserAppointments);

// List doctor's appointments (doctor only)
router.get('/doctor', auth, requireDoctor, appointmentController.listDoctorAppointments);

// Admin: list all appointments (paginated, filterable)
router.get('/all', auth, appointmentController.adminListAll);

// Update appointment status (admin or doctor)
router.put('/status/:id', auth, requireAdminOrDoctor, appointmentController.updateStatus);

// Reschedule appointment (user reschedules their own appointment)
router.put('/reschedule/:id', auth, appointmentController.rescheduleAppointment);

module.exports = router;
