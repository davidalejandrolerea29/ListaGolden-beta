import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KeyRound, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { UserKey, UserKeyStatus } from '../types';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/currency';
import { Button } from './Button';

interface UserKeyCardProps {
  userKey: UserKey;
  onUseKey?: (key: UserKey) => void;
}

export const UserKeyCard: React.FC<UserKeyCardProps> = ({
  userKey,
  onUseKey,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStatus = () => {
    switch (userKey.status) {
      case UserKeyStatus.USED:
        return (
          <View style={[styles.statusContainer, styles.usedStatus]}>
            <CheckCircle2 size={20} color={colors.success} />
            <Text style={[styles.statusText, styles.usedText]}>
              Usado el {formatDate(userKey.dateUsed!)}
            </Text>
          </View>
        );
      case UserKeyStatus.EXPIRED:
        return (
          <View style={[styles.statusContainer, styles.expiredStatus]}>
            <AlertTriangle size={20} color={colors.error} />
            <Text style={[styles.statusText, styles.expiredText]}>Expirado</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderActions = () => {
    if (userKey.status === UserKeyStatus.UNLOCKED && onUseKey) {
      return (
        <Button
          title="Usar Beneficio (Escanear)"
          onPress={() => onUseKey(userKey)}
          style={styles.useButton}
        />
      );
    }
    return null;
  };

  return (
    <View style={[globalStyles.card, styles.card]}>
      <View style={styles.cardTop}>
        <View style={styles.keyIconContainer}>
          <KeyRound size={40} color={colors.brandGold} />
        </View>
        <View style={styles.keyInfo}>
          <Text style={styles.establishmentName}>{userKey.establishmentName}</Text>
          <Text style={styles.categoryPromo}>
            {userKey.establishmentCategory} - {userKey.promoValueDisplay}
          </Text>
          <Text style={styles.date}>
            Activado: {formatDate(userKey.dateActivated)}
          </Text>
          {userKey.savedAmount > 0 && (
            <Text style={styles.savings}>
              Ahorro: {formatCurrency(userKey.savedAmount)}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.statusContent}>
        {renderStatus()}
      </View>
      
      <View style={styles.actions}>
        {renderActions()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandDarkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  keyInfo: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.brandGold,
    marginBottom: 4,
  },
  categoryPromo: {
    fontSize: 14,
    color: colors.brandGray,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.brandLight,
    marginBottom: 2,
  },
  savings: {
    fontSize: 12,
    color: colors.success,
  },
  statusContent: {
    alignItems: 'center',
    marginVertical: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  usedStatus: {},
  usedText: {
    color: colors.success,
  },
  expiredStatus: {},
  expiredText: {
    color: colors.error,
  },
  actions: {
    marginTop: 8,
  },
  useButton: {
    width: '100%',
  },
});