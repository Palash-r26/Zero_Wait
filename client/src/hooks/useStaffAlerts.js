// ── FILE: hooks/useStaffAlerts.js ── Socket.io hook for real-time insurance alerts
import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Custom hook for the Staff Dashboard.
 * Connects to Socket.io, joins 'staff-dashboard' room,
 * and listens for 'insurance:expired' real-time events.
 */
export function useStaffAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🔌 Staff Dashboard connected to Socket.io');

      // Join the staff-dashboard room to receive insurance alerts
      socket.emit('join', 'staff-dashboard');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('🔌 Staff Dashboard disconnected from Socket.io');
    });

    // Listen for insurance expiry alerts from the agent
    socket.on('insurance:expired', (alert) => {
      console.log('🚨 Insurance alert received:', alert);
      setAlerts((prev) => [alert, ...prev]); // Newest first
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  /** Dismiss a single alert by its ID */
  const clearAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
  }, []);

  /** Clear all alerts */
  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  return { alerts, connected, clearAlert, clearAll };
}
