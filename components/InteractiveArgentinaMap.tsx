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
import { WebView } from 'react-native-webview';
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
  const webViewRef = useRef<WebView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mounted, setMounted] = useState(true);

  // Limpieza mejorada del componente
  useEffect(() => {
    setMounted(true);
    
    return () => {
      setMounted(false);
      setMapReady(false);
    };
  }, []);

  // Generar HTML para el mapa de OpenStreetMap
  const generateMapHTML = useCallback(() => {
    const provincesData = argentinaGeoJSON.features.map(feature => ({
      name: feature.properties.name,
      geometry: feature.geometry,
      isActive: activeProvinces.includes(feature.properties.name),
      isSelected: selectedProvince === feature.properties.name,
    }));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${currentRegion.latitude}, ${currentRegion.longitude}], 6);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const provincesData = ${JSON.stringify(provincesData)};
          const colors = ${JSON.stringify(colors)};

          provincesData.forEach(province => {
            if (province.geometry.type === 'Polygon') {
              province.geometry.coordinates.forEach(ring => {
                const coords = ring.map(coord => [coord[1], coord[0]]);
                const polygon = L.polygon(coords, {
                  color: province.isSelected ? colors.brandLight : colors.brandDark,
                  fillColor: province.isSelected ? colors.brandGold : 
                            province.isActive ? colors.brandGold + '88' : colors.brandGray + '33',
                  weight: 2,
                  fillOpacity: 0.7
                }).addTo(map);
                
                polygon.on('click', () => {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'provincePress',
                    province: province.name
                  }));
                });
              });
            } else if (province.geometry.type === 'MultiPolygon') {
              province.geometry.coordinates.forEach(polygon => {
                polygon.forEach(ring => {
                  const coords = ring.map(coord => [coord[1], coord[0]]);
                  const poly = L.polygon(coords, {
                    color: province.isSelected ? colors.brandLight : colors.brandDark,
                    fillColor: province.isSelected ? colors.brandGold : 
                              province.isActive ? colors.brandGold + '88' : colors.brandGray + '33',
                    weight: 2,
                    fillOpacity: 0.7
                  }).addTo(map);
                  
                  poly.on('click', () => {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'provincePress',
                      province: province.name
                    }));
                  });
                });
              });
            }
          });

          // Agregar marcador si hay provincia seleccionada
          ${selectedProvince ? `
            const markerCoords = ${JSON.stringify(getMarkerCoordinates(selectedProvince))};
            L.marker([markerCoords.latitude, markerCoords.longitude])
              .addTo(map)
              .bindPopup('${selectedProvince}');
          ` : ''}
        </script>
      </body>
      </html>
    `;
  }, [activeProvinces, selectedProvince, currentRegion]);

  const handleWebViewMessage = useCallback((event: any) => {
    if (!mounted) return;
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'provincePress') {
        onProvincePress(data.province);
      }
    } catch (error) {
      console.log('Error parsing WebView message:', error);
    }
  }, [onProvincePress, mounted]);

  const getMarkerCoordinates = useCallback((provinceName: string) => {
    try {
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
    } catch (error) {
      console.log('Error getting marker coordinates:', error);
    }

    return { latitude: -38, longitude: -63 };
  }, []);

  const openMapForProvince = useCallback((provinceName: string) => {
    try {
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
    } catch (error) {
      console.log('Error opening map:', error);
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    }
  }, []);

  const resetMapView = useCallback(() => {
    if (mounted && webViewRef.current) {
      try {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'resetView',
          region: currentRegion
        }));
      } catch (error) {
        console.log('Error resetting map:', error);
      }
    }
  }, [currentRegion, mounted]);

  if (!argentinaGeoJSON?.features?.length) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.subtitle}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Mapa Interactivo de Argentina</Text>
      <Text style={styles.subtitle}>Toca una provincia para ver sus beneficios</Text>

      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: generateMapHTML() }}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        onLoad={() => setMapReady(true)}
      />

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
              onPress={() => {
                if (mounted) {
                  onProvincePress(province);
                }
              }}
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