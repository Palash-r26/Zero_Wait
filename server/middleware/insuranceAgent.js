// ── FILE: middleware/insuranceAgent.js ── Real-time insurance expiry alert agent
// ═══════════════════════════════════════════════════════
// AGENTIC BONUS — This is the "agentic behaviour" the
// hackathon judges are scoring. This middleware runs
// autonomously AFTER a ticket is saved and proactively
// alerts staff about patients with inactive insurance.
//
// DEMO SCRIPT:
//   1. Open /staff in one browser tab (staff dashboard)
//   2. In the kiosk tab, scan an ID or manually enter a
//      patient with insurance.status = 'inactive'
//   3. Complete symptom chat → confirm ticket
//   4. Watch the staff dashboard tab receive the real-time
//      alert with zero page refresh — this is the agentic moment.
// ═══════════════════════════════════════════════════════
const crypto = require('crypto');
const Patient = require('../models/Patient');

/**
 * Insurance Alert Agent middleware.
 * Runs AFTER allocateQueueController saves a ticket.
 * Checks if the patient has inactive insurance and emits
 * a real-time alert to the staff dashboard via Socket.io.
 *
 * This agent NEVER blocks the response — it always calls next().
 */
async function insuranceAlertAgent(req, res, next) {
  try {
    // Retrieve the saved ticket from res.locals (set by allocateQueueController)
    const ticket = res.locals.savedTicket;
    if (!ticket) {
      return next();
    }

    // Populate the patient associated with this ticket
    let patient = null;
    try {
      patient = await Patient.findById(ticket.patientId);
    } catch (err) {
      console.warn('🤖 Insurance Agent: Could not look up patient:', err.message);
      return next();
    }

    if (!patient) {
      return next();
    }

    // Check if insurance is inactive
    if (patient.insurance && patient.insurance.status === 'inactive') {
      // Get the Socket.io instance from the Express app
      const io = req.app.get('io');

      if (io) {
        const alertPayload = {
          alertId: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          tokenNumber: ticket.tokenNumber,
          department: ticket.department,
          priorityTier: ticket.priorityTier,
          patient: {
            name: patient.name || 'Unknown',
            uniqueId: patient.uniqueId || 'N/A',
            insurance: patient.insurance,
          },
          message: `Patient ${patient.name || 'Unknown'} (${ticket.tokenNumber}) has inactive insurance — ${patient.insurance.provider || 'Unknown provider'}`,
        };

        // Emit to the staff-dashboard room
        io.to('staff-dashboard').emit('insurance:expired', alertPayload);

        // Log for hackathon demo visibility
        console.log('');
        console.log('🤖 ═══ INSURANCE ALERT AGENT ═══');
        console.log(`   🚨 INACTIVE INSURANCE DETECTED`);
        console.log(`   Patient:    ${patient.name || 'Unknown'}`);
        console.log(`   Token:      ${ticket.tokenNumber}`);
        console.log(`   Department: ${ticket.department}`);
        console.log(`   Provider:   ${patient.insurance.provider || 'Unknown'}`);
        console.log(`   Policy:     ${patient.insurance.policyId || 'N/A'}`);
        console.log(`   → Alert emitted to staff-dashboard room`);
        console.log('🤖 ═══════════════════════════════');
        console.log('');
      }
    }
  } catch (err) {
    // NEVER block the response — log and move on silently
    console.error('🤖 Insurance Agent error (non-blocking):', err.message);
  }

  next();
}

module.exports = insuranceAlertAgent;
