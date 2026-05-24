// ── FILE: pages/TicketPage.jsx ── Queue ticket display with priority + doctor info
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Printer,
  RotateCcw,
  Clock,
  MapPin,
  UserCheck,
  Hash,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import KioskButton from '../components/KioskButton';
import PriorityBadge from '../components/PriorityBadge';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { usePatient } from '../context/PatientContext';
import { useTranslation } from 'react-i18next';

export default function TicketPage() {
  const navigate = useNavigate();
  const { queueTicket, patientData, resetAll } = usePatient();
  const { t } = useTranslation();
  const [estimatedWait, setEstimatedWait] = useState(
    () => queueTicket?.estimatedWaitMinutes ?? 0
  );

  useEffect(() => {
    if (!queueTicket) {
      navigate('/');
    }
  }, [queueTicket, navigate]);

  // Simulated wait time polling (decreases every 30 seconds)
  useEffect(() => {
    if (!queueTicket) return;

    const interval = setInterval(() => {
      setEstimatedWait((prev) => (prev > 0 ? prev - 1 : 0));
    }, 30000);

    return () => clearInterval(interval);
  }, [queueTicket]);

  const handleNewCheckin = () => {
    resetAll();
    navigate('/');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!queueTicket) return null;

  const priorityMessages = {
    RED: 'You will be seen shortly. Please stay near the department.',
    YELLOW: 'Please wait nearby. A nurse will call your token.',
    GREEN: 'Please take a seat. You will be called in order.',
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Header */}
      <KioskHeader 
        step={3} 
        title={t('ticket.title')} 
        icon={<Activity className="w-5 h-5 text-white" />}
        showBack={false}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-kiosk-green">
          <CheckCircle className="w-5 h-5" />
          {t('ticket.done')}
        </div>
      </KioskHeader>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-8 print-only:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
          className="w-full max-w-lg"
        >
          {/* Ticket Card */}
          <div className="bg-bg-card rounded-[24px] kiosk-shadow border border-slate-200 overflow-hidden">
            {/* Token Header */}
            <div className="bg-gradient-to-br from-kiosk-cyan to-kiosk-blue text-white px-8 py-10 text-center relative overflow-hidden print-only:from-white print-only:to-white print-only:text-black print-only:border-b print-only:border-gray-200">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 print-only:hidden" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 print-only:hidden" />

              <p className="text-sm text-white/60 uppercase tracking-widest font-semibold mb-4 relative z-10 print-only:text-gray-500">
                {t('ticket.token')}
              </p>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
                className="token-display relative z-10 print-only:text-black"
              >
                {queueTicket.tokenNumber}
              </motion.div>
            </div>

            {/* Priority Badge */}
            <div className="flex justify-center -mt-5 relative z-10 print-only:hidden">
              <PriorityBadge tier={queueTicket.priorityTier} size="lg" />
            </div>

            {/* Priority Message */}
            <div className="px-8 pt-6 pb-2 text-center print-only:pt-8">
              <p className="text-base text-text-secondary font-medium print-only:text-black">
                {priorityMessages[queueTicket.priorityTier] || priorityMessages.GREEN}
              </p>
            </div>

            {/* Ticket Details */}
            <div className="px-8 py-6 space-y-4">
              {/* Department */}
              <div className="flex items-center gap-4 bg-bg-primary rounded-[16px] px-5 py-4 print-only:bg-white print-only:border print-only:border-gray-200">
                <MapPin className="w-5 h-5 text-kiosk-cyan flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
                    {t('ticket.department')}
                  </p>
                  <p className="font-heading font-bold text-lg text-text-primary print-only:text-black">
                    {queueTicket.department}
                  </p>
                </div>
              </div>

              {/* Doctor */}
              <div className="flex items-center gap-4 bg-bg-primary rounded-[16px] px-5 py-4 print-only:bg-white print-only:border print-only:border-gray-200">
                <UserCheck className="w-5 h-5 text-kiosk-green flex-shrink-0" />
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
                    Assigned Doctor
                  </p>
                  <p className="font-heading font-bold text-lg text-text-primary print-only:text-black">
                    {queueTicket.assignedDoctor || queueTicket.doctorName || 'Dr. On-Call'}
                  </p>
                </div>
              </div>

              {/* Wait Time + Queue Position */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-bg-primary rounded-[16px] px-5 py-4 print-only:bg-white print-only:border print-only:border-gray-200">
                  <Clock className="w-5 h-5 text-kiosk-amber flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
                      {t('ticket.wait_time')}
                    </p>
                    <p className="font-heading font-bold text-lg text-text-primary print-only:text-black">
                      {estimatedWait} min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-bg-primary rounded-[16px] px-5 py-4 print-only:bg-white print-only:border print-only:border-gray-200">
                  <Hash className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide font-semibold">
                      Position
                    </p>
                    <p className="font-heading font-bold text-lg text-text-primary print-only:text-black">
                      #{queueTicket.queuePosition || 1}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Name (if available) */}
              {patientData?.name && (
                <div className="text-center pt-2 border-t border-border-light print-only:mt-6">
                  <p className="text-sm text-text-muted">Patient</p>
                  <p className="font-semibold text-text-primary print-only:text-black">{patientData.name}</p>
                </div>
              )}

              {/* Live Tracking QR Code */}
              <div className="flex flex-col items-center pt-6 border-t border-border-light print-only:mt-6">
                <p className="text-xs text-text-muted mb-3 font-semibold uppercase tracking-wider print-only:text-gray-500">
                  Scan for Live Status
                </p>
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG 
                    value={`${window.location.origin}/status/${queueTicket._id || queueTicket.tokenNumber}`} 
                    size={100}
                    level="M"
                  />
                </div>
              </div>
            </div>

            {/* Dashed separator */}
            <div className="relative px-4 print-only:hidden">
              <div className="border-t-2 border-dashed border-border-light" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-bg-primary" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-bg-primary" />
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 space-y-3 print-only:hidden">
              <KioskButton
                label="Print / SMS Ticket"
                icon={<Printer className="w-5 h-5" />}
                onClick={handlePrint}
                variant="primary"
              />
              <KioskButton
                label="Start New Check-in"
                icon={<RotateCcw className="w-5 h-5" />}
                onClick={handleNewCheckin}
                variant="secondary"
              />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <KioskFooter />
    </div>
  );
}
