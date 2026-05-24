// ── FILE: routes/doctor.routes.js ── Admin Doctor Roster Management
const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');

const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/doctors
// Get all doctors
router.get('/', requireAuth, async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ department: 1, name: 1 });
    res.json({ success: true, doctors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/doctors
// Add a new doctor
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, department, isActive } = req.body;
    const newDoctor = new Doctor({ name, department, isActive });
    await newDoctor.save();
    res.status(201).json({ success: true, doctor: newDoctor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/doctors/:id
// Update doctor status
router.patch('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
