import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const login = (userData, userToken) => {
    let normalizedUser = { ...userData };
    if (Array.isArray(normalizedUser.email)) {
      normalizedUser.email = normalizedUser.email[0];
    }
    setUser(normalizedUser);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};