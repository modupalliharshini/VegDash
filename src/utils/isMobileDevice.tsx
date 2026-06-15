import { Platform } from 'react-native';

// In React Native, we're always on a mobile device
export const isMobileDevice = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};
