// ── FILE: utils/queueAlgorithm.js ── Shortest-queue routing + token generation
const QueueTicket = require('../models/QueueTicket');

/**
 * Hard-coded doctor roster per department for hackathon demo.
 * In production, this would come from a Doctor model in MongoDB.
 */
const DOCTOR_ROSTER = {
  'Cardiology': ['Dr. Anjali Mehta', 'Dr. Rajesh Kapoor'],
  'Orthopedics': ['Dr. Sunil Verma', 'Dr. Priya Nair'],
  'General Medicine': ['Dr. Aditi Sharma', 'Dr. Vikram Patel', 'Dr. Neha Gupta'],
  'ENT': ['Dr. Rohit Saxena', 'Dr. Meera Iyer'],
  'Dermatology': ['Dr. Kavita Reddy', 'Dr. Arjun Das'],
  'Neurology': ['Dr. Deepak Joshi', 'Dr. Shalini Rao'],
  'Pediatrics': ['Dr. Pooja Malhotra', 'Dr. Amit Kulkarni'],
  'Gynecology': ['Dr. Sunita Deshmukh', 'Dr. Rashmi Pillai'],
  'Ophthalmology': ['Dr. Kiran Bhat', 'Dr. Nandini Srinivasan'],
  'Psychiatry': ['Dr. Anil Menon', 'Dr. Sneha Chatterjee'],
};

// Department code abbreviations for token generation
const DEPT_CODES = {
  'Cardiology': 'CARDIO',
  'Orthopedics': 'ORTHO',
  'General Medicine': 'GENMED',
  'ENT': 'ENT',
  'Dermatology': 'DERMA',
  'Neurology': 'NEURO',
  'Pediatrics': 'PEDIA',
  'Gynecology': 'GYNEC',
  'Ophthalmology': 'OPHTH',
  'Psychiatry': 'PSYCH',
};

/**
 * Find the doctor with the shortest active queue in a department.
 * Now queries the MongoDB Doctor model for active doctors in the department.
 *
 * @param {string} department - Department name
 * @returns {{ doctorName: string, currentQueueLength: number }}
 */
const findShortestQueue = async (department) => {
  try {
    const Doctor = require('../models/Doctor');
    // Fetch active doctors for this department
    const doctorDocs = await Doctor.find({ department, isActive: true });
    
    // If no doctors in DB for this department, fall back to roster or On-Call
    let doctorNames = doctorDocs.map(d => d.name);
    if (doctorNames.length === 0) {
      doctorNames = DOCTOR_ROSTER[department] || ['Dr. On-Call'];
    }

    // Count WAITING or CALLED tickets per doctor in this department
    const pipeline = await QueueTicket.aggregate([
      {
        $match: {
          department,
          status: { $in: ['WAITING', 'CALLED'] },
        },
      },
      {
        $group: {
          _id: '$assignedDoctor',
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a map of doctor → queue count
    const queueMap = {};
    for (const doc of pipeline) {
      queueMap[doc._id] = doc.count;
    }

    // Find the doctor with fewest active tickets (default to 0 if no tickets)
    let bestDoctor = doctorNames[0];
    let bestCount = queueMap[doctorNames[0]] || 0;

    for (let i = 1; i < doctorNames.length; i++) {
      const count = queueMap[doctorNames[i]] || 0;
      if (count < bestCount) {
        bestDoctor = doctorNames[i];
        bestCount = count;
      }
    }

    return { doctorName: bestDoctor, currentQueueLength: bestCount };
  } catch (err) {
    // If DB fails, fall back to hardcoded roster
    console.error('Queue aggregation error:', err.message);
    const fallbackDoctors = DOCTOR_ROSTER[department] || ['Dr. On-Call'];
    return { doctorName: fallbackDoctors[0], currentQueueLength: 0 };
  }
};

/**
 * Generate a human-readable token number like "CARDIO-007".
 * @param {string} department - Department name
 * @param {number} count - Current ticket count + 1
 * @returns {string} Token number
 */
const generateTokenNumber = (department, count) => {
  const code = DEPT_CODES[department] || department.substring(0, 5).toUpperCase();
  const padded = String(count).padStart(3, '0');
  return `${code}-${padded}`;
};

module.exports = {
  findShortestQueue,
  generateTokenNumber,
  DOCTOR_ROSTER,
  DEPT_CODES,
};
