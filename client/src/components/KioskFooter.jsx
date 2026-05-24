import { HelpCircle, PhoneCall, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function KioskFooter() {
  const [calling, setCalling] = useState(false);

  const handleHelp = () => {
    setCalling(true);
    // Simulate a staff call action
    setTimeout(() => {
      setCalling(false);
      alert('A staff member is on their way to assist you.');
    }, 2000);
  };

  return (
    <footer className="flex items-center justify-between px-8 md:px-10 py-4 border-t border-border-light bg-bg-card/60 backdrop-blur-md flex-shrink-0 print-only:hidden no-print text-sm text-text-muted">
      <div className="flex items-center gap-4">
        <div>© {new Date().getFullYear()} Zero-Wait OPD. All rights reserved.</div>
        <Link
          to="/staff"
          className="flex items-center gap-1.5 text-text-muted hover:text-kiosk-red transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Staff View
        </Link>
      </div>
      
      <button
        onClick={handleHelp}
        disabled={calling}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border-light shadow-sm hover:shadow text-text-secondary hover:text-kiosk-blue transition-all disabled:opacity-70 disabled:cursor-wait"
      >
        {calling ? (
          <>
            <PhoneCall className="w-4 h-4 animate-pulse text-kiosk-blue" />
            <span>Calling Staff...</span>
          </>
        ) : (
          <>
            <HelpCircle className="w-4 h-4" />
            <span>Need Help?</span>
          </>
        )}
      </button>
    </footer>
  );
}
