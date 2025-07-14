import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Province {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('description');

      if (error) throw error;
      setProvinces(data || []);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProvinceByName = (name: string) => {
    return provinces.find(province => province.description === name);
  };

  const getProvinceById = (id: number) => {
    return provinces.find(province => province.id === id);
  };

  return {
    provinces,
    loading,
    getProvinceByName,
    getProvinceById,
    refetch: fetchProvinces,
  };
}