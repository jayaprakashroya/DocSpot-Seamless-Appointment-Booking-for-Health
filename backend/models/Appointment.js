const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    doctorInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    userInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: true,
    },
    consultationType: {
      type: String,
      enum: ['online', 'in-person'],
      default: 'in-person',
    },
    prescription: {
      type: String,
      default: null,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
