// src/hooks/useCompaniesByProvince.ts

import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Company } from './useCompanies';

export function useCompaniesByProvince(provinceId: number | null) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (provinceId) {
      fetchCompanies(provinceId);
    }
  }, [provinceId]);

  const fetchCompanies = async (id: number) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/companies/province/${id}`);

      // ✅ Quitamos la transformación que asume que 'location' es un array.
      // La respuesta de tu API ya tiene el formato correcto.
      setCompanies(data || []); 
      
    } catch (error) {
      console.error(`Error fetching companies for province ${id}:`, error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    companies,
    loading,
    refetch: fetchCompanies,
  };
}