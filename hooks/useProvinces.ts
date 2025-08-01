// src/hooks/useProvinces.ts

import { useEffect, useState } from 'react';
import api from '../lib/api';

export interface Province {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
  price: number; // ✅ Añadimos la nueva propiedad 'price'
}

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const { data } = await api.get('/provinces');
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