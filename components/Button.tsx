import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [globalStyles.button, globalStyles.buttonSecondary];
      case 'outline':
        return [globalStyles.button, globalStyles.buttonOutline];
      default:
        return [globalStyles.button, globalStyles.buttonPrimary];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [globalStyles.buttonText, globalStyles.buttonTextSecondary];
      case 'outline':
        return [globalStyles.buttonText, globalStyles.buttonTextOutline];
      default:
        return [globalStyles.buttonText, globalStyles.buttonTextPrimary];
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={[...getTextStyle(), icon && styles.textWithIcon, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  textWithIcon: {
    marginLeft: 8,
  },
});