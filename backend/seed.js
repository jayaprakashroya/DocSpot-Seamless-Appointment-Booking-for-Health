const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

dotenv.config();

const fs = require('fs').promises;
const path = require('path');

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');

    // Clear existing collections
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Database cleared');

    // Create admin user
    const adminPassword = await bcrypt.hash('SecureAdmin@2024MediConnect', 10);
    const adminUser = new User({
      name: 'System Administrator',
      email: 'sysadmin@healthcare.local',
      password: adminPassword,
      phone: '+1-800-MEDICONNECT',
      type: 'admin',
      isActive: true,
    });
    await adminUser.save();
    console.log(`✓ Admin account created successfully`);

    // Load sample JSON files
    const sampleDir = path.join(__dirname, 'sample-data');
    const usersRaw = await fs.readFile(path.join(sampleDir, 'users.json'), 'utf8');
    const doctorsRaw = await fs.readFile(path.join(sampleDir, 'doctors.json'), 'utf8');
    const appointmentsRaw = await fs.readFile(path.join(sampleDir, 'appointments.json'), 'utf8');

    const usersJson = JSON.parse(usersRaw);
    const doctorsJson = JSON.parse(doctorsRaw);
    const appointmentsJson = JSON.parse(appointmentsRaw);

    // Keep mappings from sample _id to created documents
    const userIdMap = new Map();
    const doctorIdMap = new Map();

    // Create users
    for (const u of usersJson) {
      const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
      const email = u.email;
      const phone = u.phone || (u.contact && u.contact.phone) || '0000000000';
      const hashed = await bcrypt.hash('User@123', 10);
      const newUser = new User({
        name: name || 'Patient',
        email,
        password: hashed,
        phone,
        type: 'customer',
        isActive: true,
      });
      await newUser.save();
      userIdMap.set(String(u._id), newUser._id);
      console.log(`✓ User created`);
    }

    // Create doctors and associated user accounts
      const generatedDoctorCredentials = [];
      for (const d of doctorsJson) {
        const fullname = d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim();
        const email = d.contact && d.contact.email ? d.contact.email : d.email || `${fullname.replace(/\s+/g, '').toLowerCase()}@localhost`;
        const phone = (d.contact && d.contact.phone) || d.phone || '0000000000';

        // Use provided initialPassword for predictable seeds; otherwise generate random
        const plainPassword = d.initialPassword || Math.random().toString(36).substring(2, 15);
        const hashed = await bcrypt.hash(plainPassword, 10);

        const isPending = (d.applicationStatus && d.applicationStatus === 'pending');

        const doctorUser = new User({
          name: fullname || 'Doctor',
          email,
          password: hashed,
          phone,
          type: 'doctor',
          isDoctor: true,
          isActive: isPending ? false : true,
        });
        await doctorUser.save();

        const addressParts = d.location ? `${d.location.address || ''}, ${d.location.city || ''}, ${d.location.state || ''} ${d.location.zip || ''}` : d.clinic || '';
        const fees = (d.fees && (d.fees.consultation || d.fees)) || (d.fees && typeof d.fees === 'number' ? d.fees : 0);

        const doctorProfile = new Doctor({
          userId: doctorUser._id,
          fullname: fullname || doctorUser.name,
          email: doctorUser.email,
          phone: doctorUser.phone,
          specialization: d.specialty || d.specialization || 'General',
          experience: d.yearsExperience || d.experience || 0,
          fees: fees || 0,
          address: addressParts,
          about: d.bio || d.about || '',
          status: isPending ? 'pending' : 'approved',
          timings: {
            startTime: '09:00',
            endTime: '17:00',
          },
          rating: d.rating || 0,
        });
        await doctorProfile.save();
        doctorIdMap.set(String(d._id), doctorProfile._id);
        generatedDoctorCredentials.push({ email: doctorUser.email, password: plainPassword, status: doctorProfile.status });
        console.log(`✓ Doctor created: ${doctorProfile.fullname} (${doctorProfile.specialization})`);
      }

      // Write generated doctor credentials (plaintext passwords for seeded accounts) to sample-data for convenience
      try {
        const outPath = path.join(sampleDir, 'generated-doctor-credentials.json');
        await fs.writeFile(outPath, JSON.stringify(generatedDoctorCredentials, null, 2), 'utf8');
        console.log(`Generated doctor credentials written to ${outPath}`);
      } catch (e) {
        console.warn('Failed to write generated doctor credentials:', e.message || e);
      }

    // Create appointments using mapping
    let createdAppointments = 0;
    for (const a of appointmentsJson) {
      const mappedUserId = userIdMap.get(String(a.patientId));
      const mappedDoctorId = doctorIdMap.get(String(a.doctorId));
      if (!mappedUserId || !mappedDoctorId) {
        console.warn(`Skipping appointment ${a._id}: missing mapping for user or doctor`);
        continue;
      }

      const dt = a.dateTime ? new Date(a.dateTime) : a.date ? new Date(a.date) : new Date();
      const timeStr = dt.toISOString().substr(11, 5);
      const consultationType = (a.location && a.location === 'Telehealth') || (a.notes && a.notes.toLowerCase().includes('video')) ? 'online' : 'in-person';

      const appt = new Appointment({
        doctorInfo: mappedDoctorId,
        userInfo: mappedUserId,
        date: dt,
        time: timeStr,
        reason: a.reason || a.reason || 'Consultation',
        status: a.status && ['pending', 'scheduled', 'completed', 'cancelled'].includes(a.status) ? a.status : 'scheduled',
        consultationType,
        notes: a.notes || '',
        prescription: a.prescription || null,
        followUpRequired: !!a.followUpRequired,
        followUpDate: a.followUpDate ? new Date(a.followUpDate) : null,
      });
      await appt.save();
      createdAppointments++;
    }

    console.log(`\n✅ Seed data successfully created!`);
    console.log('\n DATABASE SUMMARY:');
    console.log(`   Total Admins: 1`);
    console.log(`   Total Users: ${userIdMap.size}`);
    console.log(`   Total Doctors: ${doctorIdMap.size}`);
    console.log(`   Total Appointments: ${createdAppointments}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();

