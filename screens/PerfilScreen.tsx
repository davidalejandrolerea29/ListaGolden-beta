import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Phone, CreditCard, PiggyBank, CircleCheck as CheckCircle, KeyRound, Settings, LogOut } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import { useUserProfile } from '../hooks/useUserProfile';
import { useProvinces } from '../hooks/useProvinces';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';

const PROVINCE_ACCESS_FEE = 10000;
const PROVINCE_SAVINGS_LIMIT = 2000000;

interface PerfilScreenProps {
  navigation: any;
}

export default function PerfilScreen({ navigation }: PerfilScreenProps) {
  const { profile, activateProvince, getActiveProvinces } = useUserProfile();
  const { provinces } = useProvinces();
  const { signOut } = useAuth();
  const [profilePicModalVisible, setProfilePicModalVisible] = useState(false);
  const [newProfilePicUrl, setNewProfilePicUrl] = useState(profile?.profile_picture_url || '');
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const activeProvinces = getActiveProvinces();

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleActivateProvince = (provinceId: number, provinceName: string) => {
    setSelectedProvince(provinceId);
    setProvinceModalVisible(true);
  };

  const confirmProvinceActivation = async () => {
    if (selectedProvince) {
      try {
        await activateProvince(selectedProvince);
        const provinceName = provinces.find(p => p.id === selectedProvince)?.description;
        showToast(`${provinceName} activada con éxito!`);
        setProvinceModalVisible(false);
        setSelectedProvince(null);
      } catch (error) {
        showToast('Error al activar la provincia');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showToast('Sesión cerrada.');
    } catch (error) {
      showToast('Error al cerrar sesión');
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, { backgroundColor: colors.brandDark }]}>
          <Text style={[globalStyles.text, globalStyles.textGray]}>
            Cargando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarInitial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'LG';
  
  const totalSavingsLimit = activeProvinces.length * PROVINCE_SAVINGS_LIMIT;
  const accumulatedSavings = profile.accumulated_savings;
  const potentialRemaining = Math.max(0, totalSavingsLimit - accumulatedSavings);
  let savedPercent = totalSavingsLimit > 0 ? (accumulatedSavings / totalSavingsLimit) * 100 : 0;
  savedPercent = Math.min(100, Math.max(0, savedPercent));

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={globalStyles.title}>Mi Perfil Golden</Text>

        {/* Profile Header */}
        <View style={[globalStyles.card, styles.profileHeader]}>
          <View style={styles.profileInfo}>
            <TouchableOpacity 
              style={styles.avatar}
              onPress={() => setProfilePicModalVisible(true)}
            >
              {profile.profile_picture_url ? (
                <Image source={{ uri: profile.profile_picture_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile.full_name}</Text>
              <View style={styles.userDetail}>
                <MapPin size={16} color={colors.brandGray} />
                <Text style={styles.userDetailText}>{profile.city}</Text>
              </View>
              <View style={styles.userDetail}>
                <Phone size={16} color={colors.brandGray} />
                <Text style={styles.userDetailText}>{profile.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Savings Card */}
        <View style={[globalStyles.card, styles.savingsCard, styles.highlightCard]}>
          <View style={styles.savingsHeader}>
            <PiggyBank size={24} color={colors.brandGold} />
            <Text style={styles.cardTitle}>Mis Ahorros Acumulados</Text>
          </View>
          
          <View style={styles.savingsMainDisplay}>
            <Text style={styles.savingsAmount}>{formatCurrency(profile.accumulated_savings)}</Text>
            <Text style={styles.savingsLabel}>Total Ahorrado</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${savedPercent}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{savedPercent.toFixed(0)}% del límite total</Text>
          </View>

          <View style={styles.savingsStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Potencial Restante</Text>
              <Text style={styles.statValue}>{formatCurrency(potentialRemaining)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Límite Total</Text>
              <Text style={styles.statValue}>{formatCurrency(totalSavingsLimit)}</Text>
            </View>
          </View>
          
          <Text style={styles.savingsNote}>
            {activeProvinces.length > 0 
              ? `Tienes ${activeProvinces.length} provincia${activeProvinces.length > 1 ? 's' : ''} activa${activeProvinces.length > 1 ? 's' : ''}`
              : 'Activa provincias para aumentar tu límite de ahorro'
            }
          </Text>
        </View>

        {/* Provinces Card */}
        <View style={[globalStyles.card, styles.provincesCard]}>
          <Text style={styles.cardTitle}>Provincias Activas y Disponibles</Text>
          <ScrollView style={styles.provincesList} nestedScrollEnabled>
            {provinces.map(province => {
              const isActive = activeProvinces.includes(province.description);
              return (
                <View key={province.id} style={styles.provinceItem}>
                  <Text style={styles.provinceName}>{province.description}</Text>
                  {isActive ? (
                    <View style={styles.activeStatus}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={styles.activeText}>Activado</Text>
                    </View>
                  ) : (
                    <Button
                      title={`Activar (${formatCurrency(PROVINCE_ACCESS_FEE)})`}
                      onPress={() => handleActivateProvince(province.id, province.description)}
                      variant="outline"
                      style={styles.activateButton}
                      icon={<KeyRound size={16} color={colors.brandGold} />}
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Settings Card */}
        <View style={[globalStyles.card, styles.settingsCard]}>
          <View style={styles.settingsHeader}>
            <Settings size={24} color={colors.brandGold} />
            <Text style={styles.cardTitle}>Configuración</Text>
          </View>
          
          <TouchableOpacity style={styles.settingsItem}>
            <Text style={styles.settingsLink}>Términos y Condiciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <Text style={styles.settingsLink}>Política de Privacidad</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsItem}>
            <Text style={styles.settingsLink}>Contactar Soporte</Text>
          </TouchableOpacity>
          
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="secondary"
            style={styles.logoutButton}
            icon={<LogOut size={18} color={colors.brandDark} />}
          />
        </View>
      </ScrollView>

      {/* Province Activation Modal */}
      <Modal
        visible={provinceModalVisible}
        onClose={() => setProvinceModalVisible(false)}
        title={`Activar Provincia: ${provinces.find(p => p.id === selectedProvince)?.description}`}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Para acceder a los beneficios en <Text style={styles.boldText}>{provinces.find(p => p.id === selectedProvince)?.description}</Text>, necesitas activar esta provincia.
          </Text>
          <Text style={styles.modalText}>
            Costo de activación: <Text style={styles.boldText}>{formatCurrency(PROVINCE_ACCESS_FEE)}</Text> (pago único por provincia).
          </Text>
          <Text style={styles.modalText}>
            ¿Deseas activar {provinces.find(p => p.id === selectedProvince)?.description} ahora?
          </Text>
          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={() => setProvinceModalVisible(false)}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title={`Pagar ${formatCurrency(PROVINCE_ACCESS_FEE)} y Activar`}
              onPress={confirmProvinceActivation}
              style={styles.modalButton}
            />
          </View>
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
  profileHeader: {
    padding: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 4,
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  userDetailText: {
    fontSize: 14,
    color: colors.brandGray,
    marginLeft: 6,
  },
  savingsCard: {
    padding: 16,
    marginBottom: 20,
  },
  highlightCard: {
    borderWidth: 2,
    borderColor: colors.brandGold,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  savingsMainDisplay: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginLeft: 8,
  },
  savingsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 4,
  },
  savingsLabel: {
    fontSize: 14,
    color: colors.brandGray,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandGold,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.brandGray,
    textAlign: 'center',
  },
  savingsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.brandGray,
    opacity: 0.3,
  },
  statLabel: {
    fontSize: 12,
    color: colors.brandGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandLight,
  },
  savingsNote: {
    fontSize: 13,
    color: colors.brandGray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  provincesCard: {
    padding: 16,
  },
  provincesList: {
    maxHeight: 200,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandDark,
  },
  provinceName: {
    fontSize: 16,
    color: colors.brandLight,
    flex: 1,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
    marginLeft: 6,
  },
  activateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  settingsCard: {
    padding: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsItem: {
    paddingVertical: 8,
  },
  settingsLink: {
    fontSize: 16,
    color: colors.brandGold,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 16,
    width: '100%',
  },
  modalContent: {
    padding: 8,
  },
  modalText: {
    fontSize: 16,
    color: colors.brandLight,
    marginBottom: 12,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.brandGold,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});