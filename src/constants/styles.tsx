import { Platform } from 'react-native';

// React Native uses platform-specific shadow properties instead of CSS boxShadow
const boxShadow = Platform.select({
  ios: {
    shadowColor: '#D3D1D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  android: {
    elevation: 3,
  },
  default: {},
}) as Record<string, any>;

export const styles = {
  boxShadow,
};
