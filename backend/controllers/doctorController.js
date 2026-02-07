const doctorService = require('../services/doctorService');

exports.getDoctors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const filters = {};
    if (req.query.specialization) filters.specialization = req.query.specialization;
    if (req.query.minFees) filters.fees = { ...filters.fees, $gte: parseInt(req.query.minFees) };
    if (req.query.maxFees) filters.fees = { ...filters.fees, $lte: parseInt(req.query.maxFees) };
    if (req.query.search) {
      filters.$or = [
        { fullname: { $regex: req.query.search, $options: 'i' } },
        { specialization: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const result = await doctorService.getApprovedDoctors(page, limit, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.json(doctor);
  } catch (err) {
    next(err);
  }
};

exports.checkAvailability = async (req, res, next) => {
  try {
    const { doctorId, date, time } = req.query;
    
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, date, and time are required' });
    }

    const result = await doctorService.checkSlotAvailability(doctorId, date, time);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.applyAsDoctor = async (req, res, next) => {
  try {
    const { fullname, email, phone, specialization, experience, fees, address, about } = req.body;

    if (!fullname || !email || !phone || !specialization || !experience || !fees || !address) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const Doctor = require('../models/Doctor');
    const existingDoctor = await Doctor.findOne({ userId: req.user._id });

    if (existingDoctor) {
      return res.status(400).json({ message: 'You have already applied as a doctor' });
    }

    const newDoctor = new Doctor({
      userId: req.user._id,
      fullname,
      email,
      phone,
      specialization,
      experience: parseInt(experience),
      fees: parseInt(fees),
      address,
      about
    });

    await newDoctor.save();
    res.status(201).json({ message: 'Doctor application submitted', doctor: newDoctor });
  } catch (err) {
    next(err);
  }
};

exports.listPending = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await doctorService.getPendingDoctors(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.approveDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.approveDoctor(req.params.id);
    res.json({ message: 'Doctor approved', doctor });
  } catch (err) {
    next(err);
  }
};

exports.rejectDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.rejectDoctor(req.params.id);
    res.json({ message: 'Doctor rejected', doctor });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentDoctorProfile = async (req, res, next) => {
  try {
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found. Please complete your registration.' });
    }

    // Format response for frontend compatibility
    const formattedDoctor = {
      _id: doctor._id,
      userId: doctor.userId,
      fullname: doctor.fullname,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialization,
      specialization: doctor.specialization,
      yearsExperience: doctor.experience,
      experience: doctor.experience,
      fees: doctor.fees,  // Keep as number but also provide object format
      feesObj: { consultation: doctor.fees },
      clinic: doctor.address,
      address: doctor.address,
      bio: doctor.about,
      about: doctor.about,
      rating: doctor.rating || 0,
      totalReviews: doctor.totalReviews || 0,
      profileImage: doctor.profileImage,
      avatarUrl: doctor.profileImage,
      certifications: doctor.certificates?.map(c => c.title) || [],
      certificates: doctor.certificates || [],
      timings: doctor.timings || { startTime: '09:00', endTime: '17:00' },
      status: doctor.status,
      availability: generateWeeklyAvailability(doctor.timings)
    };

    res.json({ doctor: formattedDoctor });
  } catch (err) {
    next(err);
  }
};

// Helper function to generate weekly availability from timings
const generateWeeklyAvailability = (timings) => {
  if (!timings) {
    timings = { startTime: '09:00', endTime: '17:00' };
  }
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const availability = {};
  
  days.forEach(day => {
    // Extract hour from time string (HH:MM format)
    const startTimeStr = timings.startTime || '09:00';
    const endTimeStr = timings.endTime || '17:00';
    
    const startHour = parseInt(startTimeStr.split(':')[0]);
    const endHour = parseInt(endTimeStr.split(':')[0]);
    
    const slots = [];
    
    // Generate hourly slots
    for (let hour = startHour; hour < endHour; hour++) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      slots.push(`${String(displayHour).padStart(2, '0')}:00 ${ampm}`);
    }
    
    availability[day] = slots;
  });
  
  return availability;
};
