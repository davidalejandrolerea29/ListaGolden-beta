// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Keychain from 'react-native-keychain'; // ✅ Usamos react-native-keychain
import api from '../lib/api';
import { navigationRef } from '../lib/navigationRef';
import { CommonActions } from '@react-navigation/native';

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: {
    fullName: string;
    city: string;
    phone: string;
  }) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        const token = credentials ? credentials.password : null;

        if (token) {
          const { data } = await api.get('/v1/auth/me');
          setUser(data);
        }
      } catch (error) {
        // ✅ Aquí es donde hacemos el cambio.
        // Podrías registrar el error solo en modo desarrollo o no mostrarlo en consola al usuario.
        // console.warn('Keychain no disponible o error al cargar sesión, esto es normal en primera carga o emuladores sin soporte completo.'); // Cambiamos a warn o simplemente removemos para producción
        await Keychain.resetGenericPassword(); // Limpiamos en caso de un token corrupto o error de acceso.
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  
  const signUp = async (email: string, password: string, userData: {
    fullName: string;
    city: string;
    phone: string;
  }) => {
    try {
      const { data } = await api.post('/v1/auth/register', {
        email,
        password,
        full_name: userData.fullName,
        city: userData.city,
        phone: userData.phone,
      });

      // ✅ Usamos setGenericPassword para guardar el token
      await Keychain.setGenericPassword('token', data.authorisation.token);
      setUser(data.user);
      return data;
    } catch (error: any) {
      console.error('Error en el registro:', error.response?.data || error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
      });

      // ✅ Usamos setGenericPassword para guardar el token
      await Keychain.setGenericPassword('token', data.access_token);

      setUser(data.user);

      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LoginVideo' }],
        })
      );

      return data;
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error.response?.data || error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await api.get('/v1/auth/logout');
      await Keychain.resetGenericPassword(); // ✅ Limpiamos las credenciales
      setUser(null);
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}