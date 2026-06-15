import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SafeAreaInsetBottom: React.FC = () => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom }} />;
};
