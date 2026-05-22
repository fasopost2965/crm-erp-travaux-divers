import axios from 'axios';

// Configuration de l'URL de base pour l'API Laravel
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Non requis pour l'authentification par Token Sanctum (évite les erreurs CORS)
});

// Intercepteur de requêtes pour ajouter le Token JWT/Sanctum dans les en-têtes et corriger les préfixes redondants
api.interceptors.request.use(
  (config) => {
    // Corriger le préfixe redondant /api/ si l'URL commence par /api/ pour éviter /api/api/
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponses pour intercepter les erreurs globales (ex: 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si l'erreur est un 401, cela signifie que le token a expiré ou est invalide
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optionnel: rediriger vers le login en rechargeant la page ou via Router
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
