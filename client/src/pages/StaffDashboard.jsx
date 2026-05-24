// ── FILE: pages/StaffDashboard.jsx ── Real-time insurance alert panel
// This page is the proof of AGENTIC BEHAVIOUR for the hackathon demo.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Wifi,
  WifiOff,
  Trash2,
  ArrowLeft,
  Bell,
  BellRing,
  Clock,
  User,
  CreditCard,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useStaffAlerts } from '../hooks/useStaffAlerts';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { alerts, connected, clearAlert, clearAll } = useStaffAlerts();
  const [now, setNow] = useState(new Date());

  // Update "time since" every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /** Format "time since" alert */
  const timeSince = (timestamp) => {
    const diff = Math.floor((now - new Date(timestamp)) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s ago`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ago`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-white/80" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl">Staff Alert Dashboard</h1>
              <p className="text-xs text-white/50">Real-time Insurance Expiry Alerts — Agentic AI</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Alert Count Badge */}
          {alerts.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-semibold"
            >
              <BellRing className="w-4 h-4" />
              {alerts.length} Active {alerts.length === 1 ? 'Alert' : 'Alerts'}
            </motion.div>
          )}

          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${
              connected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <span className="relative flex w-2.5 h-2.5">
              {connected && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  connected ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
            </span>
            {connected ? (
              <>
                <Wifi className="w-4 h-4" /> Live
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" /> Disconnected
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-8 max-w-4xl mx-auto w-full">
        {/* Clear All Button */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end mb-6"
          >
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Alerts
            </button>
          </motion.div>
        )}

        {/* Alert Cards */}
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <Bell className="w-10 h-10 text-emerald-500/50" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white/80 mb-2">
                No Active Alerts
              </h3>
              <p className="text-sm text-white/40 max-w-md">
                All patients have active insurance. When a patient with inactive or expired
                insurance checks in at the kiosk, an alert will appear here in real-time.
              </p>
              <div className="mt-8 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/30 text-xs">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Listening for alerts...
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.alertId}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ type: 'spring', bounce: 0.3 }}
                  layout
                  className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all group"
                >
                  {/* Red left border accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 to-rose-600" />

                  <div className="pl-7 pr-6 py-5">
                    {/* Top Row: Token + Time + Dismiss */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <span className="font-heading font-bold text-xl text-white">
                            {alert.tokenNumber}
                          </span>
                          <p className="text-xs text-red-300 font-medium mt-0.5">
                            ⚠ Inactive Insurance Detected
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/40 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeSince(alert.timestamp)}
                        </span>
                        <button
                          onClick={() => clearAlert(alert.alertId)}
                          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Dismiss alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Alert Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                          <User className="w-3 h-3" /> Patient
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {alert.patient.name}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                          <Building2 className="w-3 h-3" /> Department
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {alert.department}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                          <CreditCard className="w-3 h-3" /> Provider
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {alert.patient.insurance?.provider || 'Unknown'}
                        </p>
                      </div>

                      <div className="bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                          <ShieldAlert className="w-3 h-3" /> Policy ID
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {alert.patient.insurance?.policyId || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          alert.priorityTier === 'RED'
                            ? 'bg-red-500/20 text-red-300'
                            : alert.priorityTier === 'YELLOW'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {alert.priorityTier} Priority
                      </span>
                      <span className="text-xs text-white/30">
                        ID: {alert.patient.uniqueId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-white/10 text-center text-xs text-white/30">
        Zero-Wait OPD Kiosk — Agentic Insurance Alert System • Socket.io Real-time Pipeline
      </footer>
    </div>
  );
}
