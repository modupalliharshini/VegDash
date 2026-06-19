import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';

export const NotificationItem: React.FC<{ notification: any }> = ({ notification }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(11, 77, 58, 0.1)' }]}>
        <Text style={{ fontSize: 16 }}>🔔</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message || notification.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: theme.colors.primaryText,
    fontWeight: 'bold',
    marginBottom: 3,
    fontFamily: 'Inter',
  },
  message: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    fontFamily: 'Inter',
    lineHeight: 16,
  },
});
