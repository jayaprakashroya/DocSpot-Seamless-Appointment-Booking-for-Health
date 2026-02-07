const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Doctor Service - Business logic for doctor operations
 */

exports.getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id).populate('userId', 'name email phone');
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};

exports.getApprovedDoctors = async (page = 1, limit = 10, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = { status: 'approved', ...filters };
  
  const doctors = await Doctor.find(query)
    .skip(skip)
    .limit(limit)
    .select('-certificates'); // exclude bulk data

  const total = await Doctor.countDocuments(query);
  
  return {
    doctors,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

exports.checkSlotAvailability = async (doctorId, date, time) => {
  const doctor = await this.getDoctorById(doctorId);
  
  // Check if doctor is approved
  if (doctor.status !== 'approved') {
    throw new AppError('Doctor is not available for booking', 400);
  }

  // Check working hours
  const appointmentDate = new Date(date);
  const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Validate time format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new AppError('Invalid time format', 400);
  }

  // Check against working hours (if doctor has set availability)
  if (doctor.timings && doctor.timings.startTime && doctor.timings.endTime) {
    const [apptHour, apptMin] = time.split(':').map(Number);
    const [startHour, startMin] = doctor.timings.startTime.split(':').map(Number);
    const [endHour, endMin] = doctor.timings.endTime.split(':').map(Number);

    const apptTime = apptHour * 60 + apptMin;
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (apptTime < startTime || apptTime >= endTime) {
      throw new AppError(`Doctor is not available at ${time}. Working hours: ${doctor.timings.startTime} - ${doctor.timings.endTime}`, 400);
    }
  }

  // Check for existing appointment at same time (prevent double booking)
  const existingAppointment = await Appointment.findOne({
    doctorInfo: doctorId,
    date: {
      $gte: new Date(appointmentDate.setHours(0, 0, 0, 0)),
      $lt: new Date(appointmentDate.setHours(23, 59, 59, 999))
    },
    time,
    status: { $in: ['scheduled', 'pending'] }
  });

  if (existingAppointment) {
    throw new AppError('This slot is already booked. Please choose another time', 409);
  }

  return { available: true, doctor };
};

exports.getPendingDoctors = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const doctors = await Doctor.find({ status: 'pending' })
    .skip(skip)
    .limit(limit);
  
  const total = await Doctor.countDocuments({ status: 'pending' });
  
  return {
    doctors,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

exports.approveDoctor = async (doctorId) => {
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { status: 'approved' },
    { new: true }
  );
  
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};

exports.rejectDoctor = async (doctorId, reason = '') => {
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { status: 'rejected' },
    { new: true }
  );
  
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};
