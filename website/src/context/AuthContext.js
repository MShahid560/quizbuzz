import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('quizbuzz_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    // Clear any previous user data first
    localStorage.removeItem('quizbuzz_user');
    setUser(userData);
    localStorage.setItem('quizbuzz_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quizbuzz_user');
    // Clear seen questions cache on logout
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('seen_')) sessionStorage.removeItem(key);
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);