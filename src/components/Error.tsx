import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = { message?: string };

export const Error: React.FC<Props> = ({ message }) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>⚠️</Text>
    <Text style={styles.text}>{message || 'Something went wrong. Please try again.'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 40, marginBottom: 16 },
  text: { fontSize: 16, color: '#7E8B97', textAlign: 'center', fontFamily: 'Outfit' },
});
