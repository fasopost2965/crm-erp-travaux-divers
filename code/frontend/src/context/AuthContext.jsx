import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier s'il y a un token enregistré au montage du composant
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Valider le token et récupérer les détails de l'utilisateur
          const response = await api.get('/auth/me');
          setUser(response.data.data || response.data);
        } catch (error) {
          console.error("Session invalide ou expirée", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error("Erreur de connexion", error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Erreur lors de la déconnexion backend", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé au sein d'un AuthProvider");
  }
  return context;
};
