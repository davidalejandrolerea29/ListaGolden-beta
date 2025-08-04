// src/components/UserKeyCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { KeyRound, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Gift } from 'lucide-react-native';
import { UserKey, UserKeyStatus } from '../types';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/currency';
import { Button } from './Button'; // Asumiendo que este es tu componente Button
import { Accordion } from './Accordion'; // Asumiendo que este es tu componente Accordion

// Interfaces (mantener las mismas que ya tenías, solo por claridad)
interface Promotion {
  id: number;
  description: string;
  name?: string;
  discount?: string;
}

interface Service {
  id: number;
  description: string;
  name?: string;
  promotions: Promotion[];
}

interface CompanyInfo {
  id: number;
  name: string;
  services: Service[];
}

interface LocationInfo {
    id: number;
    description: string;
    price: string;
}

interface LocationsCompanyPivotInfo {
    id: number;
    lat: string;
    long: string;
}

export interface ExtendedPromotion extends Promotion {
  serviceName: string;
  serviceId: number;
  isUsed?: boolean; // Asegúrate de que esta propiedad esté aquí, si la usas
}

// Interfaz para KeysUsedCompany, importada del screen, si es necesario
// Esto es solo para claridad, si no la usas directamente aquí, puedes omitirla.
interface KeysUsedCompany {
  id: number;
  company_id: number;
  membership_id: number;
  promotion_id: number;
  is_used: boolean;
  date_of_use: string | null;
  promotion: Promotion | null;
}

// Aquí definimos la interfaz Membership tal como la recibimos del backend
// Esto es importante para el tipado correcto de fullMembershipData
interface Membership {
  membership_id: number;
  total: string;
  total_keys: number;
  remaining_keys: number;
  is_active: boolean; // Cambiado a boolean
  location_info: LocationInfo;
  company_info: CompanyInfo;
  locations_company_pivot_info: LocationsCompanyPivotInfo;
  keys_used_companies: KeysUsedCompany[]; // Array de promociones usadas
}


interface UserKeyCardProps {
  userKey: UserKey;
  onUseKey?: (membership: Membership) => void; // Tipado correcto con Membership
  companyInfo?: CompanyInfo;
  locationInfo?: LocationInfo;
  locationsCompanyPivotInfo?: LocationsCompanyPivotInfo;
  fullMembershipData: Membership; // Tipado correcto con Membership
}

export const UserKeyCard: React.FC<UserKeyCardProps> = ({
  userKey,
  onUseKey,
  companyInfo,
  locationInfo,
  locationsCompanyPivotInfo,
  fullMembershipData
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return 'Fecha inválida';
    }
  };

  const totalPromos = fullMembershipData.total_keys;
  const remainingPromos = fullMembershipData.remaining_keys;
  const usedPromos = totalPromos - remainingPromos;
  const progress = totalPromos > 0 ? (usedPromos / totalPromos) : 0;

  // Renderiza el estado de la membresía (usada/inactiva) o el botón de acción
  const renderActionOrStatus = () => {
    // Si no está activa o no quedan llaves, muestra el estado
    if (!fullMembershipData.is_active) { // No activa
        return (
            <View style={[styles.statusContainer, styles.expiredStatus]}>
                <AlertTriangle size={20} color={colors.error} />
                <Text style={[styles.statusText, styles.expiredText]}>Membresía inactiva</Text>
            </View>
        );
    } else if (fullMembershipData.remaining_keys === 0) { // Todas las llaves usadas
        return (
            <View style={[styles.statusContainer, styles.usedStatus]}>
                <CheckCircle2 size={20} color={colors.success} />
                <Text style={[styles.statusText, styles.usedText]}>Todas las llaves usadas ({totalPromos}/{totalPromos})</Text>
            </View>
        );
    } else if (onUseKey) { // Si está activa y con llaves restantes, muestra el botón
      return (
        <Button
          title="Usar Beneficio"
          onPress={() => onUseKey(fullMembershipData)}
          style={styles.useButton}
        />
      );
    }
    return null; // En cualquier otro caso, no renderiza nada
  };

  return (
    <View style={[globalStyles.card, styles.card]}>
      <View style={styles.cardTop}>
        <View style={styles.keyIconContainer}>
          <KeyRound size={40} color={colors.brandGold} />
        </View>
        <View style={styles.keyInfo}>
          <Text style={styles.establishmentName}>{userKey.establishmentName}</Text>
          <Text style={styles.categoryPromo}>
            {userKey.establishmentCategory}
          </Text>
          <Text style={styles.date}>
            Activado: {formatDate(userKey.dateActivated)}
          </Text>
          {userKey.savedAmount > 0 && (
            <Text style={styles.savings}>
              Ahorro total: {formatCurrency(userKey.savedAmount)}
            </Text>
          )}
        </View>
      </View>

      {/* --- Contador de Llaves / Barra de Progreso --- */}
      {totalPromos > 0 && (
        <View style={styles.promoCounterContainer}>
          <Text style={styles.promoCounterText}>
            Beneficios disponibles: {remainingPromos} de {totalPromos}
          </Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      )}
      {/* ------------------------------------------- */}

      {/* Aquí renderizamos el botón de acción o el estado */}
      <View style={styles.actionsContainer}> {/* Nuevo contenedor para flexibilidad */}
        {renderActionOrStatus()}
      </View>

      {(companyInfo || locationInfo || locationsCompanyPivotInfo) && (
        <Accordion title="Ver Detalles del Beneficio">
          {companyInfo && (
            <View style={styles.detailSection}>
              {companyInfo.services && companyInfo.services.length > 0 ? (
                <View style={styles.subDetailSection}>
                  <Text style={styles.subSectionTitle}>Servicios y Promociones:</Text>
                  {companyInfo.services.map((service) => (
                    <View key={service.id} style={styles.serviceItem}>
                      <Text style={styles.serviceText}>  • **{service.name || service.description}**</Text>
                      {service.promotions && service.promotions.length > 0 && (
                        <View style={styles.promotionContainer}>
                          {service.promotions.map((promotion) => (
                            <View key={promotion.id} style={styles.promoRow}>
                                <Gift size={14} color={colors.brandGold} style={styles.promoIcon} />
                                <Text style={styles.promotionText}>
                                    {promotion.name || promotion.description} {promotion.discount ? `(${promotion.discount})` : ''}
                                </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.detailText}>No hay servicios disponibles.</Text>
              )}
            </View>
          )}
        </Accordion>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: colors.brandDarkSecondary,
    marginBottom: 16, // Espacio entre las tarjetas
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  keyInfo: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 4,
  },
  categoryPromo: {
    fontSize: 14,
    color: colors.brandGray,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.white,
    marginBottom: 2,
  },
  savings: {
    fontSize: 12,
    color: colors.success,
  },
  // Contenedor para el botón de acción o el estado de la membresía
  actionsContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center', // Centrar el botón o el estado
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: colors.brandDark, // Fondo para el estado
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  usedStatus: {
    borderColor: colors.success,
  },
  usedText: {
    color: colors.success,
  },
  expiredStatus: {
    borderColor: colors.error,
  },
  expiredText: {
    color: colors.error,
  },
  useButton: {
    width: '100%',
    // Los estilos del botón ya vienen de tu componente Button
  },
  detailSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.brandGray,
    paddingTop: 8,
  },
  sectionTitle: { // Este estilo parece no usarse directamente, se usa subSectionTitle
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  detailText: {
    fontSize: 13,
    color: colors.white,
    marginLeft: 10,
    marginBottom: 2,
  },
  subDetailSection: {
    marginTop: 5,
    marginLeft: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.brandGold,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  serviceItem: {
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 13,
    color: colors.white,
  },
  promotionContainer: {
    marginLeft: 15,
    marginTop: 3,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  promoIcon: {
    marginRight: 5,
  },
  promotionText: {
    fontSize: 11,
    color: colors.white,
    flexShrink: 1,
  },
  promoCounterContainer: {
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  promoCounterText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.brandGray,
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brandGold,
    borderRadius: 5,
  },
});