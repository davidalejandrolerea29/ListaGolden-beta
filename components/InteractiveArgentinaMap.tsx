import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, Polygon, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import argentinaGeoJSON from '../assets/ar.json';
import { colors } from '../constants/colors';

interface Props {
  activeProvinces: string[];
  selectedProvince: string | null;
  onProvincePress: (provinceName: string | null) => void;
  currentRegion?: Region;
  onRegionChange?: (region: Region) => void;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ARGENTINA_REGION: Region = {
  latitude: -38.4161,
  longitude: -63.6167,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export function InteractiveArgentinaMap({
  activeProvinces = [],
  selectedProvince = null,
  onProvincePress = () => {},
  currentRegion = ARGENTINA_REGION,
  onRegionChange = () => {},
  style = {},
}: Props) {
  const mapRef = useRef<MapView>(null);
   const [isAndroid, setIsAndroid] = useState(false)
  const [mapReady, setMapReady] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  useEffect(() => {
    setIsAndroid(Platform.OS === 'android');
    
    return () => {
      // Solución para el error en Android
      if (isAndroid && mapRef.current) {
        try {
          mapRef.current?.getMap().then(map => {
            map.remove();
          });
        } catch (error) {
          console.log('Error cleaning map:', error);
        }
      }
    };
  }, []);


  // Solución definitiva para el problema de África
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(currentRegion, 1000);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [forceUpdateKey, currentRegion]);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
    if (mapRef.current) {
      mapRef.current.animateToRegion(currentRegion, 1000);
    }
  }, [currentRegion]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onRegionChange(region);
  }, [onRegionChange]);

  const extractPolygons = (geometry: any): { latitude: number; longitude: number }[][] => {
    const polygons: { latitude: number; longitude: number }[][] = [];

    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach((ring: number[][]) => {
        polygons.push(
          ring.map(([lng, lat]: number[]) => ({
            latitude: lat,
            longitude: lng,
          }))
        );
      });
    } else if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon: number[][][]) => {
        polygon.forEach((ring: number[][]) => {
          polygons.push(
            ring.map(([lng, lat]: number[]) => ({
              latitude: lat,
              longitude: lng,
            }))
          );
        });
      });
    }

    return polygons;
  };

  const getMarkerCoordinates = (provinceName: string) => {
    const feature = argentinaGeoJSON.features.find(
      (f) => f.properties.name === provinceName
    );
    if (!feature) return { latitude: -38, longitude: -63 };

    let coords: number[] | undefined;

    if (feature.geometry.type === 'Polygon') {
      coords = feature.geometry.coordinates?.[0]?.[0];
    } else if (feature.geometry.type === 'MultiPolygon') {
      coords = feature.geometry.coordinates?.[0]?.[0]?.[0];
    }

    if (coords && Array.isArray(coords) && coords.length === 2) {
      return {
        latitude: coords[1],
        longitude: coords[0],
      };
    }

    return { latitude: -38, longitude: -63 };
  };

  const openMapForProvince = (provinceName: string) => {
    const feature = argentinaGeoJSON.features.find(
      (f) => f.properties.name === provinceName
    );
    const coords = feature?.geometry.coordinates?.[0]?.[0];
    if (!coords) {
      Alert.alert('Error', 'No se encontraron coordenadas para esta provincia.');
      return;
    }

    const [lng, lat] = coords;
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${provinceName})`,
    });

    Linking.openURL(url as string).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    });
  };

  const resetMapView = () => {
    setForceUpdateKey(prev => prev + 1);
    if (mapRef.current) {
      mapRef.current.animateToRegion(currentRegion, 1000);
    }
  };

  if (!argentinaGeoJSON?.features?.length) {
    return <Text style={styles.subtitle}>Cargando mapa...</Text>;
  }

  return (
    <View style={[styles.container, style]} key={`map-container-${forceUpdateKey}`}>
      <Text style={styles.title}>Mapa Interactivo de Argentina</Text>
      <Text style={styles.subtitle}>Toca una provincia para ver sus beneficios</Text>

      <MapView
        ref={mapRef}
        key={`map-view-${forceUpdateKey}`}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        androidLayerType={isAndroid ? 'hardware' : 'none'}
        initialRegion={currentRegion}
        region={currentRegion}
        onMapReady={handleMapReady}
        onLayout={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {mapReady && argentinaGeoJSON.features.map((feature, idx) => {
          const name = feature.properties.name;
          const isActive = activeProvinces.includes(name);
          const isSelected = selectedProvince === name;

          const polygons = extractPolygons(feature.geometry);

          return polygons.map((coords, i) => (
            <Polygon
              key={`${name}-${idx}-${i}-${forceUpdateKey}`}
              coordinates={coords}
              strokeColor={isSelected ? colors.brandLight : colors.brandDark}
              fillColor={
                isSelected
                  ? colors.brandGold
                  : isActive
                  ? `${colors.brandGold}88`
                  : `${colors.brandGray}33`
              }
              strokeWidth={2}
              tappable
              onPress={() => onProvincePress(name)}
            />
          ));
        })}

        {selectedProvince && (
          <Marker
            coordinate={getMarkerCoordinates(selectedProvince)}
            title={selectedProvince}
          />
        )}
      </MapView>

      <TouchableOpacity 
        style={styles.resetButton}
        onPress={resetMapView}
      >
        <Text style={styles.resetButtonText}>Centrar Mapa</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.provincesList}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {argentinaGeoJSON.features.map((feature) => {
          const province = feature.properties.name;
          const isActive = activeProvinces.includes(province);
          const isSelected = selectedProvince === province;

          return (
            <TouchableOpacity
              key={province}
              style={[
                styles.provinceButton,
                isActive && styles.activeProvince,
                isSelected && styles.selectedProvince,
              ]}
              onPress={() => onProvincePress(province)}
              onLongPress={() => openMapForProvince(province)}
            >
              <Text
                style={[
                  styles.provinceText,
                  isActive && styles.activeProvinceText,
                  isSelected && styles.selectedProvinceText,
                ]}
              >
                {province}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandDarkSecondary,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandLight,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.brandGray,
    textAlign: 'center',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 400,
    backgroundColor: colors.brandDark,
  },
  provincesList: {
    marginTop: 16,
    paddingHorizontal: 16,
    maxHeight: 60,
  },
  provinceButton: {
    backgroundColor: colors.brandGray,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    opacity: 0.6,
  },
  activeProvince: {
    backgroundColor: colors.brandGold,
    opacity: 1,
  },
  selectedProvince: {
    backgroundColor: colors.brandGold,
    borderWidth: 2,
    borderColor: colors.brandLight,
    opacity: 1,
  },
  provinceText: {
    color: colors.brandDark,
    fontWeight: '500',
  },
  activeProvinceText: {
    fontWeight: '600',
  },
  selectedProvinceText: {
    fontWeight: 'bold',
  },
  resetButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: colors.brandGold,
    padding: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  resetButtonText: {
    color: colors.brandDark,
    fontWeight: 'bold',
    fontSize: 12,
  },
});