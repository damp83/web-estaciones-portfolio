import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, ADMIN_USER_ID } from '../lib/appwrite';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentAccount = await account.get();
        if (currentAccount.$id === ADMIN_USER_ID) {
          setUser(currentAccount);
          setIsAdmin(true);
        }
      } catch { setIsAdmin(false); }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    await account.createEmailPasswordSession(email, password);
    const cu = await account.get();
    if (cu.$id !== ADMIN_USER_ID) {
      await account.deleteSession('current');
      throw new Error('Este usuario no tiene permisos de administrador.');
    }
    setUser(cu); 
    setIsAdmin(true);
  };

  const logout = async () => {
    try { await account.deleteSession('current'); } catch {}
    setIsAdmin(false); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, user, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
