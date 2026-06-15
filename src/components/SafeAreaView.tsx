import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

type SafeAreaViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ children, style }) => {
  return (
    <RNSafeAreaView style={[{ flex: 1, backgroundColor: '#FFFFFF' }, style]}>
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </RNSafeAreaView>
  );
};
