// src/lib/api.ts

import axios from 'axios';
import { navigationRef } from './navigationRef';
import { CommonActions } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';

const API_URL = 'http://192.168.1.41:8000/api/v1'; 
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTOR DE PETICIÓN (Request Interceptor)
// Se ejecuta ANTES de que se envíe la petición al servidor.
api.interceptors.request.use(
  async (config) => {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        config.headers.Authorization = `Bearer ${credentials.password}`;
      }
    } catch (error) {
      console.error('Failed to get token from Keychain:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ✅ INTERCEPTOR DE RESPUESTA (Response Interceptor)
// Se ejecuta DESPUÉS de que se recibe una respuesta del servidor.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si el error es 401 (Unauthorized) y no es el login, limpia el token y redirige.
    if (error.response?.status === 401 && error.config.url !== '/auth/login') {
      console.error('Token expirado o inválido. Redirigiendo a la pantalla de login.');
      await Keychain.resetGenericPassword();
      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Landing' }],
        })
      );
    }
    return Promise.reject(error);
  }
);

export default api;