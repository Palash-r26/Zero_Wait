import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to rehydrate session on load
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com/api' : 'http://localhost:5000/api');
    
    fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (username, password) => {
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com/api' : 'http://localhost:5000/api');
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zero-wait.onrender.com/api' : 'http://localhost:5000/api');
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
