import { PromotionType, EstablishmentCategory, UserKeyStatus, UserProfile, Establishment, UserKey } from '../types';

export const PROVINCE_ACCESS_FEE = 10000;
export const PROVINCE_SAVINGS_LIMIT = 2000000;

export const ARGENTINA_PROVINCES_CAPITALS: Record<string, string> = {
  "Buenos Aires": "La Plata",
  "Catamarca": "San Fernando del Valle de Catamarca",
  "Chaco": "Resistencia",
  "Chubut": "Rawson",
  "Córdoba": "Córdoba",
  "Corrientes": "Corrientes",
  "Entre Ríos": "Paraná",
  "Formosa": "Formosa",
  "Jujuy": "San Salvador de Jujuy",
  "La Pampa": "Santa Rosa",
  "La Rioja": "La Rioja",
  "Mendoza": "Mendoza",
  "Misiones": "Posadas",
  "Neuquén": "Neuquén",
  "Río Negro": "Viedma",
  "Salta": "Salta",
  "San Juan": "San Juan",
  "San Luis": "San Luis",
  "Santa Cruz": "Río Gallegos",
  "Santa Fe": "Santa Fe de la Vera Cruz",
  "Santiago del Estero": "Santiago del Estero",
  "Tierra del Fuego": "Ushuaia",
  "Tucumán": "San Miguel de Tucumán"
};

export const ARGENTINA_PROVINCES = Object.keys(ARGENTINA_PROVINCES_CAPITALS).sort();

const generatePicsumUrl = (seed: string, width = 200, height = 200) => 
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

export let MOCK_USER_PROFILE: UserProfile = {
  fullName: "Usuario Demo",
  city: "Córdoba",
  dni: "12345678",
  phone: "+54 9 351 1234567",
  email: "demo@listagolden.com",
  accumulatedSavings: 12500,
  subscribedProvinces: ["Córdoba", "Misiones"],
  profilePictureUrl: generatePicsumUrl('default_avatar_v5', 100, 100),
};

export const MOCK_ESTABLISHMENTS: Establishment[] = [
  {
    id: 'resto1',
    name: "El Bodegón Dorado",
    logoUrl: generatePicsumUrl('bodegon_dorado_v3', 300, 200),
    imageUrls: [
      generatePicsumUrl('bodegon_dish1_v3', 600, 400),
      generatePicsumUrl('bodegon_interior_v3', 600, 400)
    ],
    city: "Córdoba",
    province: "Córdoba",
    availableHours: "12:00 - 15:00, 20:00 - 00:00",
    promotionType: PromotionType.PERCENT_OFF,
    promoValue: "20%",
    category: EstablishmentCategory.GASTRONOMY,
    description: "Auténtica cocina argentina con un toque gourmet.",
    history: "Con más de 30 años de tradición, El Bodegón Dorado es un emblema de la gastronomía cordobesa.",
    detailedServices: ["Salón principal", "Patio cervecero", "Cava de vinos"],
    benefitInclusions: "20% de descuento en todos los platos de la carta.",
    weeklyHours: {
      "Lunes": "12:00 - 15:00",
      "Martes": "12:00 - 15:00, 20:00 - 00:00",
      "Miércoles": "12:00 - 15:00, 20:00 - 00:00",
      "Jueves": "12:00 - 15:00, 20:00 - 00:00",
      "Viernes": "12:00 - 15:00, 20:00 - 01:00",
      "Sábado": "20:00 - 01:00",
      "Domingo": "12:00 - 16:00"
    },
    offersDelivery: true,
  },
  {
    id: 'hotel1',
    name: "Gran Hotel Lujo",
    logoUrl: generatePicsumUrl('gran_hotel_lujo_v3', 300, 200),
    imageUrls: [
      generatePicsumUrl('gran_hotel_room_v3', 600, 400),
      generatePicsumUrl('gran_hotel_facade_v3', 600, 400)
    ],
    city: "Ciudad de Buenos Aires",
    province: "Buenos Aires",
    availableHours: "Check-in: 15:00, Check-out: 12:00",
    promotionType: PromotionType.TWO_FOR_ONE,
    promoValue: "2x1",
    category: EstablishmentCategory.HOTEL,
    stars: 5,
    type: "Lujo",
    locationOnMap: "Recoleta",
    description: "Experimenta el lujo y confort en el corazón de Buenos Aires.",
    history: "Un ícono de la hotelería porteña desde su inauguración en 1920.",
    detailedServices: ["Spa y centro de bienestar", "Piscina climatizada", "Restaurante de alta cocina"],
    benefitInclusions: "Paga una noche y quédate dos (2x1 en noches).",
    weeklyHours: { "TodosLosDias": "Recepción 24hs" },
    websiteUrl: "https://simulated.granhotellujo.com/reservas",
    offersDelivery: false,
  },
  {
    id: 'entre1',
    name: "Cine Estelar 3D",
    logoUrl: generatePicsumUrl('cine_estelar_v3', 300, 200),
    imageUrls: [
      generatePicsumUrl('cine_estelar_screen_v3', 600, 400),
      generatePicsumUrl('cine_estelar_seats_v3', 600, 400)
    ],
    city: "Córdoba",
    province: "Córdoba",
    availableHours: "Funciones desde 14:00 a 23:00",
    promotionType: PromotionType.TWO_FOR_ONE,
    promoValue: "2x1",
    category: EstablishmentCategory.ENTERTAINMENT,
    description: "Disfruta de los últimos estrenos con la mejor tecnología 3D.",
    history: "Primer complejo en la ciudad en ofrecer proyecciones 3D digitales desde 2009.",
    detailedServices: ["Salas 2D y 3D", "Sonido Dolby Atmos", "Candy bar completo"],
    benefitInclusions: "2x1 en entradas para todas las funciones 2D y 3D de Lunes a Jueves.",
    weeklyHours: {
      "Lunes": "14:00 - 23:00",
      "Martes": "14:00 - 23:00",
      "Miércoles": "14:00 - 23:00",
      "Jueves": "14:00 - 23:00",
      "Viernes": "14:00 - 01:00",
      "Sábado": "13:00 - 01:00",
      "Domingo": "13:00 - 23:00"
    },
    websiteUrl: "https://simulated.cineestelar.com/cartelera",
    offersDelivery: false,
  },
  {
    id: 'misiones-resto1',
    name: "Holy restaurante",
    logoUrl: generatePicsumUrl('holy_resto_misiones_v3', 300, 200),
    imageUrls: [
      generatePicsumUrl('holy_dish1_v3', 600, 400),
      generatePicsumUrl('holy_interior_v3', 600, 400),
      generatePicsumUrl('holy_facade_v3', 600, 400)
    ],
    city: "Posadas",
    province: "Misiones",
    availableHours: "18:00 - 00:00",
    promotionType: PromotionType.PERCENT_OFF,
    promoValue: "15%",
    category: EstablishmentCategory.GASTRONOMY,
    description: "Cocina de autor con ingredientes regionales frescos en un ambiente moderno y acogedor.",
    history: "Fundado en 2015, Holy Restaurante se convirtió en un referente de la nueva cocina misionera.",
    detailedServices: ["Salón principal con aire acondicionado", "Terraza al aire libre", "Wi-Fi gratuito"],
    benefitInclusions: "15% de descuento en todos los platos principales y postres de la carta.",
    weeklyHours: {
      "Lunes": "Cerrado",
      "Martes": "18:00 - 00:00",
      "Miércoles": "18:00 - 00:00",
      "Jueves": "18:00 - 00:00",
      "Viernes": "18:00 - 01:00",
      "Sábado": "12:00 - 16:00, 18:00 - 01:00",
      "Domingo": "12:00 - 16:00"
    },
    websiteUrl: "https://simulated.holyrestaurante.com/benefit-lista-golden",
    offersDelivery: true,
  }
];

export let MOCK_USER_KEYS: UserKey[] = [
  {
    id: 'key1',
    establishmentId: 'resto1',
    establishmentName: "El Bodegón Dorado",
    establishmentCategory: EstablishmentCategory.GASTRONOMY,
    promotionType: PromotionType.PERCENT_OFF,
    promoValueDisplay: "20% OFF",
    qrCodes: [`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LISTAGOLDEN-key1-resto1-QR1-${Date.now()}`],
    status: UserKeyStatus.UNLOCKED,
    dateActivated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    savedAmount: 0,
  },
  {
    id: 'key2',
    establishmentId: 'hotel1',
    establishmentName: "Gran Hotel Lujo",
    establishmentCategory: EstablishmentCategory.HOTEL,
    promotionType: PromotionType.TWO_FOR_ONE,
    promoValueDisplay: "2x1 Noches",
    qrCodes: [
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LISTAGOLDEN-key2-hotel1-QR1-${Date.now()}`,
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LISTAGOLDEN-key2-hotel1-QR2-${Date.now()}`
    ],
    status: UserKeyStatus.UNLOCKED,
    dateActivated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    savedAmount: 0,
  },
  {
    id: 'key3',
    establishmentId: 'entre1',
    establishmentName: "Cine Estelar 3D",
    establishmentCategory: EstablishmentCategory.ENTERTAINMENT,
    promotionType: PromotionType.TWO_FOR_ONE,
    promoValueDisplay: "2x1 Entradas",
    qrCodes: [
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LISTAGOLDEN-key3-entre1-QR1-${Date.now()}`,
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LISTAGOLDEN-key3-entre1-QR2-${Date.now()}`
    ],
    status: UserKeyStatus.USED,
    dateActivated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dateUsed: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    savedAmount: 850,
  },
];

export { MOCK_USER_PROFILE, MOCK_USER_KEYS }