const Doctor = require('../models/Doctor');
const { DOCTOR_ROSTER } = require('./queueAlgorithm');

/**
 * Seeds the Doctor collection with the DOCTOR_ROSTER if it is empty.
 */
const seedDoctors = async () => {
  try {
    const count = await Doctor.countDocuments();
    if (count > 0) {
      console.log('✅ Doctor collection already seeded.');
      return;
    }

    console.log('🌱 Seeding Doctor collection from DOCTOR_ROSTER...');
    const doctorsToInsert = [];
    
    for (const [department, doctors] of Object.entries(DOCTOR_ROSTER)) {
      for (const name of doctors) {
        doctorsToInsert.push({ name, department, isActive: true });
      }
    }

    await Doctor.insertMany(doctorsToInsert);
    console.log(`✅ Seeded ${doctorsToInsert.length} doctors.`);
  } catch (err) {
    console.error('❌ Failed to seed doctors:', err.message);
  }
};

module.exports = seedDoctors;
