// ── FILE: controllers/queue.controller.js ── Queue allocation + ticket generation
// Updated: stores saved ticket on res.locals for insurance agent middleware
const Patient = require('../models/Patient');
const QueueTicket = require('../models/QueueTicket');
const { findShortestQueue, generateTokenNumber } = require('../utils/queueAlgorithm');
const { fireWebhook } = require('../services/webhookService');

// Average consultation time per patient in minutes (configurable)
const AVG_CONSULT_MINUTES = 12;

/**
 * POST /api/queue/allocate
 * Accepts { patientId, department, priorityTier }
 * → finds shortest queue → generates token → saves ticket
 * → stores on res.locals.savedTicket for downstream agent middleware
 * → returns result.
 */
const allocateQueueController = async (req, res, next) => {
  try {
    const { patientId, department, priorityTier } = req.body;

    // Verify patient exists (if MongoDB is available)
    try {
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found. Please scan your ID again.',
        });
      }
    } catch (err) {
      // If patient lookup fails (e.g., invalid ObjectId format in demo mode),
      // continue anyway for hackathon resilience
      console.warn('Patient lookup warning:', err.message);
    }

    // Find the doctor with the shortest queue (FAIL-SAFE 3 built-in)
    const { doctorName, currentQueueLength } = await findShortestQueue(department);

    // Count total tickets in this department today (for token numbering)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let totalToday = 0;
    try {
      totalToday = await QueueTicket.countDocuments({
        department,
        checkInAt: { $gte: todayStart },
      });
    } catch {
      // If count fails, use a timestamp-based fallback
      totalToday = Math.floor(Date.now() / 1000) % 999;
    }

    // Generate token number
    const tokenNumber = generateTokenNumber(department, totalToday + 1);

    // Calculate estimated wait time
    const estimatedWaitMinutes = currentQueueLength * AVG_CONSULT_MINUTES;

    // Create and save the queue ticket
    try {
      const ticket = new QueueTicket({
        tokenNumber,
        department,
        status: 'WAITING',
        priorityTier,
        patientId,
        assignedDoctor: doctorName,
        checkInAt: new Date(),
        estimatedWaitMinutes,
      });

      await ticket.save();

      // Fire integration webhook
      fireWebhook('TICKET_CREATED', ticket.toObject());

      // Store saved ticket on res.locals for the insurance alert agent
      res.locals.savedTicket = ticket.toObject();

      // Send response but DON'T return — let next() chain continue for agent
      res.status(201).json({
        success: true,
        ticket: ticket.toObject(),
        estimatedWaitMinutes,
        doctorName,
        queuePosition: currentQueueLength + 1,
      });

      // Call next() to trigger insurance agent middleware
      return next();
    } catch (dbErr) {
      // FAIL-SAFE 4: Database save failure
      console.error('Ticket save error:', dbErr.message);

      // Still return a "virtual" ticket so the kiosk flow doesn't break
      const virtualTicket = {
        tokenNumber,
        department,
        status: 'WAITING',
        priorityTier,
        patientId,
        assignedDoctor: doctorName,
        checkInAt: new Date(),
        estimatedWaitMinutes,
        _isVirtual: true,
      };

      res.locals.savedTicket = virtualTicket;

      res.status(200).json({
        success: true,
        ticket: virtualTicket,
        estimatedWaitMinutes,
        doctorName,
        queuePosition: currentQueueLength + 1,
        warning: 'Ticket generated but could not be saved to database.',
      });

      return next();
    }
  } catch (err) {
    console.error('Queue allocation error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Queue allocation failed — please retry.',
    });
  }
};

/**
 * GET /api/queue
 * Fetch all active tickets for the queue board
 */
const getQueueController = async (req, res) => {
  try {
    const activeTickets = await QueueTicket.find({
      status: { $in: ['WAITING', 'CALLED'] },
    }).sort({ priorityTier: 1, checkInAt: 1 }).lean();

    res.status(200).json({ success: true, tickets: activeTickets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PATCH /api/queue/:id/status
 * Update ticket status (e.g. WAITING -> CALLED -> DONE)
 */
const updateStatusController = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await QueueTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    
    fireWebhook('STATUS_CHANGED', ticket.toObject());
    
    // Optionally emit via socket io here if we want instant UI updates
    const io = req.app.get('io');
    if (io) {
      io.emit('queueUpdate', ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * PATCH /api/queue/:id/priority
 * Nurse override to change priority tier
 */
const updatePriorityController = async (req, res) => {
  try {
    const { priorityTier } = req.body;
    const ticket = await QueueTicket.findByIdAndUpdate(
      req.params.id,
      { priorityTier },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });
    
    fireWebhook('PRIORITY_ESCALATED', ticket.toObject());
    
    const io = req.app.get('io');
    if (io) {
      io.emit('queueUpdate', ticket);
    }

    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  allocateQueueController,
  getQueueController,
  updateStatusController,
  updatePriorityController,
};
