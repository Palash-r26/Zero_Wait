// ── FILE: pages/SymptomChatPage.jsx ── AI-powered symptom triage chat interface
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Stethoscope, AlertTriangle, Mic, PhoneOff } from 'lucide-react';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import PriorityBadge from '../components/PriorityBadge';
import KioskButton from '../components/KioskButton';
import VoiceVisualizer from '../components/VoiceVisualizer';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { usePatient } from '../context/PatientContext';
import { useSymptomChat } from '../hooks/useSymptomChat';
import { useRealtimeVoice } from '../hooks/useRealtimeVoice';
import { allocateQueue, createPatient } from '../api/client';
import { useTranslation } from 'react-i18next';

export default function SymptomChatPage() {
  const navigate = useNavigate();
  const { patientData, setPatientData, setTriageResult, setQueueTicket } = usePatient();
  const { t, i18n } = useTranslation();
  
  // Pass current language to hook
  const { messages, sendMessage, loading, triageResult } = useSymptomChat(i18n.language);

  const [inputValue, setInputValue] = useState('');
  const [allocating, setAllocating] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef(null);

  const { voiceState, errorMsg, startSession, stopSession } = useRealtimeVoice((result) => {
    // If voice agent completes triage, it calls this
    setTriageResult(result);
  });

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      stopSession();
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
      startSession();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirmTriage = async () => {
    if (!triageResult) return;

    setAllocating(true);
    setTriageResult(triageResult);

    try {
      let patientIdToUse = patientData?._id || patientData?.id;
      
      // If no patient exists (walk-in without ID), create one so queue save doesn't fail
      if (!patientIdToUse) {
        const result = await createPatient({ 
          name: 'Walk-in Patient', 
          uniqueId: 'WALKIN-' + Date.now(),
          gender: 'unknown',
          insurance: { status: 'unknown', provider: '', policyId: '' }
        });
        if (result.success) {
          patientIdToUse = result.patient._id;
          setPatientData(result.patient);
        } else {
          patientIdToUse = 'walk-in-' + Date.now();
        }
      }

      const payload = {
        patientId: patientIdToUse,
        department: triageResult.department,
        priorityTier: triageResult.priorityTier,
      };

      const result = await allocateQueue(payload);

      if (result.success) {
        setQueueTicket({
          ...result.ticket,
          doctorName: result.doctorName,
          queuePosition: result.queuePosition,
          estimatedWaitMinutes: result.estimatedWaitMinutes,
        });
        navigate('/ticket');
      } else {
        // Fallback: create a virtual ticket
        setQueueTicket({
          tokenNumber: `GENMED-${String(Date.now()).slice(-3)}`,
          department: triageResult.department,
          priorityTier: triageResult.priorityTier,
          assignedDoctor: 'Dr. On-Call',
          estimatedWaitMinutes: 15,
          queuePosition: 1,
          status: 'WAITING',
        });
        navigate('/ticket');
      }
    } catch {
      // Even on total failure, navigate with a virtual ticket
      setQueueTicket({
        tokenNumber: `GENMED-${String(Date.now()).slice(-3)}`,
        department: triageResult.department,
        priorityTier: triageResult.priorityTier,
        assignedDoctor: 'Dr. On-Call',
        estimatedWaitMinutes: 15,
        queuePosition: 1,
        status: 'WAITING',
      });
      navigate('/ticket');
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <KioskHeader 
        step={2} 
        title={t('symptoms.title')} 
        subtitle={t('symptoms.subtitle')}
        icon={<Stethoscope className="w-5 h-5 text-white" />}
      >
        <button
          onClick={toggleVoiceMode}
          className={`ml-3 p-3 rounded-xl border transition-all flex items-center gap-2 ${
            isVoiceMode 
              ? 'bg-red-500 border-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-white border-border-light text-text-secondary hover:bg-bg-primary'
          }`}
        >
          {isVoiceMode ? (
            <>
              <PhoneOff className="w-5 h-5" />
              <span className="text-sm font-bold">End Voice Call</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 text-kiosk-cyan" />
              <span className="text-sm font-bold text-kiosk-cyan">Voice Agent</span>
            </>
          )}
        </button>
      </KioskHeader>

      {/* Chat Messages Area */}
      <main className="flex-1 overflow-y-auto px-8 py-6 relative">
        <div className="max-w-2xl mx-auto space-y-5">
          {isVoiceMode && !triageResult ? (
             <div className="flex flex-col items-center justify-center min-h-[400px]">
               <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Live Audio Triage</h2>
               <p className="text-text-muted mb-8 text-center max-w-md">
                 Speak naturally. Our AI agent is listening and will assess your symptoms in real-time.
               </p>
               <VoiceVisualizer state={voiceState} />
               {errorMsg && <p className="text-red-500 mt-4 font-medium">{errorMsg}</p>}
               <p className="mt-8 text-sm text-text-muted capitalize font-bold">
                 Status: <span className={voiceState === 'connecting' ? 'text-amber-500' : 'text-kiosk-blue'}>{voiceState}</span>
               </p>
             </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatBubble key={idx} role={msg.role} content={msg.content} />
              ))}


          {/* Typing indicator */}
          {loading && <TypingIndicator />}

          {/* Triage Complete Card */}
          <AnimatePresence>
            {triageResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[24px] border border-slate-200 kiosk-shadow p-6 space-y-5"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    Triage Assessment
                  </h3>
                  <PriorityBadge tier={triageResult.priorityTier} size="sm" />
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-bg-primary rounded-xl px-5 py-4">
                    <span className="text-sm text-text-muted font-medium">Department</span>
                    <span className="ml-auto font-heading font-bold text-text-primary">
                      {triageResult.department}
                    </span>
                  </div>
                  <div className="bg-bg-primary rounded-xl px-5 py-4">
                    <span className="text-sm text-text-muted font-medium">Reasoning</span>
                    <p className="text-sm text-text-primary mt-1 leading-relaxed">
                      {triageResult.reasoning}
                    </p>
                  </div>
                </div>

                {/* Fallback Warning */}
                {triageResult.isFallback && (
                  <div className="flex items-start gap-2 bg-kiosk-amber-light rounded-xl p-4">
                    <AlertTriangle className="w-5 h-5 text-kiosk-amber flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary">
                      AI analysis was unavailable. You've been assigned to General Medicine as a
                      precaution. A doctor will reassess your symptoms.
                    </p>
                  </div>
                )}

                {/* Confirm Button */}
                <KioskButton
                  label="Confirm & Get Queue Ticket"
                  onClick={handleConfirmTriage}
                  loading={allocating}
                  variant="success"
                  className="min-h-[70px]"
                />
              </motion.div>
            )}
          </AnimatePresence>
            </>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Input Bar */}
      {!triageResult && !isVoiceMode && (
        <div className="flex-shrink-0 border-t border-border-light bg-white/70 backdrop-blur-md px-8 py-5">
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('symptoms.input_placeholder')}
              disabled={loading}
              className="flex-1 bg-bg-primary border-2 border-border-light rounded-xl px-5 py-4 text-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-kiosk-cyan focus:ring-2 focus:ring-kiosk-cyan/20 transition-all disabled:opacity-50"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-kiosk-cyan to-kiosk-blue text-white flex items-center justify-center shadow-[0_4px_12px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all self-center"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Footer */}
      <KioskFooter />
    </div>
  );
}
