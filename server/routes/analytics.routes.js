// ── FILE: routes/analytics.routes.js ── Admin Analytics
const express = require('express');
const router = express.Router();
const QueueTicket = require('../models/QueueTicket');

const { requireAuth } = require('../middleware/auth');

// GET /api/analytics/dashboard
// Fetch key metrics for the dashboard
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Total waiting
    const totalWaiting = await QueueTicket.countDocuments({ status: 'WAITING' });

    // Priorities
    const priorityCounts = await QueueTicket.aggregate([
      { $match: { checkInAt: { $gte: todayStart } } },
      { $group: { _id: '$priorityTier', count: { $sum: 1 } } }
    ]);
    
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;
    priorityCounts.forEach(p => {
      if (p._id === 'RED') redCount = p.count;
      if (p._id === 'YELLOW') yellowCount = p.count;
      if (p._id === 'GREEN') greenCount = p.count;
    });

    // Average wait time
    const waitTimes = await QueueTicket.aggregate([
      { $match: { status: 'WAITING', checkInAt: { $gte: todayStart } } },
      {
        $group: {
          _id: null,
          avgWaitMs: { $avg: { $subtract: [new Date(), '$checkInAt'] } }
        }
      }
    ]);
    
    let avgWaitTime = '0m';
    if (waitTimes.length > 0 && waitTimes[0].avgWaitMs) {
      avgWaitTime = `${Math.floor(waitTimes[0].avgWaitMs / 60000)}m`;
    }

    res.json({
      success: true,
      metrics: {
        totalWaiting,
        redPriority: redCount,
        yellowPriority: yellowCount,
        greenPriority: greenCount,
        avgWaitTime
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
