import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Chrome, Facebook } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext'; // ✅
import { AuthData } from '../types';
import { CommonActions } from '@react-navigation/native';

interface AuthScreenProps {
  navigation: any;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState<AuthData>({
    fullName: '',
    city: '',
    dni: '',
    phone: '',
    email: '',
  });

  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+54');
  const [noDni, setNoDni] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleInputChange = (field: keyof AuthData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

 const handleSubmit = async () => {
  if (!formData.email || !password) {
    showToast('Email y contraseña son obligatorios.');
    return;
  }

  if (!isLogin) {
    if (!termsAccepted) {
      showToast('Debes aceptar los Términos y Condiciones.');
      return;
    }

    if (!formData.fullName || !formData.city || !formData.dni || !formData.phone) {
      showToast('Por favor completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
  }

  setLoading(true);

 try {
    if (isLogin) {
      await signIn(formData.email, password);
      // no navegues aquí! Solo el estado justLoggedIn controla la pantalla siguiente
      showToast('Inicio de sesión exitoso');
    } else {
      await signUp(formData.email, password, {
        fullName: formData.fullName,
        city: formData.city,
        phone: `${countryCode} ${formData.phone}`,
      });
      showToast('¡Registro exitoso!');
    }
  } catch (error: any) {
    console.error('Auth error:', error);
    showToast(error.message || 'Error en la autenticación');
  } finally {
    setLoading(false);
  }
};

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const user = {
      fullName: provider === 'google' ? 'Usuario Google' : 'Usuario Facebook',
      city: provider === 'google' ? 'Buenos Aires' : 'Rosario',
      dni: provider === 'google' ? '87654321' : '10203040',
      phone: provider === 'google' ? '1123456789' : '3415678901',
      email: provider === 'google' ? 'google@example.com' : 'facebook@example.com',
    };
    setFormData(user);
    setPassword('123456');
    setTermsAccepted(true);
    showToast(`Datos de ${provider} cargados. Completa el registro.`);
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.loginContainer}>
          <Text style={styles.title}>LISTA GOLDEN</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Accede a tus beneficios' : 'Crea tu cuenta para empezar'}
          </Text>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialLogin('google')}
            >
              <Chrome size={20} color={colors.white} />
              <Text style={styles.socialButtonText}>Iniciar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleSocialLogin('facebook')}
            >
              <Facebook size={20} color={colors.white} />
              <Text style={styles.socialButtonText}>Iniciar con Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>
              {isLogin ? 'O INICIA SESIÓN CON TU CUENTA' : 'O REGÍSTRATE CON TU EMAIL'}
            </Text>
          </View>

          <View style={styles.form}>
            {!isLogin && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nombre Completo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre completo"
                    placeholderTextColor={colors.brandGray}
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Ciudad</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ciudad de residencia"
                    placeholderTextColor={colors.brandGray}
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    {noDni ? 'Documento de Identidad (Extranjero)' : 'DNI (Argentina)'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={noDni ? 'Pasaporte, Cédula, etc.' : 'Tu número de DNI'}
                    placeholderTextColor={colors.brandGray}
                    value={formData.dni}
                    onChangeText={(value) => handleInputChange('dni', value)}
                  />
                </View>

                <View style={styles.checkboxContainer}>
                  <Switch
                    value={noDni}
                    onValueChange={setNoDni}
                    thumbColor={noDni ? colors.brandGold : colors.brandGray}
                    trackColor={{ false: colors.brandDarkSecondary, true: colors.brandGold }}
                  />
                  <Text style={styles.checkboxLabel}>No tengo DNI argentino / Soy extranjero</Text>
                </View>

                <View style={styles.phoneGroup}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.label}>País</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={countryCode}
                        onValueChange={setCountryCode}
                        style={styles.picker}
                        dropdownIconColor={colors.brandGray}
                      >
                        <Picker.Item label="Argentina (+54)" value="+54" />
                        <Picker.Item label="Brasil (+55)" value="+55" />
                        <Picker.Item label="Chile (+56)" value="+56" />
                        <Picker.Item label="Uruguay (+598)" value="+598" />
                        <Picker.Item label="Paraguay (+595)" value="+595" />
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.phoneContainer}>
                    <Text style={styles.label}>Número de Teléfono</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Tu teléfono"
                      placeholderTextColor={colors.brandGray}
                      value={formData.phone}
                      onChangeText={(value) => handleInputChange('phone', value)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={colors.brandGray}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.brandGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!isLogin && (
              <View style={styles.termsContainer}>
                <Switch
                  value={termsAccepted}
                  onValueChange={setTermsAccepted}
                  thumbColor={termsAccepted ? colors.brandGold : colors.brandGray}
                  trackColor={{ false: colors.brandDarkSecondary, true: colors.brandGold }}
                />
                <Text style={styles.termsText}>
                  Acepto los Términos y Condiciones y la Política de Privacidad.
                </Text>
              </View>
            )}

            <Button
              title={loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={{ marginTop: 20, alignItems: 'center' }}
          >
            <Text style={{ color: colors.brandGray, textDecorationLine: 'underline' }}>
              {isLogin
                ? '¿No tienes cuenta? Regístrate'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
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
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginContainer: {
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 12,
    padding: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.brandGold,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.brandLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  socialButtons: {
    marginBottom: 24,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: colors.googleBlue,
  },
  facebookButton: {
    backgroundColor: colors.facebookBlue,
  },
  socialButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerText: {
    fontSize: 12,
    color: colors.brandGray,
    textAlign: 'center',
  },
  form: {
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.brandLight,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.brandDark,
    borderWidth: 1,
    borderColor: colors.brandGray,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: colors.brandLight,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 12,
    color: colors.brandGray,
    marginLeft: 8,
    flex: 1,
  },
  phoneGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  countryCodeContainer: {
    flex: 2,
  },
  phoneContainer: {
    flex: 3,
  },
  pickerContainer: {
    backgroundColor: colors.brandDark,
    borderWidth: 1,
    borderColor: colors.brandGray,
    borderRadius: 6,
  },
  picker: {
    color: colors.brandLight,
    height: 48,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    color: colors.brandGray,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
  },
});
