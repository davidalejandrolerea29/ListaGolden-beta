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
const CAROUSEL_INTERVAL = 4000; // 4 segundos

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile, getActiveProvinces } = useUserProfile();
  const { companies, getCompaniesByProvince } = useCompanies();
  const { provinces } = useProvinces();
  const [bannerIndex, setBannerIndex] = useState(0);
  
  const activeProvinces = getActiveProvinces();

  // Get establishments with valid images for carousel
  const getEstablishmentsForCarousel = () => {
    if (activeProvinces.length === 0) return [];
    
    return activeProvinces
      .flatMap(province => getCompaniesByProvince(province))
      .filter(est => {
        const imageUrl = est.images?.[0]?.file_url?.trim();
        return imageUrl && imageUrl.startsWith('http');
      })
      .slice(0, 5); // Limit to 5 establishments for carousel
  };

  const carouselEstablishments = getEstablishmentsForCarousel();

  // Banner carousel effect
  useEffect(() => {
    if (carouselEstablishments.length > 1) {
      const interval = setInterval(() => {
        setBannerIndex(prev => (prev + 1) % carouselEstablishments.length);
      }, CAROUSEL_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [carouselEstablishments.length]);

  // Reset banner index if establishments change
  useEffect(() => {
    if (bannerIndex >= carouselEstablishments.length) {
      setBannerIndex(0);
    }
  }, [carouselEstablishments.length, bannerIndex]);

  const handleProvincePress = (provinceName: string) => {
    navigation.navigate('Province', { name: provinceName });
  };

  const handleBannerPress = () => {
    const currentEstablishment = carouselEstablishments[bannerIndex];
    if (currentEstablishment) {
      navigation.navigate('EstablishmentDetail', { id: currentEstablishment.id });
    }
  };

  const renderCarouselDots = () => {
    if (carouselEstablishments.length <= 1) return null;

    return (
      <View style={styles.dotsContainer}>
        {carouselEstablishments.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === bannerIndex ? styles.activeDot : styles.inactiveDot
            ]}
            onPress={() => setBannerIndex(index)}
          />
        ))}
      </View>
    );
  };

  if (activeProvinces.length > 0) {
    const currentBannerEstablishment = carouselEstablishments[bannerIndex];
    
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <ScrollView style={styles.container}>
          <Text style={globalStyles.title}>Tus Beneficios Activos</Text>

          {carouselEstablishments.length > 0 && currentBannerEstablishment && (
            <TouchableOpacity 
              style={styles.bannerContainer}
              onPress={handleBannerPress}
              activeOpacity={0.9}
            >
              <Image
                source={{
                  uri: currentBannerEstablishment.images?.[0]?.file_url?.trim() || 
                       'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg'
                }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              
              <View style={styles.bannerOverlay}>
                <View style={styles.bannerTextBox}>
                  <Text style={styles.bannerTitle}>
                    {currentBannerEstablishment.name}
                  </Text>
                  <Text style={styles.bannerPromo}>
                    Beneficios exclusivos en {currentBannerEstablishment.location?.location?.description || 'tu zona'}
                  </Text>
                </View>
                
                {renderCarouselDots()}
              </View>
            </TouchableOpacity>
          )}

          {activeProvinces.map(provinceName => {
            const provinceEstablishments = getCompaniesByProvince(provinceName);
            
            if (provinceEstablishments.length === 0) return null;

            return (
              <View key={provinceName} style={styles.provinceSection}>
                <Text style={globalStyles.subtitle}>Beneficios en {provinceName}</Text>
                <View style={styles.establishmentsContainer}>
                  {provinceEstablishments.map(establishment => (
                    <EstablishmentCard
                      key={establishment.id}
                      establishment={establishment}
                      onPress={(est) => navigation.navigate('EstablishmentDetail', { id: est.id })}
                    />
                  ))}
                </View>
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
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  bannerTextBox: {
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.brandLight,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerPromo: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandGold,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: colors.brandGold,
    transform: [{ scale: 1.2 }],
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  provinceSection: {
    marginBottom: 24,
  },
  establishmentsContainer: {
    gap: 12,
  },
  pricingBanner: {
    borderWidth: 2,
    borderColor: colors.brandGold,
    marginBottom: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
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
    fontSize: 18,
  },
  provinceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  provinceCard: {
    width: '48%',
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brandGray,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  provinceName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.brandLight,
    textAlign: 'center',
  },
});