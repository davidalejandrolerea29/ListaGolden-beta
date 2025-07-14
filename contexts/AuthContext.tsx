import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { navigationRef } from '../lib/navigationRef';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  justLoggedIn: boolean;
  setJustLoggedIn: (value: boolean) => void;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    // Obtener sesión inicial
supabase.auth.getSession().then(({ data: { session } }) => {
  setSession(session);
  setUser(session?.user ?? null);
  setJustLoggedIn(false); // 👈 esto es clave
  setLoading(false);
});


    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: {
    fullName: string;
    city: string;
    phone: string;
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          city: userData.city,
          phone: userData.phone,
        },
      },
    });

    if (error) throw error;

    // Crear perfil de usuario
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          full_name: userData.fullName,
          city: userData.city,
          phone: userData.phone,
          accumulated_savings: 0,
        });

      if (profileError) throw profileError;
    }

    return data;
  };

const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  setUser(data.user);
  setJustLoggedIn(true);

  // Esperá un tick del event loop para que el stack se monte
 setTimeout(() => {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name: 'LoginVideo' }],
  });
}, 100);


  return data;
};




const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  setJustLoggedIn(false); // 👈 limpiar al salir
};



  return (
    <AuthContext.Provider value={{
  session,
  user,
  loading,
  signUp,
  signIn,
  signOut,
  justLoggedIn,      // 👈 exponer
  setJustLoggedIn,
     // 👈 exponer
}}>
  {children}
</AuthContext.Provider>

  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}