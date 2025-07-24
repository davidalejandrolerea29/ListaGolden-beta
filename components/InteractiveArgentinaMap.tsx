import React, { useState, useRef, useCallback } from 'react';
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
import MapView, { Marker, Polygon, Region } from 'react-native-maps';
import argentinaGeoJSON from '../assets/ar.json';
import { colors } from '../constants/colors';
import { useFocusEffect } from '@react-navigation/native';

interface Props {
  activeProvinces: string[];
  selectedProvince: string | null;
  onProvincePress: (provinceName: string | null) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const INITIAL_REGION: Region = {
  latitude: -38.4161,
  longitude: -63.6167,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export function InteractiveArgentinaMap({
  activeProvinces,
  selectedProvince,
  onProvincePress,
}: Props) {
  const mapRef = useRef<MapView | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (mapRef.current && mapReady) {
        mapRef.current.animateToRegion(INITIAL_REGION, 1000);
      }
      onProvincePress(null);
    }, [mapReady])
  );
// useFocusEffect(
//   useCallback(() => {
//     setRegion(INITIAL_REGION);
//     onProvincePress(null);
//     setMapKey((prev) => prev + 1);
//   }, [])
// );

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

  if (!argentinaGeoJSON?.features?.length) {
    return <Text style={styles.subtitle}>Cargando mapa...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa Interactivo de Argentina</Text>
      <Text style={styles.subtitle}>Toca una provincia para ver sus beneficios</Text>

      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        onMapReady={() => setMapReady(true)} // 👈 importante
      >
        {argentinaGeoJSON.features.map((feature, idx) => {
          const name = feature.properties.name;
          const isActive = activeProvinces.includes(name);
          const isSelected = selectedProvince === name;

          if (!isActive && !isSelected) return null;

          const polygons = extractPolygons(feature.geometry);

          return polygons.map((coords, i) => (
            <Polygon
              key={`${name}-${idx}-${i}`}
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
  },
  subtitle: {
    fontSize: 14,
    color: colors.brandGray,
    textAlign: 'center',
    marginBottom: 12,
  },
  map: {
    width: screenWidth,
    height: screenHeight * 0.5,
  },
  provincesList: {
    marginTop: 16,
    paddingHorizontal: 16,
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
});
