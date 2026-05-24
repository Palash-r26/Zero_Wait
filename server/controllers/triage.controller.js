// ── FILE: controllers/triage.controller.js ── ID extraction + symptom analysis
const fs = require('fs');
const path = require('path');
const Patient = require('../models/Patient');
const { callGeminiVision, callGeminiChat } = require('../utils/gemini');
const safetyChecker = require('../services/SafetyChecker');
const medicalKnowledge = require('../services/MedicalKnowledge');
const translationService = require('../services/TranslationService');

/**
 * POST /api/triage/extract-id
 * Accepts multipart image upload → reads as base64 → calls Gemini Vision
 * → returns parsed patient fields.
 *
 * FAIL-SAFE 1: On OCR failure, returns HTTP 206 with partial data.
 */
const extractIdController = async (req, res) => {
  let filePath = null;

  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded. Please upload an ID card image.',
      });
    }

    filePath = req.file.path;

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Gemini Vision prompt for ID extraction
    const prompt = `You are an OCR specialist. Extract the following fields from this government-issued ID card or insurance card image.
If a field is not clearly readable, set it to an empty string.
Fields to extract: name, dob (in YYYY-MM-DD format), gender (male/female/other/unknown), uniqueId (any government ID number like Aadhar, Passport, etc.), address.
Also look for insurance details: insuranceProvider, insuranceNumber, and insuranceExpiryDate (in YYYY-MM-DD format).
If an insuranceExpiryDate is found, check if it is before today's date and set isInsuranceExpired to true if it is expired, otherwise false. If no insurance is found, set isInsuranceExpired to false.
Also provide a confidence score from 0 to 1 indicating how confident you are in the overall extraction.`;

    const responseSchema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        dob: { type: 'string' },
        gender: { type: 'string' },
        uniqueId: { type: 'string' },
        address: { type: 'string' },
        insuranceProvider: { type: 'string' },
        insuranceNumber: { type: 'string' },
        insuranceExpiryDate: { type: 'string' },
        isInsuranceExpired: { type: 'boolean' },
        confidence: { type: 'number' },
      },
      required: ['name', 'dob', 'gender', 'uniqueId', 'isInsuranceExpired', 'confidence'],
    };

    const extractedData = await callGeminiVision(base64Image, mimeType, prompt, responseSchema);

    // Determine if extraction is partial (low confidence or missing critical fields)
    const isPartial = extractedData.confidence < 0.7 || !extractedData.name || !extractedData.uniqueId;

    // Save patient to database
    const patientData = {
      name: extractedData.name || '',
      dob: extractedData.dob ? new Date(extractedData.dob) : null,
      gender: extractedData.gender || 'unknown',
      uniqueId: extractedData.uniqueId || '',
      insurance: {
        provider: extractedData.insuranceProvider || '',
        policyId: extractedData.insuranceNumber || '',
        status: extractedData.isInsuranceExpired ? 'inactive' : 'active',
        expiryDate: extractedData.insuranceExpiryDate ? new Date(extractedData.insuranceExpiryDate) : null,
      },
      isPartial,
      rawOcrText: JSON.stringify(extractedData),
    };

    try {
      const patient = new Patient(patientData);
      await patient.save();

      // Clean up uploaded file
      cleanupFile(filePath);

      if (isPartial) {
        return res.status(206).json({
          success: false,
          isPartial: true,
          partialData: extractedData,
          patient: patient.toObject(),
          message: 'Some fields could not be read clearly. Please verify and correct.',
        });
      }

      return res.json({
        success: true,
        patient: patient.toObject(),
        extractedData,
      });
    } catch (dbErr) {
      // FAIL-SAFE 4: Database save failure
      console.error('Patient save error:', dbErr.message);
      cleanupFile(filePath);
      return res.status(500).json({
        success: false,
        error: 'Database error — please retry',
        extractedData, // Still return extracted data so frontend can use it
      });
    }
  } catch (err) {
    // FAIL-SAFE 1: Gemini OCR total failure
    console.error('Gemini OCR error:', err.message);

    // Try to save a partial patient anyway
    const partialData = { name: '', dob: '', gender: 'unknown', uniqueId: '', isInsuranceExpired: false, confidence: 0 };

    try {
      const patient = new Patient({
        isPartial: true,
        rawOcrText: `OCR failed: ${err.message}`,
      });
      await patient.save();

      cleanupFile(filePath);
      return res.status(206).json({
        success: false,
        isPartial: true,
        partialData,
        patient: patient.toObject(),
        error: err.message,
        message: 'ID scanning failed. Please enter your details manually.',
      });
    } catch (dbErr) {
      cleanupFile(filePath);
      return res.status(500).json({
        success: false,
        isPartial: true,
        partialData,
        error: 'ID scanning and database both failed. Please enter details manually.',
      });
    }
  }
};

/**
 * POST /api/triage/analyze-symptoms
 * Accepts conversation history → sends to Gemini → returns triage assessment.
 *
 * FAIL-SAFE 2: On AI failure, returns GREEN + General Medicine fallback.
 */
const analyzeSymptomController = async (req, res) => {
  try {
    const { messages } = req.body;

    // 1. Combine all user messages into a single string to assess risk
    const userMessages = messages
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join(' ');

    // 2. HARDCODED SAFETY CHECKER (Bypasses AI if critical emergency detected)
    const emergencyOverride = safetyChecker.assessRisk(userMessages);
    
    if (emergencyOverride.isEmergency && emergencyOverride.priorityTier === 'RED') {
      console.log(`🚨 SAFETY OVERRIDE TRIGGERED: ${emergencyOverride.matchedKeyword}`);
      return res.json({
        department: emergencyOverride.department,
        priorityTier: 'RED',
        reasoning: emergencyOverride.reasoning,
        followUpQuestion: null,
        triageComplete: true,
        isFallback: false,
        safetyOverride: true
      });
    }

    // 3. Inject Medical Knowledge Context into the prompt
    const medicalContext = medicalKnowledge.getTriageContextString();

    // System instruction for the triage AI
    const systemInstruction = `You are a medical triage AI at a hospital OPD kiosk. Based on the patient's described symptoms, determine:
1) The most appropriate hospital department (choose from: Cardiology, Orthopedics, General Medicine, ENT, Dermatology, Neurology, Pediatrics, Gynecology, Ophthalmology, Psychiatry)
2) An emergency priority tier: RED (life-threatening, needs immediate attention), YELLOW (moderate urgency, needs prompt care), GREEN (routine, can wait)
3) A brief medical reasoning for your assessment

If you need more information to make an accurate assessment, set triageComplete to false and ask ONE specific follow-up question in followUpQuestion.
If you have enough information, set triageComplete to true and set followUpQuestion to null.

Be concise but thorough. Err on the side of caution — if symptoms sound serious, assign YELLOW or RED.

${medicalContext}`;

    const triageResult = await callGeminiChat(messages, systemInstruction);

    // 4. Normalize the AI response, but respect YELLOW overrides from safety checker
    let finalTier = ['RED', 'YELLOW', 'GREEN'].includes(triageResult.priorityTier)
      ? triageResult.priorityTier
      : 'GREEN';
      
    let finalReasoning = triageResult.reasoning || 'Assessment completed.';

    // Apply YELLOW safety override if AI missed it
    if (emergencyOverride.isEmergency && emergencyOverride.priorityTier === 'YELLOW' && finalTier === 'GREEN') {
      finalTier = 'YELLOW';
      finalReasoning = emergencyOverride.reasoning + ' ' + finalReasoning;
    }

    let response = {
      department: triageResult.department || 'General Medicine',
      priorityTier: finalTier,
      reasoning: finalReasoning,
      followUpQuestion: triageResult.followUpQuestion || null,
      triageComplete: triageResult.triageComplete ?? true,
      isFallback: false,
      safetyOverride: !!emergencyOverride.isEmergency
    };

    // 5. Detect language and translate if necessary
    const detectedLanguage = translationService.detectLanguage(userMessages);
    if (detectedLanguage !== 'en') {
      // In a real production app, we would translate the `reasoning` and `followUpQuestion` here
      // For now, we attach the translation service metadata
      response = translationService.translateResponse(response, detectedLanguage);
    }

    return res.json(response);
  } catch (err) {
    // FAIL-SAFE 2: Return hardcoded fallback
    console.error('Symptom analysis error:', err.message);
    if (err.message?.includes('404') || err.message?.includes('not found')) {
      console.error('   → Tip: set GEMINI_MODEL=gemini-2.5-flash in server/.env and restart');
    }
    return res.json({
      department: 'General Medicine',
      priorityTier: 'GREEN',
      reasoning: 'AI analysis unavailable — default routing applied.',
      followUpQuestion: null,
      triageComplete: true,
      isFallback: true,
    });
  }
};

/** Helper: safely delete an uploaded file */
function cleanupFile(filePath) {
  if (filePath) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

module.exports = {
  extractIdController,
  analyzeSymptomController,
};
