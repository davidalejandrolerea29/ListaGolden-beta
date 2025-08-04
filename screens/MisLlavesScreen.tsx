import React, { useEffect, useState, useCallback } from 'react';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert, // Importa Alert para mensajes más robustos
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';
import { useCodeScanner } from 'react-native-vision-camera';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { UserKeyCard, ExtendedPromotion } from '../components/UserKeyCard';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';

import { DollarSign, Wallet, QrCode, Gift, CheckCircle, XCircle } from 'lucide-react-native'; // Añade CheckCircle y XCircle para el modal de éxito/error

import api from '../lib/api';
import { UserKey, UserKeyStatus } from '../types';

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

interface KeysUsedCompany {
  id: number;
  company_id: number;
  membership_id: number;
  promotion_id: number;
  is_used: boolean;
  date_of_use: string | null;
  promotion: Promotion | null;
}

interface Membership {
  membership_id: number;
  total: string;
  total_keys: number;
  remaining_keys: number;
  is_active: boolean;
  location_info: LocationInfo;
  company_info: CompanyInfo;
  locations_company_pivot_info: LocationsCompanyPivotInfo;
  keys_used_companies: KeysUsedCompany[];
}

interface ApiResponseData {
  user_id: number;
  user_name: string;
  people_id: number;
  memberships: Membership[];
}

interface MisLlavesScreenProps {
  navigation: any;
}

export default function MisLlavesScreen({ navigation }: MisLlavesScreenProps) {
  const [selectedKey, setSelectedKey] = useState<UserKey | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasPermission, setHasPermission] = useState<'LOADING' | 'authorized' | 'denied'>('LOADING');

  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraType);
  const ScanFrame = useSharedValue({ width: 1, height: 1 });
  const codeHighlight = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const [hasScanned, setHasScanned] = useState(false);
  const [qrDataModalVisible, setQrDataModalVisible] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [rawQrValue, setRawQrValue] = useState<string | null>(null);

  const [apiData, setApiData] = useState<ApiResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [paymentMethodModalVisible, setPaymentMethodModalVisible] = useState(false);
  const [promotionSelectionModalVisible, setPromotionSelectionModalVisible] = useState(false);
  const [currentMembershipToUse, setCurrentMembershipToUse] = useState<Membership | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<ExtendedPromotion | null>(null);

  const [usageSuccessModalVisible, setUsageSuccessModalVisible] = useState(false);
  const [usageErrorModalVisible, setUsageErrorModalVisible] = useState(false);
  const [usageMessage, setUsageMessage] = useState('');


  const USER_ID = 1;

  const fetchUserMemberships = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/user/${USER_ID}/memberships`);
      setApiData(response.data);
    } catch (err: any) {
      console.error('Error fetching user memberships:', err);
      if (err.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.data?.message || 'Algo salió mal'}`);
      } else if (err.request) {
        setError('No se recibió respuesta del servidor. Revisa tu conexión o la URL del backend.');
      } else {
        setError(`Error al configurar la petición: ${err.message}`);
      }
    } finally {
      if (!isRefreshing) setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserMemberships(true);
  }, []);

  useEffect(() => {
    fetchUserMemberships();
  }, []);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes, frame) => {
      console.log('📸 Código detectado:', codes);
      if (hasScanned || codes.length === 0) return;

      ScanFrame.value = frame;

      setHasScanned(true);

      const scannedValue = codes[0]?.value;
      setRawQrValue(scannedValue);

      if (!scannedValue) {
        showToast('QR vacío o no válido.');
        setHasScanned(false);
        return;
      }

      try {
        const data = JSON.parse(scannedValue);

        console.log('--- Datos de QR Escaneado ---');
        console.log('Valor RAW del QR:', scannedValue);
        console.log('Datos JSON parseados del QR:', data);
        console.log('------------------------------');

        if ((data?.id || data?.companyId) && data?.name) {
          const companyIdentifier = data.id || data.companyId; // Prioriza 'id' pero usa 'companyId' si existe

          const combinedQrData = {
            ...data,
            promocionSeleccionada: selectedPromotion ? {
              id: selectedPromotion.id,
              nombre: selectedPromotion.name || selectedPromotion.description,
            } : null, // Cambiado a null si no hay promo seleccionada
            membresiaID: currentMembershipToUse?.membership_id || null, // Cambiado a null si no hay membresía
            // Asegúrate de que el company_id se pasa correctamente desde el QR
            company_id_from_qr: companyIdentifier, // Añade el ID de la compañía del QR
          };
          setQrData(combinedQrData);
          setQrDataModalVisible(true);

          handleCloseScan();
        } else {
          showToast('QR inválido o incompleto.');
          setHasScanned(false);
        }
      } catch (e) {
        console.log('--- Datos de QR Escaneado (No JSON) ---');
        console.log('Valor RAW del QR:', scannedValue);
        console.log('Error al parsear JSON:', e);
        console.log('------------------------------');

        if (typeof scannedValue === 'string' && scannedValue.startsWith('empresa-')) {
          const combinedQrData = {
            name: scannedValue,
            promocionSeleccionada: selectedPromotion ? {
              id: selectedPromotion.id,
              nombre: selectedPromotion.name || selectedPromotion.description,
            } : null,
            membresiaID: currentMembershipToUse?.membership_id || null,
            // Aquí no tenemos un company_id numérico directo del QR si es solo "empresa-..."
            // Puedes decidir cómo manejar esto. Por ahora, lo dejamos como null.
            company_id_from_qr: null,
          };
          setQrData(combinedQrData);
          setQrDataModalVisible(true);
          handleCloseScan();
        } else {
          showToast('QR no válido. Intenta nuevamente.');
        }
        setHasScanned(false);
      }
    },
  });

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const status = await request(PERMISSIONS.ANDROID.CAMERA);
        if (status === RESULTS.GRANTED) {
          setHasPermission('authorized');
        } else {
          setHasPermission('denied');
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission('denied');
      }
    } else {
      const status = await Camera.requestCameraPermission();
      if (status === 'authorized') {
        setHasPermission('authorized');
      } else {
        setHasPermission('denied');
      }
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleOpenPromotionSelectionModal = (membership: Membership) => {
    setCurrentMembershipToUse(membership);
    setPromotionSelectionModalVisible(true);
    setSelectedKey(mapMembershipToUserKey(membership));
  };

  const handleSelectPromotion = (promotion: ExtendedPromotion) => {
    setSelectedPromotion(promotion);
    setPromotionSelectionModalVisible(false);
    setPaymentMethodModalVisible(true);
  };

  const handleProceedToScan = async (paymentMethod: 'efectivo' | 'mercado_pago') => {
    if (!selectedPromotion || !currentMembershipToUse) {
      showToast('Error: No se ha seleccionado una promoción o membresía.');
      return;
    }
    console.log(`Usando promoción: ${selectedPromotion.name || selectedPromotion.description} con método: ${paymentMethod}`);

    setPaymentMethodModalVisible(false);
    await requestCameraPermission();
    setQrModalVisible(true);
  };

  const handleCloseScan = () => {
    setQrModalVisible(false);
    // IMPORTANTE: NO RESETEAR selectedPromotion, currentMembershipToUse, qrData aquí.
    // Necesitamos que estos datos persistan para el modal de confirmación y la llamada a la API.
    setHasScanned(false);
    setRawQrValue(null);
  };

  const resetTransactionStates = () => {
    setSelectedKey(null);
    setSelectedPromotion(null);
    setCurrentMembershipToUse(null);
    setQrData(null);
    setRawQrValue(null);
    setHasScanned(false);
  };

  // NUEVA FUNCIÓN PARA REALIZAR LA LLAMADA A LA API DE USO DE PROMOCIÓN
  const handleUseBenefit = async () => {
    if (!currentMembershipToUse || !selectedPromotion || !qrData || !qrData.company_id_from_qr) {
      showToast('Error: Faltan datos para confirmar el uso del beneficio.');
      setQrDataModalVisible(false); // Cierra el modal de confirmación
      resetTransactionStates();
      return;
    }

    const payload = {
      membership_id: currentMembershipToUse.membership_id,
      company_id: qrData.company_id_from_qr,
      promotion_id: selectedPromotion.id,
    };

    console.log('Payload para usar beneficio:', payload);

    setQrDataModalVisible(false); // Cierra el modal de confirmación inmediatamente
    setLoading(true); // Muestra un indicador de carga

    try {
      const response = await api.post('/memberships/use-promotion', payload);
      console.log('Respuesta de uso de beneficio:', response.data);
      setUsageMessage(response.data.message || 'Beneficio usado correctamente.');
      setUsageSuccessModalVisible(true);
      fetchUserMemberships(true); // Recarga los datos de las membresías
    } catch (err: any) {
      console.error('Error al usar el beneficio:', err);
      let errorMessage = 'Ocurrió un error inesperado al usar el beneficio.';
      if (err.response) {
        console.error('Error response data:', err.response.data);
        if (err.response.status === 404) {
          errorMessage = 'Beneficio no encontrado para esta membresía, compañía y promoción.';
        } else if (err.response.status === 409) {
          errorMessage = 'Este beneficio ya ha sido usado.';
        } else if (err.response.status === 400) {
            errorMessage = err.response.data.message || 'No hay llaves disponibles para esta membresía.';
        } else {
          errorMessage = err.response.data.message || `Error del servidor: ${err.response.status}`;
        }
      } else if (err.request) {
        errorMessage = 'No se recibió respuesta del servidor. Revisa tu conexión.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      setUsageMessage(errorMessage);
      setUsageErrorModalVisible(true);
    } finally {
      setLoading(false);
      resetTransactionStates(); // Reinicia todos los estados de transacción
    }
  };

  const mapMembershipToUserKey = (membership: Membership): UserKey => {
    const defaultDate = new Date().toISOString();
    const isActive = membership.is_active;

    let promoValueDisplay = 'Beneficio General';
    let savedAmount = parseFloat(membership.total) || 0;

    if (membership.company_info?.services && membership.company_info.services.length > 0) {
      const allPromotionsDescriptions: string[] = [];
      membership.company_info.services.forEach(service => {
        service.promotions.forEach(promo => {
          allPromotionsDescriptions.push(promo.name || promo.description);
        });
      });
      promoValueDisplay = allPromotionsDescriptions.length > 0
        ? allPromotionsDescriptions.join(', ')
        : 'Múltiples beneficios';
    }

    const status = !isActive || membership.remaining_keys === 0 ? UserKeyStatus.EXPIRED : UserKeyStatus.UNLOCKED;

    return {
      id: membership.membership_id.toString(),
      establishmentName: membership.company_info?.name || 'Compañía Desconocida',
      establishmentCategory: membership.location_info?.description || 'Ubicación Desconocida',
      promoValueDisplay: promoValueDisplay,
      dateActivated: defaultDate,
      dateUsed: status === UserKeyStatus.EXPIRED ? defaultDate : undefined,
      savedAmount: savedAmount,
      status: status,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, styles.container]}>
          <ActivityIndicator size="large" color={colors.brandGold} />
          <Text style={[globalStyles.text, globalStyles.textGray, { marginTop: 10 }]}>Cargando llaves...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, styles.container]}>
          <Text style={[globalStyles.text, styles.errorText]}>Error al cargar las llaves:</Text>
          <Text style={[globalStyles.text, styles.errorText, { textAlign: 'center' }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUserMemberships}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const userKeysAndMemberships = apiData ? apiData.memberships.map((membership) => ({
    userKey: mapMembershipToUserKey(membership),
    fullMembershipData: membership,
  })) : [];

  if (userKeysAndMemberships.length === 0) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, styles.container]}>
          <Text style={[globalStyles.text, globalStyles.textGray]}>
            Aún no tienes llaves. ¡Explora y desbloquea beneficios!
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getPromotionsFromMembership = (membership: Membership): ExtendedPromotion[] => {
    const promotions: ExtendedPromotion[] = [];
    if (membership.company_info?.services) {
      membership.company_info.services.forEach(service => {
        service.promotions.forEach(promo => {
          const isUsed = membership.keys_used_companies.some(
            (keyUsed) => keyUsed.promotion_id === promo.id && keyUsed.is_used === true
          );

          promotions.push({
            ...promo,
            serviceName: service.name || service.description,
            serviceId: service.id,
            isUsed: isUsed,
          });
        });
      });
    }
    return promotions;
  };

  const promotionsForCurrentMembership = currentMembershipToUse
    ? getPromotionsFromMembership(currentMembershipToUse)
    : [];

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brandGold}
            colors={[colors.brandGold]}
            progressBackgroundColor={colors.brandDarkSecondary}
          />
        }
      >
        <Text style={globalStyles.title}>Mis Llaves Golden</Text>

        {userKeysAndMemberships.map(({ userKey, fullMembershipData }) => (
          <UserKeyCard
            key={userKey.id}
            userKey={userKey}
            onUseKey={handleOpenPromotionSelectionModal}
            companyInfo={fullMembershipData.company_info}
            locationInfo={fullMembershipData.location_info}
            locationsCompanyPivotInfo={fullMembershipData.locations_company_pivot_info}
            fullMembershipData={fullMembershipData}
          />
        ))}

      </ScrollView>

      {/* MODAL: SELECCIÓN DE PROMOCIÓN */}
      <Modal
        visible={promotionSelectionModalVisible}
        onClose={() => setPromotionSelectionModalVisible(false)}
        title="Elegí un Beneficio"
      >
        <ScrollView style={styles.promotionSelectionContent}>
          {promotionsForCurrentMembership.length > 0 ? (
            promotionsForCurrentMembership.map((promo, index) => (
              <TouchableOpacity
                key={promo.id}
                style={[
                    styles.promotionButton,
                    promo.isUsed && styles.promotionButtonUsed
                ]}
                onPress={() => !promo.isUsed && handleSelectPromotion(promo)}
                disabled={promo.isUsed}
              >
                <Gift size={20} color={promo.isUsed ? colors.brandGray : colors.brandDark} style={styles.buttonIcon} />
                <View style={styles.promotionButtonTextContainer}>
                    <Text style={[
                        styles.promotionButtonText,
                        promo.isUsed && styles.promotionButtonTextUsed
                    ]}>
                        {promo.name || promo.description}
                    </Text>
                    <Text style={[
                        styles.promotionServiceText,
                        promo.isUsed && styles.promotionButtonTextUsed
                    ]}>
                        ({promo.serviceName}) {promo.isUsed && '- Usada'}
                    </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noPromosText}>No hay promociones disponibles para esta llave.</Text>
          )}
          <TouchableOpacity
            style={[styles.modalCancelButton, { marginTop: 20 }]}
            onPress={() => setPromotionSelectionModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* MODAL DE SELECCIÓN DE MÉTODO DE PAGO */}
      <Modal
        visible={paymentMethodModalVisible}
        onClose={() => setPaymentMethodModalVisible(false)}
        title="¿Cómo querés pagar?"
      >
        <View style={styles.paymentMethodModalContent}>
          {selectedPromotion && (
            <Text style={styles.selectedPromotionText}>
                Beneficio a usar: {selectedPromotion.name || selectedPromotion.description}
            </Text>
          )}
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => handleProceedToScan('efectivo')}
          >
            <DollarSign size={24} color={colors.brandDark} style={styles.buttonIcon} />
            <Text style={styles.paymentButtonText}>Efectivo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentButton, { marginTop: 15 }]}
            onPress={() => handleProceedToScan('mercado_pago')}
          >
            <Wallet size={24} color={colors.brandDark} style={styles.buttonIcon} />
            <Text style={styles.paymentButtonText}>Mercado Pago</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalCancelButton, { marginTop: 20 }]}
            onPress={() => setPaymentMethodModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL DE ESCANEO DE QR EXISTENTE */}
      <Modal
        visible={qrModalVisible}
        onClose={handleCloseScan}
        title="Escanear QR del Comercio"
      >
        <View style={styles.qrModalContent}>
          {hasPermission === 'LOADING' ? (
            <ActivityIndicator size="large" color={colors.brandGold} />
          ) : hasPermission === 'authorized' && device ? (
            <>
              <Text style={styles.cameraText}>Cámara lista: ✅</Text>
              <View style={styles.cameraContainer}>
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={qrModalVisible && hasPermission === 'authorized' && !hasScanned}
                  codeScanner={codeScanner}
                  torch="off"
                />
              </View>
            </>
          ) : (
            <Text style={styles.cameraText}>No se pudo acceder a la cámara. Revisa los permisos.</Text>
          )}
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={handleCloseScan}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL DE DATOS DE QR (CONFIRMACIÓN) */}
      <Modal
        visible={qrDataModalVisible}
        onClose={() => {
          setQrDataModalVisible(false);
          resetTransactionStates(); // Llama a la función de reseteo
        }}
        title="Comercio Detectado"
      >
        <View style={styles.qrDataModalContent}>
          <Text style={styles.qrDataTitle}>Detalles de la Transacción:</Text>

          {/* Muestra el nombre del comercio */}
          {qrData?.name && (
            <Text style={styles.qrDataText}>
              <Text style={styles.qrDataLabel}>Comercio:</Text> {qrData.name}
            </Text>
          )}

          {/* Muestra el ID del Comercio (si existe en qrData) */}
          {qrData?.company_id_from_qr && (
            <Text style={styles.qrDataText}>
              <Text style={styles.qrDataLabel}>ID Comercio Escaneado:</Text> {qrData.company_id_from_qr}
            </Text>
          )}

          {/* Muestra el beneficio seleccionado con su ID */}
          {qrData?.promocionSeleccionada && qrData.promocionSeleccionada.id && (
            <Text style={styles.qrDataText}>
              <Text style={styles.qrDataLabel}>Beneficio ID:</Text> {qrData.promocionSeleccionada.id} - {qrData.promocionSeleccionada.nombre}
            </Text>
          )}

          {/* Muestra el ID de la membresía */}
          {qrData?.membresiaID && (
            <Text style={styles.qrDataText}>
              <Text style={styles.qrDataLabel}>ID de Membresía:</Text> {qrData.membresiaID}
            </Text>
          )}

          {/* Itera sobre los datos del QR adicionales y los muestra */}
          {qrData && Object.entries(qrData).map(([key, value]) => {
            const excludedKeys = ['name', 'promocionSeleccionada', 'membresiaID', 'company_id_from_qr']; // Excluye el nuevo campo
            if (excludedKeys.includes(key)) {
              return null;
            }

            return (
              <Text key={key} style={styles.qrDataText}>
                <Text style={styles.qrDataLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</Text>{' '}
                {key === 'timestamp' && typeof value === 'number' ?
                  new Date(value).toLocaleString('es-AR') :
                  String(value)}
              </Text>
            );
          })}

          {!qrData && rawQrValue && (
            <Text style={styles.qrDataText}>
              <Text style={styles.qrDataLabel}>Valor QR (RAW):</Text> {rawQrValue}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.confirmButton, { marginTop: 24 }]} // Nuevo botón de confirmación
            onPress={handleUseBenefit} // Llama a la nueva función
          >
            <Text style={styles.confirmButtonText}>Confirmar Uso del Beneficio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalCancelButton, { marginTop: 10 }]}
            onPress={() => {
              setQrDataModalVisible(false);
              resetTransactionStates();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL DE ÉXITO */}
      <Modal
        visible={usageSuccessModalVisible}
        onClose={() => setUsageSuccessModalVisible(false)}
        title="¡Éxito!"
      >
        <View style={styles.statusModalContent}>
          <CheckCircle size={60} color={colors.brandGold} />
          <Text style={styles.statusModalMessage}>{usageMessage}</Text>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setUsageSuccessModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL DE ERROR */}
      <Modal
        visible={usageErrorModalVisible}
        onClose={() => setUsageErrorModalVisible(false)}
        title="Error"
      >
        <View style={styles.statusModalContent}>
          <XCircle size={60} color={colors.brandRed} />
          <Text style={styles.statusModalMessage}>{usageMessage}</Text>
          <TouchableOpacity
            style={styles.modalCancelButton}
            onPress={() => setUsageErrorModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
    padding: 16,
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: colors.brandDark,
  },
  paymentMethodModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentButton: {
    backgroundColor: colors.brandGold,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  paymentButtonText: {
    color: colors.brandDark,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  qrModalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.brandDarkSecondary,
  },
  cameraPreview: {
    // Este estilo ya no necesita borderRadius ni overflow, ya que se aplican al contenedor.
    // Solo debe asegurarse de que la cámara llene su contenedor.
    // StyleSheet.absoluteFill es una buena opción para esto.
  },
  cameraText: {
    color: colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalCancelButton: {
    backgroundColor: colors.brandGold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    color: colors.brandDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: colors.brandGold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  qrDataModalContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  qrDataTitle: {
    color: colors.brandGold,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  qrDataText: {
    color: colors.white,
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  qrDataLabel: {
    fontWeight: 'bold',
    color: colors.brandGrayLight,
  },
  errorText: {
    color: colors.brandRed,
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.brandGold,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: colors.brandDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  promotionSelectionContent: {
    flexGrow: 1,
    padding: 10,
  },
  promotionButton: {
    backgroundColor: colors.brandGrayDark,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.brandGold,
  },
  promotionButtonUsed: {
    borderColor: colors.brandGray,
    backgroundColor: colors.brandDarkSecondary,
    opacity: 0.6,
  },
  promotionButtonTextContainer: {
    flex: 1,
  },
  promotionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  promotionButtonTextUsed: {
    color: colors.brandGray,
    textDecorationLine: 'line-through',
  },
  promotionServiceText: {
    color: colors.brandGray,
    fontSize: 12,
    marginTop: 2,
  },
  noPromosText: {
    color: colors.brandGray,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  selectedPromotionText: {
    color: colors.white,
    fontSize: 16,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: colors.brandGold,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: colors.brandDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusModalMessage: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
});