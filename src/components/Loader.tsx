import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { constants } from '@/constants';

export const Loader: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={constants.colors.SEA_GREEN_COLOR} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
