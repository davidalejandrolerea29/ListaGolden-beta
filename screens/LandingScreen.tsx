import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';

interface LandingScreenProps {
  navigation: any;
}

export default function LandingScreen({ navigation }: LandingScreenProps) {
  const [keyScale] = useState(new Animated.Value(0.7));
  const [contentOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    // Key animation
    Animated.timing(keyScale, {
      toValue: 1.05,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Content fade in
    setTimeout(() => {
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 700);
  }, []);

  const handleContinue = () => {
    navigation.navigate('Auth');
  };

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.container]}>
      <View style={styles.main}>
        <View style={styles.contentWrapper}>
          <View style={styles.imageContainer}>
            <Animated.View style={{ transform: [{ scale: keyScale }] }}>
               <Image
    source={require('../assets/images/listaicon2.jpeg')}
    style={styles.keyImage}
    resizeMode="contain"
  />
            </Animated.View>
          </View>
          
          <Animated.View style={[styles.textContainer, { opacity: contentOpacity }]}>
            <Text style={styles.title}>Desbloquea un mundo de beneficios</Text>
            <Text style={styles.subtitle}>
              Tu llave a descuentos exclusivos en gastronomía, hotelería y entretenimiento.
            </Text>
          </Animated.View>
        </View>
      </View>

      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 16,
  },
  contentWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    marginBottom: 32,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  keyImage: {
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.goldenText,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1d5db',
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    width: '100%',
  },
  continueButton: {
    backgroundColor: colors.goldenText,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: colors.goldenText,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});