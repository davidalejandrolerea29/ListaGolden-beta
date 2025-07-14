import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { EstablishmentCard } from '../components/EstablishmentCard';
import { useUserProfile } from '../hooks/useUserProfile';
import { useCompanies } from '../hooks/useCompanies';
import { useProvinces } from '../hooks/useProvinces';
import { formatCurrency } from '../utils/currency';

const PROVINCE_ACCESS_FEE = 10000;

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile, getActiveProvinces } = useUserProfile();
  const { companies, getCompaniesByProvince } = useCompanies();
  const { provinces } = useProvinces();
  const [bannerIndex, setBannerIndex] = useState(0);
  
  const activeProvinces = getActiveProvinces();

  // Banner carousel effect
  useEffect(() => {
    if (activeProvinces.length > 0) {
      const allCompanies = activeProvinces.flatMap(province => 
        getCompaniesByProvince(province)
      );
      
      if (allCompanies.length > 0) {
        const interval = setInterval(() => {
          setBannerIndex(prev => (prev + 1) % Math.min(5, allCompanies.length));
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [activeProvinces, companies]);

  const handleProvincePress = (provinceName: string) => {
    navigation.navigate('Province', { name: provinceName });
  };

  if (activeProvinces.length > 0) {
    const establishmentsInActiveProvinces = activeProvinces.flatMap(province => 
      getCompaniesByProvince(province)
    );

    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <ScrollView style={styles.container}>
          <Text style={globalStyles.title}>Tus Beneficios Activos</Text>

          {establishmentsInActiveProvinces.length > 0 && (
            <View style={styles.bannerContainer}>
              <Image
                source={{ 
                  uri: establishmentsInActiveProvinces[bannerIndex]?.images?.[0]?.file_url || 
                       'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
                }}
                style={styles.bannerImage}
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>
                  {establishmentsInActiveProvinces[bannerIndex]?.name}
                </Text>
                <Text style={styles.bannerPromo}>
                  Beneficios exclusivos en {establishmentsInActiveProvinces[bannerIndex]?.location?.location.description}
                </Text>
              </View>
            </View>
          )}

          {activeProvinces.map(provinceName => {
            const provinceEstablishments = getCompaniesByProvince(provinceName);
            
            if (provinceEstablishments.length === 0) return null;

            return (
              <View key={provinceName}>
                <Text style={globalStyles.subtitle}>Beneficios en {provinceName}</Text>
                {provinceEstablishments.map(establishment => (
                  <EstablishmentCard
                    key={establishment.id}
                    establishment={establishment}
                    onPress={(est) => navigation.navigate('EstablishmentDetail', { id: est.id })}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={globalStyles.title}>Explora Beneficios por Provincia</Text>
        
        <View style={[globalStyles.card, styles.pricingBanner]}>
          <Text style={styles.pricingText}>
            ¡Desbloquea todos los beneficios en la provincia que elijas por un pago único de{' '}
            <Text style={styles.pricingAmount}>{formatCurrency(PROVINCE_ACCESS_FEE)}</Text>!
          </Text>
        </View>

        <View style={styles.provinceGrid}>
          {provinces.map(province => (
            <TouchableOpacity
              key={province.id}
              style={[globalStyles.card, styles.provinceCard]}
              onPress={() => handleProvincePress(province.description)}
            >
              <Text style={styles.provinceName}>{province.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  bannerContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.brandLight,
    marginBottom: 4,
  },
  bannerPromo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandGold,
  },
  pricingBanner: {
    borderWidth: 1,
    borderColor: colors.brandGold,
    marginBottom: 24,
  },
  pricingText: {
    fontSize: 16,
    color: colors.brandLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  pricingAmount: {
    color: colors.brandGold,
    fontWeight: 'bold',
  },
  provinceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  provinceCard: {
    width: '48%',
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brandGray,
  },
  provinceName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.brandLight,
    textAlign: 'center',
  },
});