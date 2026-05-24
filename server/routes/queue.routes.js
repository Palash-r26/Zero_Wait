// ── FILE: routes/queue.routes.js ── Queue allocation API routes
// Updated: insurance alert agent runs after ticket allocation
const express = require('express');
const router = express.Router();
const { validateQueueAllocate, handleValidationErrors } = require('../middleware/validate');
const { 
  allocateQueueController,
  getQueueController,
  updateStatusController,
  updatePriorityController 
} = require('../controllers/queue.controller');
const insuranceAlertAgent = require('../middleware/insuranceAgent');

const { requireAuth } = require('../middleware/auth');

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

// GET /api/queue
// Fetch active tickets for queue board and staff dashboard
router.get('/', requireAuth, getQueueController);

// PATCH /api/queue/:id/status
// Update ticket status
router.patch('/:id/status', requireAuth, updateStatusController);

// PATCH /api/queue/:id/priority
// Nurse override priority tier
router.patch('/:id/priority', requireAuth, updatePriorityController);

module.exports = router;
