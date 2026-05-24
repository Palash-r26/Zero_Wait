// ── FILE: models/Doctor.js ──
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster shortest-queue lookup
doctorSchema.index({ department: 1, isActive: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
