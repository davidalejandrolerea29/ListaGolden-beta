import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { ARGENTINA_PROVINCE_SVG_PATHS } from '../constants/argentinaPath';

interface Props {
  activeProvinces: string[];
  selectedProvince: string | null;
  onProvincePress: (provinceName: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function InteractiveArgentinaMap({
  activeProvinces,
  selectedProvince,
  onProvincePress,
}: Props) {
  const provinces = Object.keys(ARGENTINA_PROVINCE_SVG_PATHS);

  const getFillColor = (provinceName: string) => {
    if (selectedProvince === provinceName) return colors.brandGold;
    if (activeProvinces.includes(provinceName)) return `${colors.brandGold}CC`; // 80% opacity
    return `${colors.brandGray}55`; // 33% opacity
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa Interactivo de Argentina</Text>
      <Text style={styles.subtitle}>Toca una provincia para ver sus beneficios</Text>

      <Svg
        viewBox="0 0 800 1000"
        width={screenWidth - 32}
        height={400}
        style={styles.map}
      >
        {provinces.map((province) => (
          <Path
            key={province}
            d={ARGENTINA_PROVINCE_SVG_PATHS[province]}
            fill={getFillColor(province)}
            stroke={colors.brandDark}
            strokeWidth={selectedProvince === province ? 2 : 1}
            transform={selectedProvince === province ? 'scale(1.05)' : undefined}
            onPress={() => onProvincePress(province)}
          />
        ))}
      </Svg>

      <ScrollView style={styles.provincesList} horizontal showsHorizontalScrollIndicator={false}>
        {provinces.map((province) => {
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
    padding: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.brandGray,
  },
  provincesList: {
    marginTop: 16,
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
