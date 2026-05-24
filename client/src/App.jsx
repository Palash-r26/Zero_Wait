// ── FILE: App.jsx ── Zero-Wait OPD Kiosk — Root component with routing
import { Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import WelcomePage from './pages/WelcomePage';
import IDScanPage from './pages/IDScanPage';
import SymptomChatPage from './pages/SymptomChatPage';
import TicketPage from './pages/TicketPage';
import TicketStatusPage from './pages/TicketStatusPage';
import StaffDashboard from './pages/StaffDashboard';
import QueueBoardPage from './pages/QueueBoardPage';

import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import { useEffect, useState } from 'react';
import { checkHealth } from './api/client';
import { AlertTriangle } from 'lucide-react';

/**
 * Root application component.
 * Wraps all routes in PatientContext for shared kiosk state.
 */
export default function App() {
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const verifyHealth = async () => {
      const result = await checkHealth();
      if (result.status === 'error' || !result.ai?.gemini?.configured) {
        setApiError(true);
      }
    };
    verifyHealth();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <PatientProvider>
          <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
            {apiError && (
              <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium z-50 relative shadow-md">
                <AlertTriangle className="w-4 h-4" />
                <span>API Unhealthy or Missing API Keys (Check backend logs and .env)</span>
              </div>
            )}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/scan" element={<IDScanPage />} />
              <Route path="/symptoms" element={<SymptomChatPage />} />
              <Route path="/ticket" element={<TicketPage />} />
              <Route path="/status/:id" element={<TicketStatusPage />} />
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Staff/Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['staff', 'nurse', 'admin']} />}>
                <Route path="/staff" element={<StaffDashboard />} />
                <Route path="/queue-board" element={<QueueBoardPage />} />
              </Route>
            </Routes>
          </div>
        </PatientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
