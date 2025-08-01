import { useEffect, useState } from 'react';
import api from '../lib/api'; // ✅ Importamos la instancia de axios

export interface Company {
  id: number;
  name: string;
  short_description: string | null;
  long_description: string | null;
  with_reservation: boolean;
  with_delivery: boolean;
  created_at: string;
  updated_at: string;
  images: CompanyImage[];
  location: LocationCompany | null;
  services: Service[];
  schedules: Schedule[];
}

export interface CompanyImage {
  id: number;
  file_url: string;
  company_id: number;
}

export interface LocationCompany {
  id: number;
  location_id: number;
  company_id: number;
  lat: number;
  long: number;
  location: {
    id: number;
    description: string;
    price: number;
    province: {
      id: number;
      description: string;
    };
  };
}

export interface Service {
  id: number;
  description: string;
  company_id: number;
  promotions: Promotion[];
}

export interface Promotion {
  id: number;
  description: string;
  service_id: number;
}

export interface Schedule {
  id: number;
  company_id: number;
  start_time: string;
  end_time: string;
  day: {
    id: number;
    description: string;
  };
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies'); // ✅ Usamos el nuevo endpoint

      // La respuesta de Laravel con `eager loading` ya tiene la estructura correcta,
      // así que no necesitamos una transformación compleja como la de Supabase.
      // Sin embargo, si `location` viene como un array, lo transformamos.
      const transformedCompanies = data.map((company: any) => ({
        ...company,
        location: company.location?.[0] || null, // Acepta la primera locación si viene como array
      })) || [];

      setCompanies(transformedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // (El resto de las funciones `getCompaniesByProvince`, `getCompanyById`, etc.
  // no necesitan cambios, ya que operan sobre el estado `companies`).

  const getCompaniesByProvince = (provinceName: string) => {
    return companies.filter(
      company => company.location?.location?.province?.description === provinceName
    );
  };

  const getCompanyById = (id: number) => {
    return companies.find(company => company.id === id);
  };

  const getDeliveryCompanies = (activeProvinces: string[]) => {
    return companies.filter(
      company => 
        company.with_delivery && 
        company.location?.location?.province?.description &&
        activeProvinces.includes(company.location.location.province.description)
    );
  };

  return {
    companies,
    loading,
    getCompaniesByProvince,
    getCompanyById,
    getDeliveryCompanies,
    refetch: fetchCompanies,
  };
}