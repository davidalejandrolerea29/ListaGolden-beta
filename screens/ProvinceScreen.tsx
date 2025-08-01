import React, { useState, useEffect, useCallback } from 'react';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Gift,
  CheckCircle,
  XCircle,
  Clock,
  Unlock, // Importa el icono de "desbloqueado"
  Lock    // Importa el icono de "bloqueado"
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import { Button } from '../components/Button';
import { EstablishmentCard } from '../components/EstablishmentCard';
import { Toast } from '../components/Toast';
// import { useCompanies } from '../hooks/useCompanies'; // Ya no se usa directamente aquí
import { useUserProfile } from '../hooks/useUserProfile';
import { useProvinces } from '../hooks/useProvinces';
import { useCompaniesByProvince } from '../hooks/useCompaniesByProvince';
import { formatCurrency } from '../utils/currency';
import api from '../lib/api';

// PROVINCE_ACCESS_FEE parece ser un valor de ejemplo.
// El precio real ahora viene del backend a través de `location.location.price`.
// Puedes quitar esta constante si ya no la usas.
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

  const { getActiveProvinces, activateProvince, refreshUserProfile } = useUserProfile();
  const { getProvinceByName } = useProvinces();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [provincePrice, setProvincePrice] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | 'pending' | null>(null);

  const activeProvinces = getActiveProvinces();
  // `isProvinceGloballyActive` indica si la provincia ya fue pagada y está en la lista de provincias activas del userProfile
  const isProvinceGloballyActive = activeProvinces.includes(provinceName); 
  const province = getProvinceByName(provinceName);
  
  // `establishments` ahora incluirá la propiedad `is_active_for_user` desde el backend
  const { companies: establishments, loading: companiesLoading } = useCompaniesByProvince(province?.id || null);

  useEffect(() => {
    if (!companiesLoading && establishments.length > 0) {
      // Usamos el precio de la primera compañía como referencia, ya que el precio de la provincia 
      // debe ser consistente para todas las ubicaciones en esa provincia.
      const price = establishments[0]?.location?.location?.price ?? 0; 
      setProvincePrice(price);
    }
  }, [companiesLoading, establishments]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleDeepLink = useCallback(async (event: { url: string }) => {
    console.log('Deep link recibido:', event.url);
    const url = new URL(event.url);
    const status = url.searchParams.get('status');

    if (url.protocol === 'listagolden:' && url.hostname === 'payment') {
      if (status === 'success') {
        setPaymentStatus('success');
        showToast('¡Pago Exitoso! Activando provincia...');
        await refreshUserProfile(); 
        // Si tu hook `useCompaniesByProvince` no se refresca automáticamente después de `refreshUserProfile`,
        // podrías necesitar añadir un mecanismo para volver a cargar las compañías aquí,
        // para que se refleje el `is_active_for_user` actualizado.
        // Por ejemplo, si tu hook expone un método `refetchCompanies()`:
        // refetchCompanies(); 
      } else if (status === 'failure') {
        setPaymentStatus('failure');
        showToast('Pago Fallido. Por favor, intenta de nuevo.');
      } else if (status === 'pending') {
        setPaymentStatus('pending');
        showToast('Pago Pendiente. Esperando confirmación.');
      } else {
        showToast('Pago finalizado (estado desconocido).');
      }
    }
  }, [refreshUserProfile]);

  useEffect(() => {
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const appStateListener = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // En Android, `getInitialURL()` se puede llamar múltiples veces.
        // Solo llamamos si `paymentStatus` no está ya definido para evitar llamadas redundantes
        // si el usuario sale y entra varias veces sin terminar el flujo de Mercado Pago.
        if (paymentStatus === null) {
             const url = await Linking.getInitialURL();
             if (url) {
               handleDeepLink({ url });
             }
        }
      }
    });

    return () => {
      linkingSubscription.remove(); 
      appStateListener.remove();
    };
  }, [handleDeepLink, paymentStatus]);


  const handleActivateProvince = async () => {
    if (!province) {
      showToast('Provincia no encontrada');
      return;
    }

    setLoading(true);
    setPaymentStatus(null); // Limpiar el estado de pago anterior antes de iniciar uno nuevo
    try {
      const response = await api.post('/mercado-pago/create-preference', {
        province_id: province.id,
      });

      const { init_point } = response.data;

      if (!init_point) {
        throw new Error('No se pudo obtener el link de pago.');
      }
      
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(init_point, {
          toolbarColor: colors.brandPrimary, 
          showTitle: false,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          forceCloseOnRedirection: true,
        });
      } else {
        Linking.openURL(init_point);
      }
      
      showToast('Redirigiendo a Mercado Pago para completar el pago...');

    } catch (error) {
      console.error('Error al iniciar el pago con Mercado Pago:', error);
      showToast('Error al iniciar el pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstablishmentPress = (establishment: any) => {
    // Si la provincia está globalmente activa O si esta compañía específica está activa para el usuario (a través de membresía), navega.
    // Si no, muestra un toast indicando que se requiere activación.
    if (isProvinceGloballyActive || establishment.is_active_for_user) {
        navigation.navigate('EstablishmentDetail', { id: establishment.id });
    } else {
        showToast('Activa la provincia para acceder a este beneficio.');
    }
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

        {/* Banner de Estado de Pago (con iconos) */}
        {paymentStatus && (
          <View style={[styles.paymentStatusBanner, 
                        paymentStatus === 'success' && styles.successBanner,
                        paymentStatus === 'failure' && styles.failureBanner,
                        paymentStatus === 'pending' && styles.pendingBanner]}>
            {paymentStatus === 'success' && <CheckCircle size={24} color={colors.white} style={styles.paymentStatusIcon} />}
            {paymentStatus === 'failure' && <XCircle size={24} color={colors.white} style={styles.paymentStatusIcon} />}
            {paymentStatus === 'pending' && <Clock size={24} color={colors.white} style={styles.paymentStatusIcon} />}
            
            <Text style={styles.paymentStatusText}>
              {paymentStatus === 'success' && '¡Pago Exitoso! La provincia ha sido activada.'}
              {paymentStatus === 'failure' && 'Pago Fallido. Por favor, inténtalo de nuevo.'}
              {paymentStatus === 'pending' && 'Pago Pendiente. Esperando confirmación.'}
            </Text>
          </View>
        )}

        {/* Province Status Card */}
       <View style={[globalStyles.card, styles.statusCard]}>
          <View style={styles.statusHeader}>
            <MapPin size={24} color={colors.brandGold} />
            <Text style={styles.statusTitle}>Estado de la Provincia </Text>
          </View>
          
          {isProvinceGloballyActive ? (
            <View style={styles.activeStatus}>
              <Text style={styles.activeText}>✅ Provincia Activa</Text>
              <Text style={styles.activeSubtext}>
                Tienes acceso a todos los beneficios en {provinceName}
              </Text>
            </View>
          ) : (
            <View style={styles.inactiveStatus}>
              <Text style={styles.inactiveText}>🔒 Provincia Inactiva</Text>
              {companiesLoading ? (
                <Text style={styles.inactiveSubtext}>Cargando beneficios disponibles...</Text>
              ) : (
                <>
                  <Text style={styles.inactiveSubtext}>
                    Activa {provinceName} para acceder a {establishments.length} beneficios exclusivos
                  </Text>
                  <Button
                    title={loading ? 'Activando...' : `Activar por ${formatCurrency(provincePrice)}`}
                    onPress={handleActivateProvince}
                    disabled={loading || establishments.length === 0}
                    style={styles.activateButton}
                  />
                </>
              )}
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
        {/* Siempre mostrar la lista completa, pero con indicadores visuales */}
        <View style={styles.establishmentsList}>
            <Text style={globalStyles.subtitle}>Beneficios en {provinceName}</Text>
            {companiesLoading ? (
                <Text>Cargando establecimientos...</Text>
            ) : establishments.length === 0 ? (
                <Text>No hay establecimientos disponibles.</Text>
            ) : (
                establishments.map(establishment => (
                  <View key={establishment.id} style={styles.establishmentItemWrapper}>
                    <EstablishmentCard
                      establishment={establishment}
                      onPress={() => handleEstablishmentPress(establishment)}
                    />
                    {/* Indicador de Membresía: Bloqueado si la provincia no está activa y la compañía tampoco */}
                    {!isProvinceGloballyActive && !establishment.is_active_for_user && (
                      <View style={styles.membershipOverlay}>
                        <Lock size={20} color={colors.white} />
                        <Text style={styles.membershipOverlayText}>Requiere activación de provincia</Text>
                      </View>
                    )}
                    {/* Indicador de Membresía: Activado si la compañía está activa pero la provincia general no (escenario menos común pero posible) */}
                    {!isProvinceGloballyActive && establishment.is_active_for_user && (
                      <View style={styles.membershipActiveOverlay}>
                        <Unlock size={20} color={colors.white} />
                        <Text style={styles.membershipOverlayText}>Ya activado</Text>
                      </View>
                    )}
                  </View>
                ))
            )}
        </View>
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
    textAlign: 'center',
  },
  inactiveSubtext: {
    fontSize: 14,
    color: colors.brandLight,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
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
  establishmentItemWrapper: {
    position: 'relative',
    marginBottom: 16, // Espacio entre las tarjetas
  },
  membershipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', // Capa oscura semi-transparente
    borderRadius: 12, // Asegura que coincida con el borde de la tarjeta
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Asegura que esté por encima de la tarjeta
    flexDirection: 'row', // Para alinear el icono y el texto
    padding: 10,
  },
  membershipActiveOverlay: {
    position: 'absolute',
    top: 10, 
    right: 10,
    backgroundColor: colors.success, // Un color que indique éxito
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2, 
  },
  membershipOverlayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 5,
    textAlign: 'center',
  },
  previewList: { // Estos estilos ya no se usarían si siempre se muestra la lista completa
    padding: 16,
    paddingTop: 8,
  },
  previewText: { // Estos estilos ya no se usarían
    fontSize: 14,
    color: colors.brandGray,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  previewCard: { // Estos estilos ya no se usarían
    position: 'relative',
    marginBottom: 16,
  },
  previewOverlay: { // Estos estilos ya no se usarían
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
  },
  previewOverlayText: { // Estos estilos ya no se usarían
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.brandGold,
    textAlign: 'center',
  },
  moreEstablishments: { // Estos estilos ya no se usarían si siempre se muestra la lista completa
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brandGold,
    borderStyle: 'dashed',
  },
  moreText: { // Estos estilos ya no se usarían
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandGold,
  },
  paymentStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16, // Agregado para que no ocupe todo el ancho
    marginBottom: 15,
  },
  paymentStatusIcon: {
    marginRight: 8,
  },
  paymentStatusText: {
    color: colors.white,
    textAlign: 'center',
    flexShrink: 1,
  },
  successBanner: {
    backgroundColor: colors.success,
  },
  failureBanner: {
    backgroundColor: colors.error,
  },
  pendingBanner: {
    backgroundColor: colors.warning,
  },
});