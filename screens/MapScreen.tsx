import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, Navigation, Heart } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import { EstablishmentCard } from '../components/EstablishmentCard';
import { Toast } from '../components/Toast';
import { InteractiveArgentinaMap } from '../components/InteractiveArgentinaMap';
import { useUserProfile } from '../hooks/useUserProfile';
import { useCompanies } from '../hooks/useCompanies';

interface MapScreenProps {
  navigation: any;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const { getActiveProvinces } = useUserProfile();
  const { getCompaniesByProvince } = useCompanies();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [mapRegion, setMapRegion] = useState({
    latitude: -38.4161,
    longitude: -63.6167,
    latitudeDelta: 30,
    longitudeDelta: 30,
  });

  const activeProvinces = getActiveProvinces();
  
  const favoriteEstablishments = [
    { id: 'fav1', name: 'Café Favorito', address: 'Av. Corrientes 1234', discount: '20% off', category: 'Gastronomía', province: 'Buenos Aires' },
    { id: 'fav2', name: 'Librería Popular', address: 'Calle Florida 567', discount: '15% off', category: 'Libros', province: 'Córdoba' },
  ];

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setMapKey(prev => prev + 1);
    });

    return unsubscribe;
  }, [navigation]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleProvinceSelect = (provinceName: string | null) => {
    if (provinceName === selectedProvince) return;
    if (provinceName && activeProvinces.includes(provinceName)) {
      setSelectedProvince(provinceName);
      setSearchTerm('');
      setShowFavorites(false);
      showToast(`Mostrando beneficios en ${provinceName}`);
      
      // Centrar el mapa en la provincia seleccionada
      const feature = argentinaGeoJSON.features.find(
        (f) => f.properties.name === provinceName
      );
      if (feature) {
        const coords = feature.geometry.coordinates?.[0]?.[0]?.[0];
        if (coords) {
          setMapRegion({
            latitude: coords[1],
            longitude: coords[0],
            latitudeDelta: 5,
            longitudeDelta: 5,
          });
        }
      }
    } else if (provinceName) {
      showToast(`Activa ${provinceName} desde tu Perfil para ver sus beneficios aquí.`);
    } else {
      setSelectedProvince(null);
    }
  };

  const handleNearMe = () => {
    showToast('Buscando establecimientos cercanos a tu ubicación...');
    setSelectedProvince(null);
    setShowFavorites(false);
    setMapRegion({
      latitude: -38.4161,
      longitude: -63.6167,
      latitudeDelta: 30,
      longitudeDelta: 30,
    });
  };

  const toggleFavorites = () => {
    setShowFavorites(!showFavorites);
    if (!showFavorites) {
      setSelectedProvince(null);
      showToast('Mostrando tus establecimientos favoritos');
    }
  };

  const getFilteredEstablishments = () => {
    if (showFavorites) {
      return favoriteEstablishments;
    }
    if (selectedProvince) {
      return getCompaniesByProvince(selectedProvince);
    }
    return [];
  };

  const filteredEstablishments = getFilteredEstablishments();

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mapa de Argentina</Text>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.brandGray} style={styles.searchIcon} />
            <TouchableOpacity
              style={styles.searchInput}
              onPress={() => {
                showToast('Función de búsqueda avanzada en desarrollo');
              }}
            >
              <Text style={styles.searchPlaceholder}>
                {searchTerm || 'Buscar establecimientos...'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, showFavorites && styles.activeActionButton]} 
              onPress={toggleFavorites}
            >
              <Heart size={18} color={showFavorites ? colors.brandDark : colors.brandGold} />
              <Text style={[styles.actionButtonText, showFavorites && styles.activeActionButtonText]}>Favoritos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleNearMe}
            >
              <Navigation size={18} color={colors.brandGold} />
              <Text style={styles.actionButtonText}>Cerca de mí</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.brandGold }]} />
              <Text style={styles.statusText}>Provincias Activas ({activeProvinces.length})</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.brandGray }]} />
              <Text style={styles.statusText}>Sin Activar</Text>
            </View>
          </View>
        </View>

        <View style={styles.mapContainer}>
          <InteractiveArgentinaMap
            key={`interactive-map-${mapKey}`}
            activeProvinces={activeProvinces}
            selectedProvince={selectedProvince}
            onProvincePress={handleProvinceSelect}
            currentRegion={mapRegion}
            onRegionChange={setMapRegion}
            style={styles.map}
          />

          {selectedProvince && (
            <View style={styles.provinceInfo}>
              <MapPin size={16} color={colors.brandGold} />
              <Text style={styles.provinceInfoText}>{selectedProvince}</Text>
              <TouchableOpacity 
                onPress={() => handleProvinceSelect(null)}
                style={styles.clearSelection}
              >
                <Text style={styles.clearSelectionText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView style={styles.establishmentsList} showsVerticalScrollIndicator={false}>
          {filteredEstablishments.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                {showFavorites ? (
                  <>
                    <Heart size={20} color={colors.brandGold} />
                    <Text style={styles.listTitle}>
                      Tus Favoritos ({filteredEstablishments.length})
                    </Text>
                  </>
                ) : (
                  <>
                    <MapPin size={20} color={colors.brandGold} />
                    <Text style={styles.listTitle}>
                      Beneficios en {selectedProvince} ({filteredEstablishments.length})
                    </Text>
                  </>
                )}
              </View>
              {filteredEstablishments.map(establishment => (
                <EstablishmentCard
                  key={establishment.id}
                  establishment={establishment}
                  onPress={(est) => navigation.navigate('EstablishmentDetail', { id: est.id })}
                />
              ))}
            </>
          ) : showFavorites ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tienes establecimientos favoritos.</Text>
              <Text style={styles.emptySubtext}>
                Agrega establecimientos a tus favoritos para verlos aquí.
              </Text>
            </View>
          ) : selectedProvince ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay beneficios activos en esta provincia.</Text>
              <Text style={styles.emptySubtext}>
                Intenta con otra búsqueda o activa más provincias desde tu perfil.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Selecciona una provincia en el mapa para ver los beneficios disponibles.
              </Text>
              <Text style={styles.emptySubtext}>
                Las provincias en <Text style={styles.goldText}>amarillo</Text> tienen beneficios activos.
              </Text>
              
              {activeProvinces.length > 0 && (
                <View style={styles.quickAccess}>
                  <Text style={styles.quickAccessTitle}>Acceso Rápido:</Text>
                  <View style={styles.quickAccessButtons}>
                    {activeProvinces.map(province => (
                      <TouchableOpacity
                        key={province}
                        style={styles.quickAccessButton}
                        onPress={() => handleProvinceSelect(province)}
                      >
                        <Text style={styles.quickAccessButtonText}>{province}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>

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
    backgroundColor: colors.brandDarkSecondary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandLight,
    marginBottom: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    color: colors.brandGray,
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandDark,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.brandGold,
  },
  activeActionButton: {
    backgroundColor: colors.brandGold,
  },
  actionButtonText: {
    color: colors.brandGold,
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  activeActionButtonText: {
    color: colors.brandDark,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.brandGray,
  },
  mapContainer: {
    height: 400,
    position: 'relative',
    backgroundColor: colors.brandDarkSecondary,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.brandGray,
  },
  map: {
    flex: 1,
  },
  provinceInfo: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.brandDarkSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brandGold,
  },
  provinceInfoText: {
    color: colors.brandLight,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 8,
  },
  clearSelection: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brandGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSelectionText: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  establishmentsList: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.brandLight,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.brandGray,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
  },
  goldText: {
    color: colors.brandGold,
    fontWeight: '600',
  },
  quickAccess: {
    marginTop: 24,
    alignItems: 'center',
  },
  quickAccessTitle: {
    fontSize: 16,
    color: colors.brandGold,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickAccessButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  quickAccessButton: {
    backgroundColor: colors.brandGold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickAccessButtonText: {
    color: colors.brandDark,
    fontSize: 14,
    fontWeight: '600',
  },
});