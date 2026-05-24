// ── FILE: routes/queue.routes.js ── Queue allocation API routes
// Updated: insurance alert agent runs after ticket allocation
const express = require('express');
const router = express.Router();
const { validateQueueAllocate, handleValidationErrors } = require('../middleware/validate');
const { allocateQueueController } = require('../controllers/queue.controller');
const insuranceAlertAgent = require('../middleware/insuranceAgent');

// POST /api/queue/allocate
// Assign patient to shortest queue → generate token → return ticket → check insurance
// The insuranceAlertAgent runs AFTER the response is sent, checking if the
// patient has inactive insurance and emitting a real-time alert to staff.
router.post(
  '/allocate',
  validateQueueAllocate,
  handleValidationErrors,
  allocateQueueController,
  insuranceAlertAgent  // Agentic bonus: real-time insurance alert
);

module.exports = router;
