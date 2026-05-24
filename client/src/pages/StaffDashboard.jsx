// ── FILE: pages/StaffDashboard.jsx ── Unified Staff Operations Dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Wifi, WifiOff, Trash2, Clock, User, CreditCard, Building2, 
  AlertTriangle, LayoutDashboard, Users, Activity, Settings, LogOut, 
  CheckCircle, ChevronRight, Stethoscope, Play, Check
} from 'lucide-react';
import { useStaffAlerts } from '../hooks/useStaffAlerts';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com/api' : 'http://localhost:5000/api');

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { alerts, connected, clearAlert, clearAll } = useStaffAlerts();
  const { user, logout } = useAuth();
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState({
    totalWaiting: 0, redPriority: 0, yellowPriority: 0, greenPriority: 0, avgWaitTime: '0m'
  });
  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Fetch logic
  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/dashboard`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setMetrics(data.metrics);
    } catch (e) { console.error('Failed to fetch metrics', e); }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch(`${API_URL}/queue`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setQueue(data.tickets);
    } catch (e) { console.error('Failed to fetch queue', e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/doctors`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setDoctors(data.doctors);
    } catch (e) { console.error('Failed to fetch doctors', e); }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchQueue();
    fetchDoctors();
    const poll = setInterval(() => {
      fetchMetrics();
      fetchQueue();
    }, 10000);
    return () => clearInterval(poll);
  }, []);

  // Actions
  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_URL}/queue/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      fetchQueue();
    } catch (e) { console.error(e); }
  };

  const overridePriority = async (id, priorityTier) => {
    try {
      await fetch(`${API_URL}/queue/${id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priorityTier }),
        credentials: 'include'
      });
      fetchQueue();
    } catch (e) { console.error(e); }
  };

  const toggleDoctor = async (id, isActive) => {
    try {
      await fetch(`${API_URL}/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include'
      });
      fetchDoctors();
    } catch (e) { console.error(e); }
  };

  const timeSince = (timestamp) => {
    const diff = Math.floor((now - new Date(timestamp)) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s ago`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ago`;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'queue', label: 'Queue Board', icon: Users },
    { id: 'alerts', label: 'Insurance Alerts', icon: ShieldAlert, badge: alerts.length },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    ...(user?.role === 'admin' ? [{ id: 'roster', label: 'Admin / Roster', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kiosk-cyan to-kiosk-blue flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
              <h1 className="font-heading font-bold text-lg text-white">Zero-Wait Staff</h1>
              <p className="text-xs text-slate-400">Operations Control</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-kiosk-cyan/10 text-kiosk-cyan' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-kiosk-cyan' : ''}`} />
                {sidebarOpen && (
                  <span className="font-medium whitespace-nowrap flex-1 text-left">{tab.label}</span>
                )}
                {sidebarOpen && tab.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="flex-shrink-0 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/5 backdrop-blur-sm z-10">
          <h2 className="font-heading font-bold text-2xl text-white capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <span className="relative flex w-2.5 h-2.5">
                {connected && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </span>
              {connected ? <><Wifi className="w-4 h-4" /> Live</> : <><WifiOff className="w-4 h-4" /> Disconnected</>}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Metrics Shared by Overview & Analytics */}
          {(activeTab === 'overview' || activeTab === 'analytics') && (
            <div className="max-w-6xl mx-auto mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Unified Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                    <Users className="w-4 h-4" /> Total Waiting
                  </div>
                  <div className="text-3xl font-heading font-bold text-white">{metrics.totalWaiting}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" /> RED Priority
                  </div>
                  <div className="text-3xl font-heading font-bold text-red-300">{metrics.redPriority}</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                    <Clock className="w-4 h-4" /> YELLOW Priority
                  </div>
                  <div className="text-3xl font-heading font-bold text-amber-300">{metrics.yellowPriority}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                    <Activity className="w-4 h-4" /> Avg Wait Time
                  </div>
                  <div className="text-3xl font-heading font-bold text-white">{metrics.avgWaitTime}</div>
                </div>
              </div>
            </div>
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Active Queue Management</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-slate-400 text-sm font-medium">
                    <tr>
                      <th className="px-6 py-4">Token</th>
                      <th className="px-6 py-4">Department / Doctor</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Wait Time</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {queue.length === 0 ? (
                      <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No active tickets</td></tr>
                    ) : queue.map((t) => (
                      <tr key={t._id} className="hover:bg-white/[0.02]">
                        <td className="px-6 py-4 font-bold text-white">{t.tokenNumber}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{t.department}</div>
                          <div className="text-xs text-slate-400">{t.assignedDoctor}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            t.priorityTier === 'RED' ? 'bg-red-500/20 text-red-400' :
                            t.priorityTier === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {t.priorityTier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold ${t.status === 'CALLED' ? 'text-blue-400' : 'text-slate-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {timeSince(t.checkInAt)}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          {t.status === 'WAITING' && (
                            <button onClick={() => updateStatus(t._id, 'CALLED')} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg" title="Call Patient">
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {t.status === 'CALLED' && (
                            <button onClick={() => updateStatus(t._id, 'DONE')} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg" title="Mark Done">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {t.priorityTier !== 'RED' && (
                            <button onClick={() => overridePriority(t._id, 'RED')} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg" title="Escalate to RED">
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {(activeTab === 'overview' || activeTab === 'alerts') && (
            <div className="max-w-6xl mx-auto mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Live Insurance Alerts</h3>
                {alerts.length > 0 && (
                  <button onClick={clearAll} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white text-xs font-medium">
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>
              <AnimatePresence mode="popLayout">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-white/5 rounded-2xl border border-white/5">
                    <CheckCircle className="w-10 h-10 text-emerald-500/50 mb-3" />
                    <p className="text-slate-400 text-sm">No active insurance alerts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {alerts.map((a) => (
                      <motion.div key={a.alertId} layout exit={{ opacity: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
                        <div className="flex justify-between items-start mb-3 pl-3">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="text-red-400 w-5 h-5" />
                            <div>
                              <span className="font-bold text-white">{a.tokenNumber}</span>
                              <p className="text-xs text-red-400">Inactive Insurance Detected</p>
                            </div>
                          </div>
                          <button onClick={() => clearAlert(a.alertId)} className="text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Admin Roster Tab */}
          {activeTab === 'roster' && (
            <div className="max-w-6xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Doctor Roster Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map(doc => (
                  <div key={doc._id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${doc.isActive ? 'bg-kiosk-cyan/20 text-kiosk-cyan' : 'bg-slate-800 text-slate-500'}`}>
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-bold ${doc.isActive ? 'text-white' : 'text-slate-400'}`}>{doc.name}</h4>
                        <p className="text-xs text-slate-500">{doc.department}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleDoctor(doc._id, !doc.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${doc.isActive ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {doc.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
