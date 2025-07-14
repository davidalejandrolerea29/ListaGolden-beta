import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandDark,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.brandDark,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.brandDarkSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonPrimary: {
    backgroundColor: colors.brandGold,
  },
  buttonSecondary: {
    backgroundColor: colors.brandGray,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.brandGold,
    backgroundColor: colors.transparent,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextPrimary: {
    color: colors.brandDark,
  },
  buttonTextSecondary: {
    color: colors.brandDark,
  },
  buttonTextOutline: {
    color: colors.brandGold,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.brandGold,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: colors.brandLight,
    lineHeight: 24,
  },
  textGray: {
    color: colors.brandGray,
  },
  textCenter: {
    textAlign: 'center',
  },
  mb4: {
    marginBottom: 16,
  },
  mt4: {
    marginTop: 16,
  },
  p4: {
    padding: 16,
  },
});