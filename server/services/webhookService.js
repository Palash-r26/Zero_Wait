// ── FILE: services/webhookService.js ── HMS Integration Webhook
const axios = require('axios');

/**
 * Fires an HTTP POST webhook to the HMS_WEBHOOK_URL when ticket state changes.
 * P1 Feature: Integration webhook for existing HMS
 *
 * @param {string} event - E.g., 'TICKET_CREATED', 'STATUS_CHANGED', 'PRIORITY_ESCALATED'
 * @param {object} payload - The ticket data
 */
const fireWebhook = async (event, payload) => {
  const webhookUrl = process.env.HMS_WEBHOOK_URL;
  if (!webhookUrl) {
    // If no webhook configured, silently skip
    return;
  }

  try {
    await axios.post(webhookUrl, {
      event,
      timestamp: new Date().toISOString(),
      hospitalName: process.env.HOSPITAL_NAME || 'Zero-Wait OPD',
      data: payload,
    });
    console.log(`[Webhook] Successfully fired event: ${event}`);
  } catch (err) {
    console.error(`[Webhook Error] Failed to fire event ${event}:`, err.message);
  }
};

module.exports = {
  fireWebhook,
};
