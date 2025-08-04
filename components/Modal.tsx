// src/components/Modal.tsx
import React from 'react';
import { View, Text, Modal as RNModal, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'; // Importa Dimensions
import { X } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const { height: screenHeight } = Dimensions.get('window'); // Obtener la altura de la pantalla

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade" // 'fade' es más suave para modales de pantalla completa
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}> {/* Aquí el modalContent, ahora llamado 'modal' */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.brandGray} />
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end', // Esto anclará el modal en la parte inferior
    alignItems: 'center',
    // padding: 20, // Quitamos el padding global del overlay para que el modal pueda ir hasta los bordes
  },
  modal: {
    backgroundColor: colors.brandDarkSecondary,
    borderTopLeftRadius: 12, // Bordes redondeados solo arriba
    borderTopRightRadius: 12,
    padding: 20, // Mantenemos el padding interno para el contenido
    width: '100%', // El modal ocupa todo el ancho
    height: screenHeight * 0.75, // Ocupa el 75% de la altura de la pantalla
    // maxHeight: '80%', // Removemos maxHeight para que la altura definida tenga prioridad
    // maxWidth: 400, // Removemos maxWidth para que ocupe todo el ancho
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.brandGray,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1, // Esto es CRUCIAL para que el contenido dentro del modal se expanda
  },
});