import { useEffect } from 'react';
import { StatusBar } from 'react-native';

// In React Native, we use StatusBar to set the status bar color
// instead of manipulating the DOM meta tag.
export const useThemeColor = (color: string) => {
  useEffect(() => {
    StatusBar.setBackgroundColor?.(color);
  }, [color]);
};
