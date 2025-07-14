import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Globe, 
  Truck, 
  Calendar,
  Gift,
  Camera
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { useCompanies } from '../hooks/useCompanies';

interface EstablishmentDetailScreenProps {
  route: {
    params: {
      id: number;
    };
  };
  navigation: any;
}

export default function EstablishmentDetailScreen({ route, navigation }: EstablishmentDetailScreenProps) {
  const { id } = route.params;
  const { getCompanyById } = useCompanies();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const establishment = getCompanyById(id);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  if (!establishment) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centered, { backgroundColor: colors.brandDark }]}>
          <Text style={[globalStyles.text, globalStyles.textGray]}>
            Establecimiento no encontrado
          </Text>
          <Button
            title="Volver"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const images = establishment.images || [];
  const mainImage = images[selectedImageIndex]?.file_url || 
                   'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800';

  const handleReservation = () => {
    if (establishment.with_reservation) {
      showToast('Función de reserva en desarrollo. ¡Próximamente!');
    } else {
      showToast('Este establecimiento no acepta reservas online.');
    }
  };

  const handleDelivery = () => {
    if (establishment.with_delivery) {
      showToast('Función de delivery en desarrollo. ¡Próximamente!');
    } else {
      showToast('Este establecimiento no ofrece delivery.');
    }
  };

  const handleCall = () => {
    showToast('Función de llamada en desarrollo.');
  };

  const handleWebsite = () => {
    showToast('Función de sitio web en desarrollo.');
  };

  const getPromoText = () => {
    const firstService = establishment.services?.[0];
    const firstPromotion = firstService?.promotions?.[0];
    return firstPromotion?.description || 'Beneficios exclusivos disponibles';
  };

  const getScheduleText = () => {
    if (establishment.schedules?.length > 0) {
      const schedule = establishment.schedules[0];
      return `${schedule.start_time} - ${schedule.end_time}`;
    }
    return 'Consultar horarios';
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.brandLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{establishment.name}</Text>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: mainImage }} style={styles.mainImage} />
          
          {images.length > 1 && (
            <ScrollView 
              horizontal 
              style={styles.imageGallery}
              showsHorizontalScrollIndicator={false}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[
                    styles.thumbnailContainer,
                    selectedImageIndex === index && styles.selectedThumbnail
                  ]}
                >
                  <Image source={{ uri: image.file_url }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.imageOverlay}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {establishment.services?.[0]?.description || 'Servicios'}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Info */}
        <View style={[globalStyles.card, styles.mainInfo]}>
          <Text style={styles.establishmentName}>{establishment.name}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={16} color={colors.brandGray} />
            <Text style={styles.locationText}>
              {establishment.location?.location.description || 'Ubicación no disponible'}
            </Text>
          </View>

          <View style={styles.scheduleContainer}>
            <Clock size={16} color={colors.brandGray} />
            <Text style={styles.scheduleText}>{getScheduleText()}</Text>
          </View>

          <Text style={styles.description}>
            {establishment.long_description || establishment.short_description || 'Descripción no disponible'}
          </Text>
        </View>

        {/* Promotion Card */}
        <View style={[globalStyles.card, styles.promotionCard]}>
          <View style={styles.promotionHeader}>
            <Gift size={24} color={colors.brandGold} />
            <Text style={styles.promotionTitle}>Beneficio Exclusivo</Text>
          </View>
          <Text style={styles.promotionText}>{getPromoText()}</Text>
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionBadgeText}>LISTA GOLDEN</Text>
          </View>
        </View>

        {/* Services */}
        {establishment.services && establishment.services.length > 0 && (
          <View style={[globalStyles.card, styles.servicesCard]}>
            <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
            {establishment.services.map((service, index) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceDot} />
                <Text style={styles.serviceText}>{service.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Schedule Details */}
        {establishment.schedules && establishment.schedules.length > 0 && (
          <View style={[globalStyles.card, styles.scheduleCard]}>
            <View style={styles.scheduleHeader}>
              <Calendar size={20} color={colors.brandGold} />
              <Text style={styles.sectionTitle}>Horarios de Atención</Text>
            </View>
            {establishment.schedules.map((schedule, index) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <Text style={styles.dayText}>{schedule.day?.description || 'Día'}</Text>
                <Text style={styles.timeText}>
                  {schedule.start_time} - {schedule.end_time}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {establishment.with_reservation && (
            <Button
              title="Hacer Reserva"
              onPress={handleReservation}
              style={styles.actionButton}
              icon={<Calendar size={18} color={colors.brandDark} />}
            />
          )}
          
          {establishment.with_delivery && (
            <Button
              title="Pedir Delivery"
              onPress={handleDelivery}
              variant="secondary"
              style={styles.actionButton}
              icon={<Truck size={18} color={colors.brandDark} />}
            />
          )}
          
          <Button
            title="Llamar"
            onPress={handleCall}
            variant="outline"
            style={styles.actionButton}
            icon={<Phone size={18} color={colors.brandGold} />}
          />
          
          <Button
            title="Sitio Web"
            onPress={handleWebsite}
            variant="outline"
            style={styles.actionButton}
            icon={<Globe size={18} color={colors.brandGold} />}
          />
        </View>

        {/* Location Map Placeholder */}
        <View style={[globalStyles.card, styles.mapCard]}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <View style={styles.mapPlaceholder}>
            <MapPin size={40} color={colors.brandGold} />
            <Text style={styles.mapText}>
              {establishment.location?.location.description}
            </Text>
            <Text style={styles.mapSubtext}>
              Lat: {establishment.location?.lat}, Long: {establishment.location?.long}
            </Text>
          </View>
        </View>
      </ScrollView>

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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.brandDarkSecondary,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandLight,
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  imageGallery: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  thumbnailContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: colors.brandGold,
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  categoryBadge: {
    backgroundColor: colors.brandGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.brandDark,
  },
  mainInfo: {
    margin: 16,
    marginBottom: 8,
  },
  establishmentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 16,
    color: colors.brandGray,
    marginLeft: 6,
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 14,
    color: colors.brandLight,
    marginLeft: 6,
  },
  description: {
    fontSize: 16,
    color: colors.brandLight,
    lineHeight: 24,
  },
  promotionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.brandGold,
    position: 'relative',
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginLeft: 8,
  },
  promotionText: {
    fontSize: 16,
    color: colors.brandLight,
    lineHeight: 22,
    marginBottom: 12,
  },
  promotionBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: colors.brandGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  promotionBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.brandDark,
  },
  servicesCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brandGold,
    marginRight: 12,
  },
  serviceText: {
    fontSize: 16,
    color: colors.brandLight,
  },
  scheduleCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandDark,
  },
  dayText: {
    fontSize: 16,
    color: colors.brandLight,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    color: colors.brandGray,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  mapCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: colors.brandDark,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brandGray,
  },
  mapText: {
    fontSize: 16,
    color: colors.brandLight,
    marginTop: 8,
    textAlign: 'center',
  },
  mapSubtext: {
    fontSize: 12,
    color: colors.brandGray,
    marginTop: 4,
    textAlign: 'center',
  },
});