import React from 'react';
import { View } from 'react-native';

// MotionWrapper: simple passthrough in React Native
// Animations can be added via Animated API if needed
export const MotionWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={{ flex: 1 }}>
    {children}
  </View>
);
