import { Platform } from 'react-native';
import { MOCK_USER_PROFILE, MOCK_USER_KEYS } from '../constants/mockData';

// Simple mock storage for demo purposes
// In a real app, you'd use AsyncStorage or another persistence solution
let storage: Record<string, any> = {};

export const storeData = async (key: string, value: any): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('localStorage not available:', error);
      storage[key] = value;
    }
  } else {
    storage[key] = value;
  }
};

export const getData = async (key: string): Promise<any> => {
  if (Platform.OS === 'web') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return storage[key] || null;
    }
  } else {
    return storage[key] || null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      delete storage[key];
    }
  } else {
    delete storage[key];
  }
};