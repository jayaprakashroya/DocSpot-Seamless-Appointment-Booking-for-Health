const appointmentService = require('../services/appointmentService');
const fs = require('fs').promises;
const path = require('path');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await appointmentService.getAdminStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// Public demo endpoint that returns sample breakdown + pending doctor applications
exports.sampleOverview = async (req, res, next) => {
  try {
    const sampleDir = path.join(__dirname, '..', 'sample-data');
    const statusRaw = await fs.readFile(path.join(sampleDir, 'status-breakdown-sample.json'), 'utf8');
    const pendingRaw = await fs.readFile(path.join(sampleDir, 'pending-doctor-applications-sample.json'), 'utf8');

    const statusJson = JSON.parse(statusRaw);
    const pendingJson = JSON.parse(pendingRaw);

    res.json({ statusBreakdown: statusJson, pendingDoctorApplications: pendingJson });
  } catch (err) {
    next(err);
  }
};
