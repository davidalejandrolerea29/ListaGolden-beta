import React, { useEffect, useState } from 'react';

import {PERMISSIONS, request, RESULTS} from 'react-native-permissions'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';
import { useCodeScanner } from 'react-native-vision-camera';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { UserKeyCard } from '../components/UserKeyCard';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { Button } from '../components/Button';
import { MOCK_USER_KEYS } from '../constants/mockData';
import { UserKey } from '../types';



interface MisLlavesScreenProps {
  navigation: any;
}

export default function MisLlavesScreen({ navigation }: MisLlavesScreenProps) {
  const [selectedKey, setSelectedKey] = useState<UserKey | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasPermission, setHasPermission] = useState('LOADING');

  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraType);
  const ScanFrame = useSharedValue( { width: 1, height: 1 });
  const codeHighlight = useSharedValue ({ x: 0, y: 0, width: 0, height: 0 });
  const [hasScanned, setHasScanned] = useState(false);
  const [qrDataModalVisible, setQrDataModalVisible] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
 
const codeScanner = useCodeScanner({
  codeTypes: ['qr'],
  onCodeScanned: (codes, frame) => {
    console.log('📸 Código detectado:', codes);
    if (hasScanned || codes.length === 0) return;
   
    ScanFrame.value = frame;
  
    setHasScanned(true);

    const scannedValue = codes[0]?.value;
    if (!scannedValue) {
      showToast('QR vacío o no válido.');
      setHasScanned(false);
      return;
    }

  

    try {
      const data = JSON.parse(scannedValue);
      if ((data?.id || data?.companyId) && data?.name) {
        setQrData(data);
        setQrDataModalVisible(true);
        handleCloseScan(); // ✅ mover aquí
      } else {
        showToast('QR inválido o incompleto.');
        setHasScanned(false);
      }
    } catch (e) {
      if (typeof scannedValue === 'string' && scannedValue.startsWith('empresa-')) {
        setQrData({ name: scannedValue });
        setQrDataModalVisible(true);
        handleCloseScan(); // ✅ mover aquí también
      } else {
        showToast('QR no válido. Intenta nuevamente.');
        setHasScanned(false);
      }
    }
  },
});




   const requestAndroidPermissions = async () => {
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
  };
  

  useEffect(() => {
    setTimeout(() => {
      if (Platform.OS === 'android') {
        requestAndroidPermissions();
      } else {
        // For iOS, we can assume permission is granted for now
        setHasPermission('authorized');
      }
    }, 2000);
   
  }, []);

  useEffect(() => {
    
  }, [ qrModalVisible]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleUseKey = (key: UserKey) => {
   
    setSelectedKey(key);
    setQrModalVisible(true);
  };

  const handleCloseScan = () => {
    setQrModalVisible(false);
    setSelectedKey(null);
  };

  if (MOCK_USER_KEYS.length === 0) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, styles.container]}>
          <Text style={[globalStyles.text, globalStyles.textGray]}>
            Aún no tienes llaves. ¡Explora y desbloquea beneficios!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={globalStyles.title}>Mis Llaves Golden</Text>

        {MOCK_USER_KEYS.map((key) => (
          <UserKeyCard key={key.id} userKey={key} onUseKey={handleUseKey} />
        ))}
      </ScrollView>

      <Modal
        visible={qrModalVisible}
        onClose={handleCloseScan}
        title="Escanear QR del Comercio"
      >
        <View style={styles.qrModalContent}>
         <Text style={styles.cameraText}>
  Cámara lista: {device ? '✅' : '❌'} | Permiso: {hasPermission}
       </Text>

          { hasPermission === 'LOADING' || hasPermission === 'denied'  || hasPermission === 'error' ?
          <></>
          :
            device ? (
    <Camera
      style={StyleSheet.absoluteFillObject}
      device={device}
      isActive={true}
      codeScanner={codeScanner}
      torch="on"
    />
  ) : (
    <Text>Cargando cámara...</Text>
  )}
         
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCloseScan}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
  visible={qrDataModalVisible}
  onClose={() => {
    setQrDataModalVisible(false);
    setQrData(null);
    setHasScanned(false); // habilita volver a escanear más adelante
  }}
  title="Comercio Detectado"
>
  <View style={{ padding: 16 }}>
    <Text style={{ color: colors.brandGray, fontSize: 16 }}>
      Comercio: {qrData?.name || 'Desconocido'}
    </Text>
    <TouchableOpacity
      style={[styles.cancelButton, { marginTop: 24 }]}
      onPress={() => {
        setQrDataModalVisible(false);
        setQrData(null);
        setHasScanned(false);
      }}
    >
      <Text style={styles.cancelButtonText}>Aceptar</Text>
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
  qrModalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cameraText: {
    color: colors.brandGray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
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
  cancelButtonText: {
    color: colors.brandDark,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
