import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PackageSearch, Truck as TruckOff } from 'lucide-react-native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { EstablishmentCard } from '../components/EstablishmentCard';
import { useUserProfile } from '../hooks/useUserProfile';
import { useCompanies } from '../hooks/useCompanies';

interface DeliveryScreenProps {
  navigation: any;
}

export default function DeliveryScreen({ navigation }: DeliveryScreenProps) {
  const { getActiveProvinces } = useUserProfile();
  const { getDeliveryCompanies } = useCompanies();
  
  const activeProvinces = getActiveProvinces();
  
  if (!activeProvinces || activeProvinces.length === 0) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, styles.container]}>
          <View style={[globalStyles.card, styles.placeholderCard]}>
            <PackageSearch size={80} color={colors.brandGray} style={styles.icon} />
            <Text style={styles.placeholderTitle}>Explora Provincias</Text>
            <Text style={[globalStyles.text, globalStyles.textCenter, globalStyles.textGray]}>
              Activa una provincia desde tu Perfil o Inicio para ver opciones de delivery.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const deliveryEstablishments = getDeliveryCompanies(activeProvinces);

  if (deliveryEstablishments.length === 0) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, styles.container]}>
          <View style={[globalStyles.card, styles.placeholderCard]}>
            <TruckOff size={80} color={colors.brandGray} style={styles.icon} />
            <Text style={styles.placeholderTitle}>Sin Delivery Disponible</Text>
            <Text style={[globalStyles.text, globalStyles.textCenter, globalStyles.textGray]}>
              No hay opciones de delivery disponibles en tus provincias activas por el momento.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={globalStyles.title}>Delivery Lista Golden</Text>
        
        {deliveryEstablishments.map(establishment => (
          <EstablishmentCard
            key={establishment.id}
            establishment={establishment}
            onPress={(est) => navigation.navigate('EstablishmentDetail', { id: est.id })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandDark,
    padding: 16,
  },
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  icon: {
    opacity: 0.5,
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 16,
    textAlign: 'center',
  },
});