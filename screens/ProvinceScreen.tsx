import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Building2, Gift } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import { Button } from '../components/Button';
import { EstablishmentCard } from '../components/EstablishmentCard';
import { Toast } from '../components/Toast';
import { useCompanies } from '../hooks/useCompanies';
import { useUserProfile } from '../hooks/useUserProfile';
import { useProvinces } from '../hooks/useProvinces';
import { formatCurrency } from '../utils/currency';

const PROVINCE_ACCESS_FEE = 10000;

interface ProvinceScreenProps {
  route: {
    params: {
      name: string;
    };
  };
  navigation: any;
}

export default function ProvinceScreen({ route, navigation }: ProvinceScreenProps) {
  const { name: provinceName } = route.params;
  
  const { getCompaniesByProvince } = useCompanies();
  const { getActiveProvinces, activateProvince } = useUserProfile();
  const { getProvinceByName } = useProvinces();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const activeProvinces = getActiveProvinces();
  const isActive = activeProvinces.includes(provinceName);
  const establishments = getCompaniesByProvince(provinceName);
  const province = getProvinceByName(provinceName);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleActivateProvince = async () => {
    if (!province) {
      showToast('Provincia no encontrada');
      return;
    }

    setLoading(true);
    try {
      await activateProvince(province.id);
      showToast(`¡${provinceName} activada con éxito!`);
    } catch (error) {
      showToast('Error al activar la provincia');
    } finally {
      setLoading(false);
    }
  };

  const handleEstablishmentPress = (establishment: any) => {
    navigation.navigate('EstablishmentDetail', { id: establishment.id });
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.brandLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{provinceName}</Text>
        </View>

        {/* Province Status Card */}
        <View style={[globalStyles.card, styles.statusCard]}>
          <View style={styles.statusHeader}>
            <MapPin size={24} color={colors.brandGold} />
            <Text style={styles.statusTitle}>Estado de la Provincia</Text>
          </View>
          
          {isActive ? (
            <View style={styles.activeStatus}>
              <Text style={styles.activeText}>✅ Provincia Activa</Text>
              <Text style={styles.activeSubtext}>
                Tienes acceso a todos los beneficios en {provinceName}
              </Text>
            </View>
          ) : (
            <View style={styles.inactiveStatus}>
              <Text style={styles.inactiveText}>🔒 Provincia Inactiva</Text>
              <Text style={styles.inactiveSubtext}>
                Activa {provinceName} para acceder a {establishments.length} beneficios exclusivos
              </Text>
              <Text style={styles.priceText}>
                Costo de activación: {formatCurrency(PROVINCE_ACCESS_FEE)}
              </Text>
              <Button
                title={loading ? 'Activando...' : `Activar por ${formatCurrency(PROVINCE_ACCESS_FEE)}`}
                onPress={handleActivateProvince}
                disabled={loading}
                style={styles.activateButton}
              />
            </View>
          )}
        </View>

        {/* Statistics Card */}
        <View style={[globalStyles.card, styles.statsCard]}>
          <Text style={styles.statsTitle}>Beneficios Disponibles</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Building2 size={20} color={colors.brandGold} />
              <Text style={styles.statNumber}>{establishments.length}</Text>
              <Text style={styles.statLabel}>Establecimientos</Text>
            </View>
            <View style={styles.statItem}>
              <Gift size={20} color={colors.brandGold} />
              <Text style={styles.statNumber}>
                {establishments.reduce((total, est) => total + (est.services?.length || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>
          </View>
        </View>

        {/* Establishments List */}
        {isActive ? (
          <View style={styles.establishmentsList}>
            <Text style={globalStyles.subtitle}>Tus Beneficios en {provinceName}</Text>
            {establishments.map(establishment => (
              <EstablishmentCard
                key={establishment.id}
                establishment={establishment}
                onPress={handleEstablishmentPress}
              />
            ))}
          </View>
        ) : (
          <View style={styles.previewList}>
            <Text style={globalStyles.subtitle}>Vista Previa de Beneficios</Text>
            <Text style={styles.previewText}>
              Estos son algunos de los beneficios que tendrás disponibles al activar {provinceName}:
            </Text>
            {establishments.slice(0, 2).map(establishment => (
              <View key={establishment.id} style={styles.previewCard}>
                <EstablishmentCard
                  establishment={establishment}
                  onPress={() => showToast('Activa la provincia para acceder a este beneficio')}
                />
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewOverlayText}>🔒 Requiere Activación</Text>
                </View>
              </View>
            ))}
            
            {establishments.length > 2 && (
              <View style={styles.moreEstablishments}>
                <Text style={styles.moreText}>
                  +{establishments.length - 2} beneficios más disponibles
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.brandDarkSecondary,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandLight,
    flex: 1,
  },
  statusCard: {
    margin: 16,
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginLeft: 8,
  },
  activeStatus: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.brandDark,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 8,
  },
  activeSubtext: {
    fontSize: 14,
    color: colors.brandLight,
    textAlign: 'center',
  },
  inactiveStatus: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.brandDark,
    borderRadius: 8,
  },
  inactiveText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.warning,
    marginBottom: 8,
  },
  inactiveSubtext: {
    fontSize: 14,
    color: colors.brandLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 16,
  },
  activateButton: {
    width: '100%',
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandLight,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.brandGray,
    textAlign: 'center',
  },
  establishmentsList: {
    padding: 16,
    paddingTop: 8,
  },
  previewList: {
    padding: 16,
    paddingTop: 8,
  },
  previewText: {
    fontSize: 14,
    color: colors.brandGray,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewCard: {
    position: 'relative',
    marginBottom: 16,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  previewOverlayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandGold,
  },
  moreEstablishments: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brandGold,
    borderStyle: 'dashed',
  },
  moreText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandGold,
  },
});