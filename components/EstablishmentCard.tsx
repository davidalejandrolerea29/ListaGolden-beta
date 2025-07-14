import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { Button } from './Button';
import { Company } from '../hooks/useCompanies';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Definí el tipo de parámetros de navegación de tu stack
type RootStackParamList = {
  Establishment: { id: string };
  // agregá otras pantallas acá si usás
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EstablishmentCardProps {
  establishment: Company;
  onPress?: (establishment: Company) => void;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  establishment,
  onPress,
}) => {
  const navigation = useNavigation<NavigationProp>();

  const getPromoText = () => {
    const firstService = establishment.services?.[0];
    const firstPromotion = firstService?.promotions?.[0];
    return firstPromotion?.description || 'Beneficios exclusivos';
  };

  const handlePress = () => {
    if (onPress) {
      onPress(establishment);
    } else {
      navigation.navigate('Establishment', { id: establishment.id });
    }
  };

  const handleViewDetails = () => {
    navigation.navigate('Establishment', { id: establishment.id });
  };

  const logoUrl =
    establishment.images?.[0]?.file_url ||
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg';

  return (
    <TouchableOpacity style={[globalStyles.card, styles.card]} onPress={handlePress}>
      <View style={styles.flexContainer}>
        <Image
          source={{ uri: logoUrl }}
          style={styles.logo}
          defaultSource={require('../assets/images/icon.png')}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{establishment.name}</Text>
          <View style={styles.metaContainer}>
            <MapPin size={16} color={colors.brandGray} />
            <Text style={styles.meta}>
              {establishment.location?.location.description || 'Ubicación no disponible'}
            </Text>
          </View>
          <Text style={styles.hours}>
            {establishment.schedules?.length > 0
              ? `${establishment.schedules[0].start_time} - ${establishment.schedules[0].end_time}`
              : 'Consultar horarios'}
          </Text>
          <Text style={styles.promo}>{getPromoText()}</Text>
        </View>
      </View>
      <Text style={styles.description}>
        {establishment.short_description || establishment.long_description || 'Descripción no disponible'}
      </Text>
      <Button title="Ver Detalles" onPress={handleViewDetails} style={styles.detailsButton} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  flexContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: colors.brandGray,
    marginLeft: 4,
  },
  hours: {
    fontSize: 12,
    color: colors.brandLight,
    marginVertical: 2,
  },
  promo: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandGold,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: colors.brandLight,
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsButton: {
    marginTop: 8,
  },
});
