import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  full_name: string | null;
  city: string | null;
  phone: string | null;
  profile_picture_url: string | null;
  accumulated_savings: number;
  created_at: string;
  updated_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  province_id: number;
  is_active: boolean;
  province: {
    id: number;
    description: string;
  };
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMemberships();
    } else {
      setProfile(null);
      setMemberships([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Crear perfil si no existe
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || null,
            city: user.user_metadata?.city || null,
            phone: user.user_metadata?.phone || null,
            accumulated_savings: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .select(`
          *,
          province:provinces(id, description)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const activateProvince = async (provinceId: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_memberships')
        .insert({
          user_id: user.id,
          province_id: provinceId,
          is_active: true,
        })
        .select(`
          *,
          province:provinces(id, description)
        `)
        .single();

      if (error) throw error;
      
      // Actualizar lista de membresías
      setMemberships(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error activating province:', error);
      throw error;
    }
  };

  const getActiveProvinces = () => {
    return memberships.map(m => m.province.description);
  };

  return {
    profile,
    memberships,
    loading,
    updateProfile,
    activateProvince,
    getActiveProvinces,
    refetch: () => {
      fetchProfile();
      fetchMemberships();
    },
  };
}