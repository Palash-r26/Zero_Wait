import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, ShieldPlus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePatient } from '../context/PatientContext';

export default function KioskHeader({ 
  title, 
  subtitle, 
  icon, 
  step = 0, 
  showBack = true, 
  children 
}) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { patientData } = usePatient();

  const steps = [
    { id: 1, label: 'ID Scan' },
    { id: 2, label: 'Symptoms' },
    { id: 3, label: 'Ticket' }
  ];

  return (
    <header className="flex items-center gap-4 px-8 md:px-10 py-5 border-b border-border-light bg-bg-card/60 backdrop-blur-md flex-shrink-0 print-only:hidden no-print">
      {/* Back Button */}
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-xl bg-bg-card border border-border-light hover:bg-bg-primary transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-text-secondary" />
        </button>
      ) : (
        <div className="w-[50px]"></div> // Placeholder for alignment
      )}

      {/* Title & Icon */}
      <div className="flex items-center gap-3 min-w-max">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kiosk-cyan to-kiosk-blue flex items-center justify-center">
          {icon || <ShieldPlus className="w-5 h-5 text-white" />}
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl text-text-primary">{title || "Zero-Wait OPD"}</h1>
          {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
        </div>
      </div>

      {/* Step Indicator */}
      {step > 0 && (
        <div className="hidden md:flex items-center justify-center flex-1 mx-4">
          <div className="flex items-center gap-2 bg-bg-primary/50 px-4 py-2 rounded-full border border-border-light">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold transition-colors
                  ${step === s.id ? 'bg-gradient-to-br from-kiosk-cyan to-kiosk-blue text-white shadow-md' : 
                    step > s.id ? 'text-kiosk-green' : 'text-text-muted'}`}>
                  <span>{s.id}.</span>
                  <span>{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-4 h-px mx-1 ${step > s.id ? 'bg-kiosk-green' : 'bg-border-medium'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {patientData?.name && (
          <div className="hidden sm:block px-4 py-2 rounded-full bg-kiosk-blue-light text-kiosk-blue text-sm font-semibold">
            {patientData.name}
          </div>
        )}
        
        {children}

        {/* Theme Toggle (Hidden on Kiosk by default, but available for testing) */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-xl bg-bg-card border border-border-light hover:bg-bg-primary transition-all"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-kiosk-amber" /> : <Moon className="w-5 h-5 text-text-secondary" />}
        </button>
      </div>
    </header>
  );
}
