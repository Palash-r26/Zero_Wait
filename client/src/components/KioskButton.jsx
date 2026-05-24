// ── FILE: components/KioskButton.jsx ── Reusable large touch-friendly button
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Large kiosk button designed for touch-screen interaction.
 * @param {string} label - Button text
 * @param {ReactNode} icon - Optional icon element
 * @param {Function} onClick - Click handler
 * @param {'primary'|'secondary'|'danger'|'success'} variant - Visual style
 * @param {boolean} disabled - Disable button
 * @param {boolean} loading - Show loading spinner
 * @param {string} className - Additional classes
 */
export default function KioskButton({
  label,
  icon,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) {
  // Variant styles
  const variants = {
    primary:
      'bg-gradient-to-br from-kiosk-cyan to-kiosk-blue text-white shadow-[0_20px_60px_rgba(6,182,212,0.12)]',
    secondary:
      'bg-white text-kiosk-blue-dark border border-slate-200 hover:bg-slate-50',
    danger:
      'bg-gradient-to-br from-kiosk-red to-red-600 text-white shadow-[0_20px_60px_rgba(239,68,68,0.12)]',
    success:
      'bg-gradient-to-br from-kiosk-green to-green-600 text-white shadow-[0_20px_60px_rgba(34,197,94,0.12)]',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.03 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative w-full min-h-[72px] px-8 py-[18px]
        rounded-[24px] font-heading font-bold text-xl
        flex items-center justify-center gap-3
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="w-7 h-7 animate-spin" />
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{label}</span>
        </>
      )}
    </motion.button>
  );
}
