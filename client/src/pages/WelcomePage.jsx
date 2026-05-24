// ── FILE: pages/WelcomePage.jsx ── Kiosk welcome screen with check-in options
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, PenLine, Activity, Globe, Shield, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import KioskButton from '../components/KioskButton';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';
import { usePatient } from '../context/PatientContext';
import { useTranslation } from 'react-i18next';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { resetAll } = usePatient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t, i18n } = useTranslation();

  // Reset patient data on welcome page (fresh session)
  useEffect(() => {
    resetAll();
  }, [resetAll]);

  // Live clock — update every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const languages = [
    { code: 'en', label: t('welcome.english') },
    { code: 'hi', label: t('welcome.hindi') },
    { code: 'ta', label: t('welcome.tamil') },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="gradient-mesh" />

      {/* Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <KioskHeader title={import.meta.env.VITE_HOSPITAL_NAME || "Zero-Wait OPD"} subtitle="Smart OPD Kiosk" showBack={false}>
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-text-muted" />
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  i18n.language === lang.code
                    ? 'bg-gradient-to-br from-kiosk-cyan to-kiosk-blue text-white shadow-[0_4px_12px_rgba(6,182,212,0.2)]'
                    : 'bg-white/70 text-text-secondary hover:bg-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </KioskHeader>
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Hospital Icon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-kiosk-cyan to-kiosk-blue flex items-center justify-center mx-auto mb-8 shadow-[0_20px_60px_rgba(6,182,212,0.3)]"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-text-primary mb-4 leading-tight">
            {t('welcome.title')}{' '}
            <span className="bg-gradient-to-r from-kiosk-cyan to-kiosk-blue bg-clip-text text-transparent">
              {import.meta.env.VITE_HOSPITAL_NAME || t('welcome.subtitle')}
            </span>
          </h1>

          <p className="text-xl text-text-secondary mb-12 max-w-lg mx-auto leading-relaxed">
            {t('welcome.tap_to_start')}
          </p>

          {/* Check-in Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <KioskButton
                label={t('scan.title')}
                icon={<CreditCard className="w-7 h-7" />}
                onClick={() => navigate('/scan')}
                variant="primary"
                className="min-h-[120px] text-xl"
              />
              <p className="text-sm text-text-muted mt-3">{t('scan.subtitle')}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <KioskButton
                label={t('symptoms.title')}
                icon={<PenLine className="w-7 h-7" />}
                onClick={() => navigate('/symptoms')}
                variant="secondary"
                className="min-h-[120px] text-xl"
              />
              <p className="text-sm text-text-muted mt-3">{t('welcome.tap_to_start')}</p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Bottom Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10"
      >
        <KioskFooter />
      </motion.div>
    </div>
  );
}
