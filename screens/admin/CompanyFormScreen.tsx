import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Switch,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  Clock, 
  Image as ImageIcon,
  QrCode,
  Plus,
  Trash2
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';
import { Button } from '../../components/Button';
import { Toast } from '../../components/Toast';
import { useProvinces } from '../../hooks/useProvinces';
import { supabase } from '../../lib/supabase';

interface CompanyFormScreenProps {
  route: {
    params?: {
      companyId?: number;
      mode: 'create' | 'edit';
    };
  };
  navigation: any;
}

interface CompanyFormData {
  name: string;
  short_description: string;
  long_description: string;
  with_reservation: boolean;
  with_delivery: boolean;
  location_description: string;
  province_id: number;
  lat: string;
  long: string;
  images: string[];
  services: ServiceData[];
  schedules: ScheduleData[];
}

interface ServiceData {
  id?: number;
  description: string;
  promotions: PromotionData[];
}

interface PromotionData {
  id?: number;
  description: string;
}

interface ScheduleData {
  id?: number;
  day_id: number;
  start_time: string;
  end_time: string;
}

const { width } = Dimensions.get('window');

export default function CompanyFormScreen({ route, navigation }: CompanyFormScreenProps) {
  const { companyId, mode } = route.params || { mode: 'create' };
  const { provinces } = useProvinces();
  
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    short_description: '',
    long_description: '',
    with_reservation: false,
    with_delivery: false,
    location_description: '',
    province_id: 0,
    lat: '',
    long: '',
    images: [''],
    services: [{ description: '', promotions: [{ description: '' }] }],
    schedules: [{ day_id: 1, start_time: '09:00', end_time: '18:00' }]
  });

  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [showQR, setShowQR] = useState(false);

  const days = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 7, name: 'Domingo' }
  ];

  useEffect(() => {
    if (mode === 'edit' && companyId) {
      loadCompanyData();
    }
  }, [companyId, mode]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      
      const { data: company, error } = await supabase
        .from('companies')
        .select(`
          *,
          images:companies_images(*),
          location:locations_companies(
            *,
            location:locations(*)
          ),
          services(
            *,
            promotions(*)
          ),
          schedules(
            *,
            day:days(id, description)
          )
        `)
        .eq('id', companyId)
        .single();

      if (error) throw error;

      if (company) {
        setFormData({
          name: company.name,
          short_description: company.short_description || '',
          long_description: company.long_description || '',
          with_reservation: company.with_reservation,
          with_delivery: company.with_delivery,
          location_description: company.location?.[0]?.location?.description || '',
          province_id: company.location?.[0]?.location?.province_id || 0,
          lat: company.location?.[0]?.lat?.toString() || '',
          long: company.location?.[0]?.long?.toString() || '',
          images: company.images?.map((img: any) => img.file_url) || [''],
          services: company.services?.map((service: any) => ({
            id: service.id,
            description: service.description,
            promotions: service.promotions?.map((promo: any) => ({
              id: promo.id,
              description: promo.description
            })) || [{ description: '' }]
          })) || [{ description: '', promotions: [{ description: '' }] }],
          schedules: company.schedules?.map((schedule: any) => ({
            id: schedule.id,
            day_id: schedule.days_id,
            start_time: schedule.start_time,
            end_time: schedule.end_time
          })) || [{ day_id: 1, start_time: '09:00', end_time: '18:00' }]
        });
      }
    } catch (error) {
      console.error('Error loading company:', error);
      showToast('Error al cargar los datos de la empresa');
    } finally {
      setLoading(false);
    }
  };

  const generateQR = () => {
    const qrData = {
      companyId: companyId || 'new',
      name: formData.name,
      timestamp: Date.now(),
      type: 'company_access'
    };
    setQrValue(JSON.stringify(qrData));
    setShowQR(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('El nombre de la empresa es obligatorio');
      return;
    }

    if (!formData.location_description.trim()) {
      showToast('La descripción de la ubicación es obligatoria');
      return;
    }

    if (!formData.province_id) {
      showToast('Debe seleccionar una provincia');
      return;
    }

    setLoading(true);
    try {
      let companyResult;

      if (mode === 'create') {
        // Crear nueva empresa
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: formData.name,
            short_description: formData.short_description,
            long_description: formData.long_description,
            with_reservation: formData.with_reservation,
            with_delivery: formData.with_delivery
          })
          .select()
          .single();

        if (companyError) throw companyError;
        companyResult = company;
      } else {
        // Actualizar empresa existente
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            short_description: formData.short_description,
            long_description: formData.long_description,
            with_reservation: formData.with_reservation,
            with_delivery: formData.with_delivery,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId)
          .select()
          .single();

        if (companyError) throw companyError;
        companyResult = company;
      }

      // Crear o actualizar ubicación
      await saveLocation(companyResult.id);
      
      // Guardar imágenes
      await saveImages(companyResult.id);
      
      // Guardar servicios y promociones
      await saveServices(companyResult.id);
      
      // Guardar horarios
      await saveSchedules(companyResult.id);

      showToast(mode === 'create' ? 'Empresa creada exitosamente' : 'Empresa actualizada exitosamente');
      
      // Generar QR automáticamente
      setTimeout(() => {
        generateQR();
      }, 1000);

    } catch (error) {
      console.error('Error saving company:', error);
      showToast('Error al guardar la empresa');
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = async (companyId: number) => {
    // Primero crear o actualizar la ubicación
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .upsert({
        description: formData.location_description,
        price: 10000, // Precio fijo por ahora
        province_id: formData.province_id
      })
      .select()
      .single();

    if (locationError) throw locationError;

    // Luego crear o actualizar la relación empresa-ubicación
    const { error: locationCompanyError } = await supabase
      .from('locations_companies')
      .upsert({
        location_id: location.id,
        company_id: companyId,
        lat: parseFloat(formData.lat) || 0,
        long: parseFloat(formData.long) || 0
      });

    if (locationCompanyError) throw locationCompanyError;
  };

  const saveImages = async (companyId: number) => {
    // Eliminar imágenes existentes si es edición
    if (mode === 'edit') {
      await supabase
        .from('companies_images')
        .delete()
        .eq('company_id', companyId);
    }

    // Insertar nuevas imágenes
    const validImages = formData.images.filter(img => img.trim() !== '');
    if (validImages.length > 0) {
      const { error } = await supabase
        .from('companies_images')
        .insert(
          validImages.map(url => ({
            file_url: url,
            company_id: companyId
          }))
        );

      if (error) throw error;
    }
  };

  const saveServices = async (companyId: number) => {
    // Eliminar servicios existentes si es edición
    if (mode === 'edit') {
      await supabase
        .from('services')
        .delete()
        .eq('company_id', companyId);
    }

    // Insertar nuevos servicios
    for (const service of formData.services) {
      if (service.description.trim()) {
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .insert({
            description: service.description,
            company_id: companyId
          })
          .select()
          .single();

        if (serviceError) throw serviceError;

        // Insertar promociones del servicio
        const validPromotions = service.promotions.filter(promo => promo.description.trim() !== '');
        if (validPromotions.length > 0) {
          const { error: promoError } = await supabase
            .from('promotions')
            .insert(
              validPromotions.map(promo => ({
                description: promo.description,
                service_id: serviceData.id
              }))
            );

          if (promoError) throw promoError;
        }
      }
    }
  };

  const saveSchedules = async (companyId: number) => {
    // Eliminar horarios existentes si es edición
    if (mode === 'edit') {
      await supabase
        .from('schedules')
        .delete()
        .eq('company_id', companyId);
    }

    // Insertar nuevos horarios
    const validSchedules = formData.schedules.filter(schedule => 
      schedule.start_time && schedule.end_time
    );

    if (validSchedules.length > 0) {
      const { error } = await supabase
        .from('schedules')
        .insert(
          validSchedules.map(schedule => ({
            company_id: companyId,
            days_id: schedule.day_id,
            start_time: schedule.start_time,
            end_time: schedule.end_time
          }))
        );

      if (error) throw error;
    }
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { description: '', promotions: [{ description: '' }] }]
    }));
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const updateService = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const addPromotion = (serviceIndex: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === serviceIndex 
          ? { ...service, promotions: [...service.promotions, { description: '' }] }
          : service
      )
    }));
  };

  const removePromotion = (serviceIndex: number, promoIndex: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === serviceIndex 
          ? { ...service, promotions: service.promotions.filter((_, j) => j !== promoIndex) }
          : service
      )
    }));
  };

  const updatePromotion = (serviceIndex: number, promoIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === serviceIndex 
          ? { 
              ...service, 
              promotions: service.promotions.map((promo, j) => 
                j === promoIndex ? { ...promo, description: value } : promo
              )
            }
          : service
      )
    }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [...prev.schedules, { day_id: 1, start_time: '09:00', end_time: '18:00' }]
    }));
  };

  const removeSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, i) => 
        i === index ? { ...schedule, [field]: value } : schedule
      )
    }));
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.brandLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'create' ? 'Nueva Empresa' : 'Editar Empresa'}
          </Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <Save size={24} color={loading ? colors.brandGray : colors.brandGold} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Información Básica */}
          <View style={[globalStyles.card, styles.section]}>
            <View style={styles.sectionHeader}>
              <Building2 size={20} color={colors.brandGold} />
              <Text style={styles.sectionTitle}>Información Básica</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre de la Empresa *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre de la empresa"
                placeholderTextColor={colors.brandGray}
                value={formData.name}
                onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción Corta</Text>
              <TextInput
                style={styles.input}
                placeholder="Descripción breve de la empresa"
                placeholderTextColor={colors.brandGray}
                value={formData.short_description}
                onChangeText={(value) => setFormData(prev => ({ ...prev, short_description: value }))}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción Detallada</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción completa de la empresa"
                placeholderTextColor={colors.brandGray}
                value={formData.long_description}
                onChangeText={(value) => setFormData(prev => ({ ...prev, long_description: value }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.switchContainer}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Acepta Reservas</Text>
                <Switch
                  value={formData.with_reservation}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, with_reservation: value }))}
                  thumbColor={formData.with_reservation ? colors.brandGold : colors.brandGray}
                  trackColor={{ false: colors.brandDark, true: colors.brandGold }}
                />
              </View>

              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Ofrece Delivery</Text>
                <Switch
                  value={formData.with_delivery}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, with_delivery: value }))}
                  thumbColor={formData.with_delivery ? colors.brandGold : colors.brandGray}
                  trackColor={{ false: colors.brandDark, true: colors.brandGold }}
                />
              </View>
            </View>
          </View>

          {/* Ubicación */}
          <View style={[globalStyles.card, styles.section]}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color={colors.brandGold} />
              <Text style={styles.sectionTitle}>Ubicación</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descripción de Ubicación *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Córdoba Capital, Centro"
                placeholderTextColor={colors.brandGray}
                value={formData.location_description}
                onChangeText={(value) => setFormData(prev => ({ ...prev, location_description: value }))}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Provincia *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.province_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, province_id: value }))}
                  style={styles.picker}
                  dropdownIconColor={colors.brandGray}
                >
                  <Picker.Item label="Seleccionar provincia" value={0} />
                  {provinces.map(province => (
                    <Picker.Item 
                      key={province.id} 
                      label={province.description} 
                      value={province.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Latitud</Text>
                <TextInput
                  style={styles.input}
                  placeholder="-31.4201"
                  placeholderTextColor={colors.brandGray}
                  value={formData.lat}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, lat: value }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Longitud</Text>
                <TextInput
                  style={styles.input}
                  placeholder="-64.1888"
                  placeholderTextColor={colors.brandGray}
                  value={formData.long}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, long: value }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Imágenes */}
          <View style={[globalStyles.card, styles.section]}>
            <View style={styles.sectionHeader}>
              <ImageIcon size={20} color={colors.brandGold} />
              <Text style={styles.sectionTitle}>Imágenes</Text>
              <TouchableOpacity onPress={addImage} style={styles.addButton}>
                <Plus size={16} color={colors.brandDark} />
              </TouchableOpacity>
            </View>

            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <TextInput
                  style={[styles.input, styles.imageInput]}
                  placeholder="URL de la imagen"
                  placeholderTextColor={colors.brandGray}
                  value={image}
                  onChangeText={(value) => updateImage(index, value)}
                />
                {formData.images.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removeImage(index)}
                    style={styles.removeButton}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Servicios y Promociones */}
          <View style={[globalStyles.card, styles.section]}>
            <View style={styles.sectionHeader}>
              <Building2 size={20} color={colors.brandGold} />
              <Text style={styles.sectionTitle}>Servicios y Promociones</Text>
              <TouchableOpacity onPress={addService} style={styles.addButton}>
                <Plus size={16} color={colors.brandDark} />
              </TouchableOpacity>
            </View>

            {formData.services.map((service, serviceIndex) => (
              <View key={serviceIndex} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceLabel}>Servicio {serviceIndex + 1}</Text>
                  {formData.services.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeService(serviceIndex)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Descripción del servicio"
                  placeholderTextColor={colors.brandGray}
                  value={service.description}
                  onChangeText={(value) => updateService(serviceIndex, 'description', value)}
                />

                <View style={styles.promotionsContainer}>
                  <View style={styles.promotionsHeader}>
                    <Text style={styles.promotionsLabel}>Promociones</Text>
                    <TouchableOpacity 
                      onPress={() => addPromotion(serviceIndex)}
                      style={styles.addSmallButton}
                    >
                      <Plus size={12} color={colors.brandDark} />
                    </TouchableOpacity>
                  </View>

                  {service.promotions.map((promotion, promoIndex) => (
                    <View key={promoIndex} style={styles.promotionItem}>
                      <TextInput
                        style={[styles.input, styles.promotionInput]}
                        placeholder="Descripción de la promoción"
                        placeholderTextColor={colors.brandGray}
                        value={promotion.description}
                        onChangeText={(value) => updatePromotion(serviceIndex, promoIndex, value)}
                      />
                      {service.promotions.length > 1 && (
                        <TouchableOpacity 
                          onPress={() => removePromotion(serviceIndex, promoIndex)}
                          style={styles.removeSmallButton}
                        >
                          <Trash2 size={12} color={colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Horarios */}
          <View style={[globalStyles.card, styles.section]}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={colors.brandGold} />
              <Text style={styles.sectionTitle}>Horarios</Text>
              <TouchableOpacity onPress={addSchedule} style={styles.addButton}>
                <Plus size={16} color={colors.brandDark} />
              </TouchableOpacity>
            </View>

            {formData.schedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleItem}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleLabel}>Horario {index + 1}</Text>
                  {formData.schedules.length > 1 && (
                    <TouchableOpacity 
                      onPress={() => removeSchedule(index)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Día</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={schedule.day_id}
                      onValueChange={(value) => updateSchedule(index, 'day_id', value)}
                      style={styles.picker}
                      dropdownIconColor={colors.brandGray}
                    >
                      {days.map(day => (
                        <Picker.Item 
                          key={day.id} 
                          label={day.name} 
                          value={day.id} 
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Hora Inicio</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="09:00"
                      placeholderTextColor={colors.brandGray}
                      value={schedule.start_time}
                      onChangeText={(value) => updateSchedule(index, 'start_time', value)}
                    />
                  </View>

                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Hora Fin</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="18:00"
                      placeholderTextColor={colors.brandGray}
                      value={schedule.end_time}
                      onChangeText={(value) => updateSchedule(index, 'end_time', value)}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* QR Code */}
          {showQR && qrValue && (
            <View style={[globalStyles.card, styles.section]}>
              <View style={styles.sectionHeader}>
                <QrCode size={20} color={colors.brandGold} />
                <Text style={styles.sectionTitle}>Código QR de la Empresa</Text>
              </View>

              <View style={styles.qrContainer}>
              <QRCode
  value={qrValue}
  size={280}
  quietZone={16} // agrega borde blanco
  backgroundColor="#ffffff"
  color="#000000"
/>

                <Text style={styles.qrText}>
                  Código QR generado para {formData.name}
                </Text>
                <Text style={styles.qrSubtext}>
                  Los clientes pueden escanear este código para acceder a los beneficios
                </Text>
              </View>
            </View>
          )}

          {/* Botones de Acción */}
          <View style={styles.actionButtons}>
            <Button
              title={loading ? 'Guardando...' : 'Guardar Empresa'}
              onPress={handleSave}
              disabled={loading}
              style={styles.saveButtonFull}
              icon={<Save size={18} color={colors.brandDark} />}
            />

            {!showQR && (
              <Button
                title="Generar QR"
                onPress={generateQR}
                variant="outline"
                style={styles.qrButton}
                icon={<QrCode size={18} color={colors.brandGold} />}
              />
            )}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.brandDarkSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandLight,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginLeft: 8,
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.brandGold,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.brandLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.brandDark,
    borderWidth: 1,
    borderColor: colors.brandGray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.brandLight,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.brandDark,
    borderWidth: 1,
    borderColor: colors.brandGray,
    borderRadius: 8,
  },
  picker: {
    color: colors.brandLight,
    height: 48,
  },
  switchContainer: {
    marginTop: 8,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.brandLight,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  imageInput: {
    flex: 1,
  },
  removeButton: {
    padding: 8,
    backgroundColor: colors.brandDark,
    borderRadius: 6,
  },
  serviceItem: {
    backgroundColor: colors.brandDark,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandGold,
  },
  promotionsContainer: {
    marginTop: 12,
  },
  promotionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promotionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.brandLight,
  },
  addSmallButton: {
    backgroundColor: colors.brandGold,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  promotionInput: {
    flex: 1,
  },
  removeSmallButton: {
    padding: 6,
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 4,
  },
  scheduleItem: {
    backgroundColor: colors.brandDark,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandGold,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
  },
  qrText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandLight,
    marginTop: 16,
    textAlign: 'center',
  },
  qrSubtext: {
    fontSize: 14,
    color: colors.brandGray,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  saveButtonFull: {
    width: '100%',
  },
  qrButton: {
    width: '100%',
  },
});