// src/components/Accordion.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  initialExpanded?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, initialExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {isExpanded ? (
          <ChevronUp size={20} color={colors.white} /> // Aseguramos color blanco para el ícono
        ) : (
          <ChevronDown size={20} color={colors.white} /> // Aseguramos color blanco para el ícono
        )}
      </TouchableOpacity>
      {isExpanded && <View style={styles.content}>{children}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.brandGold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: colors.brandDarkSecondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.brandGray,
  },
  title: {
    fontSize: 15,
    color: colors.white, // **CAMBIO: Título del acordeón a blanco**
  },
  content: {
    padding: 15,
    backgroundColor: colors.brandDarkSecondary,
  },
});