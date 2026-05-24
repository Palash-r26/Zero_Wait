// ── FILE: pages/QueueBoardPage.jsx ── Live Queue TV Display
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Activity } from 'lucide-react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com' : 'http://localhost:5000');
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com/api' : 'http://localhost:5000/api');

export default function QueueBoardPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Current time updater
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/queue`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Setup socket listeners for real-time updates
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on('queueUpdate', (updatedTicket) => {
      setTickets((prev) => {
        // If ticket is DONE, remove it from board
        if (updatedTicket.status === 'DONE') {
          return prev.filter((t) => t._id !== updatedTicket._id);
        }
        
        // Update or add ticket
        const exists = prev.find((t) => t._id === updatedTicket._id);
        if (exists) {
          return prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t));
        } else {
          return [...prev, updatedTicket].sort((a, b) => new Date(a.checkInAt) - new Date(b.checkInAt));
        }
      });
    });

    // Refresh every 30s just in case
    const pollInterval = setInterval(fetchTickets, 30000);

    return () => {
      socket.disconnect();
      clearInterval(pollInterval);
    };
  }, []);

  const calledTickets = tickets.filter((t) => t.status === 'CALLED');
  const waitingTickets = tickets.filter((t) => t.status === 'WAITING');

  // Group waiting by department
  const waitingByDept = waitingTickets.reduce((acc, ticket) => {
    if (!acc[ticket.department]) acc[ticket.department] = [];
    acc[ticket.department].push(ticket);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Activity className="w-12 h-12 text-kiosk-cyan animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-heading font-extrabold bg-gradient-to-r from-kiosk-cyan to-kiosk-blue bg-clip-text text-transparent">
            {import.meta.env.VITE_HOSPITAL_NAME || 'Zero-Wait OPD'}
          </h1>
          <p className="text-xl text-slate-400 font-medium">Live Queue Board</p>
        </div>
        <div className="flex items-center gap-3 text-2xl font-bold font-mono text-slate-300">
          <Clock className="w-8 h-8 text-kiosk-cyan" />
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </header>

      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Now Calling (Highlight) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-3xl p-6 flex flex-col flex-1">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6 flex items-center gap-3 uppercase tracking-wider">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
              Now Calling
            </h2>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2">
              <AnimatePresence>
                {calledTickets.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20 text-emerald-500/50 font-medium text-xl"
                  >
                    No patients currently being called.
                  </motion.div>
                ) : (
                  calledTickets.map((ticket) => (
                    <motion.div
                      key={ticket._id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-emerald-500/20 rounded-2xl p-6 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                    >
                      <div className="text-6xl font-black text-white font-heading tracking-tight mb-2">
                        {ticket.tokenNumber}
                      </div>
                      <div className="text-xl text-emerald-300 font-bold">
                        → Proceed to {ticket.department}
                      </div>
                      <div className="text-emerald-400/80 mt-1 font-medium">
                        {ticket.assignedDoctor}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Columns: Waiting List by Department */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-slate-300 mb-8 flex items-center gap-3">
            <Users className="w-6 h-6 text-slate-400" />
            Please Wait for Your Number
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 overflow-y-auto pr-4 content-start">
            {Object.keys(waitingByDept).length === 0 ? (
              <div className="col-span-full text-center py-20 text-slate-500 font-medium text-xl">
                Queue is currently empty.
              </div>
            ) : (
              Object.entries(waitingByDept).map(([dept, deptTickets]) => (
                <div key={dept} className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-kiosk-cyan border-b border-white/10 pb-2">
                    {dept}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {deptTickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        className={`py-3 px-4 rounded-xl text-center font-heading font-bold text-xl border ${
                          ticket.priorityTier === 'RED'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : ticket.priorityTier === 'YELLOW'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}
                      >
                        {ticket.tokenNumber}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
