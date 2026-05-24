// ── FILE: api/client.js ── Axios instance + API functions
import axios from 'axios';

// Base Axios instance pointing to the Express backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com' : 'http://localhost:5000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload an ID card image for OCR extraction.
 * @param {FormData} formData - FormData with 'idImage' field
 * @returns {Promise} API response with patient data
 */
export const extractPatientId = async (formData) => {
  const res = await api.post('/api/triage/extract-id', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * Save manual or corrected patient data to the database.
 * @param {Object} patientData - JSON patient data
 * @returns {Promise} API response with saved patient data
 */
export const createPatient = async (patientData) => {
  const res = await api.post('/api/triage/patient', patientData);
  return res.data;
};

/**
 * Send symptom conversation to Gemini for triage analysis.
 * @param {Array} messages - [{role: 'user'|'model', content: string}]
 * @param {string} locale - 'en', 'hi', 'ta'
 * @returns {Promise} Triage result with department, priority, reasoning
 */
export const analyzeSymptoms = async (messages, locale = 'en') => {
  const res = await api.post('/api/triage/analyze-symptoms', { messages, locale });
  return res.data;
};

/**
 * Allocate a queue ticket for the patient.
 * @param {{ patientId: string, department: string, priorityTier: string }} payload
 * @returns {Promise} Queue ticket with token, doctor, wait time
 */
export const allocateQueue = async (payload) => {
  const res = await api.post('/api/queue/allocate', payload);
  return res.data;
};

export const checkHealth = async () => {
  try {
    const res = await api.get('/api/health');
    return res.data;
  } catch (err) {
    return { status: 'error', error: err.message };
  }
};

export default api;
