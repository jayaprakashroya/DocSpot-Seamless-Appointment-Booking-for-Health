const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const notificationService = require('./notificationService');
const socketService = require('./socketService');

/**
 * Appointment Service - Business logic for appointment operations
 */

exports.createAppointment = async (userId, doctorId, appointmentData, documentPath = null) => {
  // Validate doctor and slot availability
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError('Doctor not found', 404);
  
  if (doctor.status !== 'approved') {
    throw new AppError('This doctor is not available for booking', 400);
  }

  // Prevent double booking
  const appointmentDate = new Date(appointmentData.date);
  const existingAppointment = await Appointment.findOne({
    doctorInfo: doctorId,
    date: {
      $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
      $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
    },
    time: appointmentData.time,
    status: { $in: ['scheduled', 'pending'] }
  });

  if (existingAppointment) {
    throw new AppError('This time slot is already booked', 409);
  }

  const appointment = new Appointment({
    doctorInfo: doctorId,
    userInfo: userId,
    date: appointmentData.date,
    time: appointmentData.time,
    reason: appointmentData.reason,
    consultationType: appointmentData.consultationType || 'in-person',
    document: documentPath,
    status: 'pending'
  });

  await appointment.save();
  const populated = await appointment.populate('doctorInfo userInfo', 'fullname name email phone');

  // Notify doctor and patient about the new appointment request (best-effort)
  try {
    const doctorEmail = populated.doctorInfo?.email;
    const userEmail = (await User.findById(userId))?.email;

    const subject = `New appointment request from ${populated.userInfo?.name || 'a patient'}`;
    const textForDoctor = `You have a new appointment request on ${populated.date} at ${populated.time}. Please review and update the status.`;
    const textForUser = `Your appointment request with Dr. ${populated.doctorInfo?.fullname} has been received and is pending approval.`;

    if (doctorEmail) notificationService.enqueueEmail({ to: doctorEmail, subject, text: textForDoctor });
    if (userEmail) notificationService.enqueueEmail({ to: userEmail, subject: 'Appointment request received', text: textForUser });
  } catch (err) {
    // swallow notification errors
    // eslint-disable-next-line no-console
    console.error('Notification error:', err);
  }

  // Emit socket event to doctor and user (if connected)
  try {
    if (doctor.userId) socketService.emitToUser(doctor.userId.toString(), 'appointmentCreated', populated);
    if (userId) socketService.emitToUser(userId.toString(), 'appointmentCreated', populated);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Socket emit error:', err);
  }

  return populated;
};

exports.getAppointmentsByUser = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const appointments = await Appointment.find({ userInfo: userId })
    .populate('doctorInfo', 'fullname specialization fees')
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Appointment.countDocuments({ userInfo: userId });

  return {
    appointments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

exports.getAppointmentsByDoctor = async (doctorId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const appointments = await Appointment.find({ doctorInfo: doctorId })
    .populate('userInfo', 'name email phone')
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Appointment.countDocuments({ doctorInfo: doctorId });

  return {
    appointments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

exports.getAllAppointments = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = { ...filters };

  const appointments = await Appointment.find(query)
    .populate('doctorInfo', 'fullname specialization')
    .populate('userInfo', 'name email')
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Appointment.countDocuments(query);

  return {
    appointments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

exports.updateAppointmentStatus = async (appointmentId, newStatus) => {
  const validStatuses = ['pending', 'scheduled', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new AppError(`Invalid status. Valid statuses: ${validStatuses.join(', ')}`, 400);
  }

  const appointment = await Appointment.findByIdAndUpdate(
    appointmentId,
    { status: newStatus },
    { new: true }
  ).populate('doctorInfo userInfo', 'fullname name email');

  if (!appointment) throw new AppError('Appointment not found', 404);

  // Notify user about status change (best-effort)
  try {
    const userEmail = appointment.userInfo?.email;
    if (userEmail) {
      const subj = `Your appointment status is now: ${appointment.status}`;
      const body = `Appointment with Dr. ${appointment.doctorInfo?.fullname} on ${appointment.date} at ${appointment.time} is now ${appointment.status}.`;
      notificationService.enqueueEmail({ to: userEmail, subject: subj, text: body });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Notification send error:', err);
  }

  // Emit socket update to user and doctor
  try {
    const userId = appointment.userInfo?._id?.toString();
    const doctorUserId = appointment.doctorInfo?.userId?.toString();
    if (userId) socketService.emitToUser(userId, 'appointmentUpdated', appointment);
    if (doctorUserId) socketService.emitToUser(doctorUserId, 'appointmentUpdated', appointment);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Socket emit error:', err);
  }

  return appointment;
};

exports.rescheduleAppointment = async (appointmentId, newDate, newTime) => {
  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) throw new AppError('Appointment not found', 404);
  
  if (['completed', 'cancelled'].includes(appointment.status)) {
    throw new AppError(`Cannot reschedule ${appointment.status} appointment`, 400);
  }

  // Check if new slot is available
  const newAppointmentDate = new Date(newDate);
  const existingAppointment = await Appointment.findOne({
    _id: { $ne: appointmentId },
    doctorInfo: appointment.doctorInfo,
    date: {
      $gte: new Date(newAppointmentDate.setHours(0, 0, 0, 0)),
      $lt: new Date(newAppointmentDate.setHours(23, 59, 59, 999))
    },
    time: newTime,
    status: { $in: ['scheduled', 'pending'] }
  });

  if (existingAppointment) {
    throw new AppError('New slot is already booked', 409);
  }

  appointment.date = newDate;
  appointment.time = newTime;
  await appointment.save();

  return appointment.populate('doctorInfo userInfo', 'fullname name email');
};

exports.getAdminStats = async () => {
  const [totalUsers, totalDoctors, totalAppointments, pendingDoctors] = await Promise.all([
    (await require('../models/User').countDocuments({})),
    (await Doctor.countDocuments({})),
    (await Appointment.countDocuments({})),
    (await Doctor.countDocuments({ status: 'pending' }))
  ]);

  const appointmentsByStatus = await Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const statusMap = {};
  appointmentsByStatus.forEach(item => {
    statusMap[item._id] = item.count;
  });

  return {
    totalUsers,
    totalDoctors,
    totalAppointments,
    pendingDoctors,
    appointmentsByStatus: statusMap
  };
};
