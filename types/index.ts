export enum PromotionType {
  PERCENT_OFF = '% OFF',
  TWO_FOR_ONE = '2x1',
}

export enum EstablishmentCategory {
  GASTRONOMY = 'Gastronomía',
  HOTEL = 'Hotelería',
  ENTERTAINMENT = 'Entretenimiento',
}

export enum UserKeyStatus {
  UNLOCKED = 'UNLOCKED',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
}

export interface UserProfile {
  fullName: string;
  city: string;
  dni: string;
  phone: string;
  email: string;
  accumulatedSavings: number;
  subscribedProvinces: string[];
  profilePictureUrl: string;
}

export interface Establishment {
  id: string;
  name: string;
  logoUrl: string;
  imageUrls: string[];
  city: string;
  province: string;
  availableHours: string;
  promotionType: PromotionType;
  promoValue: string;
  category: EstablishmentCategory;
  description: string;
  history?: string;
  detailedServices?: string[];
  benefitInclusions?: string;
  weeklyHours?: Record<string, string>;
  websiteUrl?: string;
  offersDelivery: boolean;
  stars?: number;
  type?: string;
  locationOnMap?: string;
}

export interface UserKey {
  id: string;
  establishmentId: string;
  establishmentName: string;
  establishmentCategory: EstablishmentCategory;
  promotionType: PromotionType;
  promoValueDisplay: string;
  qrCodes: string[];
  status: UserKeyStatus;
  dateActivated: string;
  dateUsed?: string;
  savedAmount: number;
}

export interface AuthData {
  fullName: string;
  city: string;
  dni: string;
  phone: string;
  email: string;
}

// types.ts

export type RootStackParamList = {
  Landing: undefined;
  Auth: undefined;
  LoginVideo: undefined;
  Tabs: undefined;
  EstablishmentDetail: { id: string };  // ejemplo con parámetro
  Province: undefined;
  CompanyForm: undefined;
  // agrega aquí todas las rutas y sus params si tienen
};
