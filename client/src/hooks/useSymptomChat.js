// ── FILE: hooks/useSymptomChat.js ── Custom hook for symptom triage chat
import { useState, useCallback, useRef } from 'react';
import { analyzeSymptoms } from '../api/client';

/**
 * Custom hook managing the multi-turn symptom chat with Gemini AI.
 * Handles message history, loading state, and triage result.
 */
export function useSymptomChat(locale = 'en') {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content:
        "Hello! I'm your triage assistant. Please describe your main symptom or what brings you to the hospital today.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const isSending = useRef(false);

  /**
   * Send a user message and get AI response.
   * Handles multi-turn follow-ups and final triage completion.
   */
  const sendMessage = useCallback(
    async (userText) => {
      if (!userText.trim() || loading || isSending.current) return;
      isSending.current = true;

      // Append user message
      const userMsg = { role: 'user', content: userText.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setLoading(true);

      try {
        // Send full conversation history to the API with locale
        const result = await analyzeSymptoms(updatedMessages, locale);

        // Server may return a safe fallback when Gemini is down (still HTTP 200)
        if (result.isFallback && result.triageComplete) {
          const aiMsg = {
            role: 'model',
            content: `I've completed a basic assessment (AI service limited):\n\n**Department:** ${result.department}\n**Priority:** ${result.priorityTier}\n**Reasoning:** ${result.reasoning}`,
          };
          setMessages((prev) => [...prev, aiMsg]);
          setTriageResult(result);
          return;
        }

        if (result.triageComplete) {
          // Triage is done — show the final assessment
          const aiMsg = {
            role: 'model',
            content: `Based on your symptoms, I've completed the assessment:\n\n**Department:** ${result.department}\n**Priority:** ${result.priorityTier}\n**Reasoning:** ${result.reasoning}`,
          };
          setMessages((prev) => [...prev, aiMsg]);
          setTriageResult(result);
        } else if (result.followUpQuestion) {
          // AI needs more info — relay the follow-up question
          const aiMsg = { role: 'model', content: result.followUpQuestion };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          // Edge case: no follow-up but not complete — treat as complete
          setTriageResult(result);
        }
      } catch (err) {
        // Use server body if present (e.g. validation error with partial data)
        const serverData = err.response?.data;
        if (serverData?.triageComplete || serverData?.department) {
          setTriageResult({ ...serverData, triageComplete: true, isFallback: true });
          setMessages((prev) => [
            ...prev,
            {
              role: 'model',
              content: `Assessment (limited): **${serverData.department}** — ${serverData.priorityTier}`,
            },
          ]);
          return;
        }

        const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com' : 'http://localhost:5000');
        const isNetwork =
          err.code === 'ERR_NETWORK' ||
          err.message === 'Network Error' ||
          !err.response;

        const chatLine = isNetwork
          ? `I can't reach the hospital server at ${apiBase}. Make sure the API is running (\`npm run dev\` in the server folder), then try again.`
          : err.response?.status === 422
            ? "Your message couldn't be processed. Please try again."
            : `The AI service returned an error (${err.response?.status || 'unknown'}). You'll be routed to General Medicine for a standard check-up.`;

        if (import.meta.env.DEV) {
          console.error('[useSymptomChat]', err.response?.data || err.message);
        }

        setMessages((prev) => [
          ...prev,
          { role: 'model', content: chatLine },
        ]);
        setTriageResult({
          department: 'General Medicine',
          priorityTier: 'GREEN',
          reasoning: 'AI analysis unavailable — default routing applied.',
          followUpQuestion: null,
          triageComplete: true,
          isFallback: true,
        });
      } finally {
        setLoading(false);
        isSending.current = false;
      }
    },
    [messages, loading, locale]
  );

  /** Reset the chat for a new session */
  const resetChat = useCallback(() => {
    setMessages([
      {
        role: 'model',
        content:
          "Hello! I'm your triage assistant. Please describe your main symptom or what brings you to the hospital today.",
      },
    ]);
    setLoading(false);
    setTriageResult(null);
  }, []);

  return { messages, sendMessage, loading, triageResult, resetChat };
}
