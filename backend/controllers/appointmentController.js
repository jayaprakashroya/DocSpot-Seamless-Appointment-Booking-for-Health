const appointmentService = require('../services/appointmentService');

exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, reason, consultationType } = req.body;
    
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const appointment = await appointmentService.createAppointment(
      req.user._id,
      doctorId,
      { date, time, reason, consultationType },
      req.file?.filename
    );

    res.status(201).json({ message: 'Appointment requested', appointment });
  } catch (err) {
    next(err);
  }
};

exports.listUserAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await appointmentService.getAppointmentsByUser(req.user._id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listDoctorAppointments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await appointmentService.getAppointmentsByDoctor(req.user._id, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.adminListAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = req.query.status ? { status: req.query.status } : {};

    const result = await appointmentService.getAllAppointments(page, limit, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });

    const appointment = await appointmentService.updateAppointmentStatus(req.params.id, status);
    res.json({ message: 'Appointment status updated', appointment });
  } catch (err) {
    next(err);
  }
};

exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { newDate, newTime } = req.body;
    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'newDate and newTime are required' });
    }

    const appointment = await appointmentService.rescheduleAppointment(
      req.params.id,
      newDate,
      newTime
    );
    res.json({ message: 'Appointment rescheduled', appointment });
  } catch (err) {
    next(err);
  }
};
