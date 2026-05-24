// ── FILE: utils/gemini.js ── Google Gemini AI client wrapper
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Lazy-init: only create the client when actually called
let genAI = null;
let model = null;
let activeModelName = null;

/** Default model — gemini-1.5-flash was removed from the API (404). Override via GEMINI_MODEL. */
const getModelName = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash';

/**
 * Get or create the Gemini generative model instance.
 */
const getModel = () => {
  const modelName = getModelName();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('GEMINI_API_KEY is not configured. Set it in server/.env');
  }

  if (!genAI || activeModelName !== modelName) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: modelName });
    activeModelName = modelName;
  }
  return model;
};

/** Human-readable hint for common Gemini API failures (for logs / health). */
const describeGeminiError = (err) => {
  const msg = err?.message || String(err);
  if (msg.includes('404') || msg.includes('not found')) {
    return `Model "${getModelName()}" not found — set GEMINI_MODEL in .env (e.g. gemini-2.5-flash)`;
  }
  if (msg.includes('429') || msg.includes('quota')) {
    return 'Gemini API quota exceeded — check billing at https://ai.google.dev/';
  }
  if (msg.includes('API key') || msg.includes('403')) {
    return 'Invalid or unauthorized GEMINI_API_KEY';
  }
  return msg;
};

/**
 * Call Gemini with a text prompt and expect structured JSON back.
 * @param {string} prompt - The text prompt
 * @param {object} responseSchema - JSON schema for structured output
 * @returns {object} Parsed JSON response from Gemini
 */
const callGeminiJSON = async (prompt, responseSchema) => {
  try {
    const m = getModel();
    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Gemini JSON call failed: ${describeGeminiError(err)}`);
  }
};

/**
 * Call Gemini Vision with an image (base64) + text prompt, expecting JSON output.
 * @param {string} base64Image - Base64-encoded image data
 * @param {string} mimeType - Image MIME type (image/jpeg, image/png, etc.)
 * @param {string} prompt - Text prompt describing what to extract
 * @param {object} responseSchema - JSON schema for structured output
 * @returns {object} Parsed JSON response from Gemini
 */
const callGeminiVision = async (base64Image, mimeType, prompt, responseSchema) => {
  try {
    const m = getModel();
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    const textPart = { text: prompt };

    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [imagePart, textPart] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Gemini Vision call failed: ${describeGeminiError(err)}`);
  }
};

/**
 * Multi-turn chat with Gemini for symptom analysis.
 * @param {Array} messages - Array of {role, content} conversation messages
 * @param {string} systemInstruction - System prompt for the AI
 * @returns {object} Parsed JSON triage result
 */
const callGeminiChat = async (messages, systemInstruction) => {
  try {
    const m = getModel();

    // Build the full prompt with system instruction + conversation history
    let fullPrompt = systemInstruction + '\n\nConversation history:\n';
    for (const msg of messages) {
      const role = msg.role === 'user' ? 'Patient' : 'Triage AI';
      fullPrompt += `${role}: ${msg.content}\n`;
    }
    fullPrompt += '\nRespond with the JSON triage assessment based on the conversation above.';

    const result = await m.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            department: { type: 'string' },
            priorityTier: { type: 'string', enum: ['RED', 'YELLOW', 'GREEN'] },
            reasoning: { type: 'string' },
            followUpQuestion: { type: 'string', nullable: true },
            triageComplete: { type: 'boolean' },
          },
          required: ['department', 'priorityTier', 'reasoning', 'triageComplete'],
        },
      },
    });
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Gemini Chat call failed: ${describeGeminiError(err)}`);
  }
};

module.exports = {
  getModel,
  getModelName,
  describeGeminiError,
  callGeminiJSON,
  callGeminiVision,
  callGeminiChat,
};
