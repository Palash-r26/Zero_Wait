import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, MapPin, UserCheck, CheckCircle } from 'lucide-react';
import PriorityBadge from '../components/PriorityBadge';
import KioskHeader from '../components/KioskHeader';
import KioskFooter from '../components/KioskFooter';

export default function TicketStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we would fetch the specific ticket here.
    // For the demo, we mock it.
    setTimeout(() => {
      setTicket({
        tokenNumber: 'CARDIO-007',
        department: 'Cardiology',
        assignedDoctor: 'Dr. Anjali Mehta',
        status: 'WAITING',
        priorityTier: 'YELLOW',
        estimatedWaitMinutes: 12
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Activity className="w-12 h-12 text-kiosk-blue animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <KioskHeader title="Live Status" subtitle="Zero-Wait OPD" showBack={false} />
      
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-8">
        <div className="bg-bg-card rounded-3xl p-8 max-w-sm w-full text-center border border-border-light kiosk-shadow">
          <p className="text-sm text-text-muted uppercase tracking-widest font-semibold mb-2">
            Your Token
          </p>
          <div className="text-4xl font-heading font-black text-white mb-6">
            {ticket.tokenNumber}
          </div>
          
          <div className="flex justify-center mb-6">
            <PriorityBadge tier={ticket.priorityTier} size="lg" />
          </div>
          
          <div className="bg-bg-primary rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 text-text-secondary mb-2">
              <MapPin className="w-4 h-4 text-kiosk-blue" />
              <span>{ticket.department}</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <UserCheck className="w-4 h-4 text-kiosk-green" />
              <span>{ticket.assignedDoctor}</span>
            </div>
          </div>
          
          <div className={`p-4 rounded-xl font-bold text-lg ${
            ticket.status === 'WAITING' ? 'bg-blue-500/10 text-blue-400' :
            ticket.status === 'CALLED' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
            'bg-emerald-500/10 text-emerald-400'
          }`}>
            Status: {ticket.status}
          </div>
          
          {ticket.status === 'WAITING' && (
            <p className="text-text-muted text-sm mt-4">
              Estimated Wait: {ticket.estimatedWaitMinutes} mins
            </p>
          )}
        </div>
      </main>
      
      <KioskFooter />
    </div>
  );
}
