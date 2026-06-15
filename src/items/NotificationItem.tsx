import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {constants} from '@/constants';

type Props = {
  notification: any; // Replace 'any' with the actual type of your notification
};

export const NotificationItem: React.FC<Props> = ({notification}) => {
  const Icon = notification.icon;
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: notification.iconBg }]}>
        <Icon width={24} color={notification.iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={styles.title}
          numberOfLines={1}
        >
          {notification.title}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.message}
        >
          {notification.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ECECEC',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#1E2022',
    fontWeight: 'bold',
    marginBottom: 3,
    fontFamily: 'Outfit',
  },
  message: {
    fontSize: 14,
    color: constants.colors.TEXT_COLOR,
  },
});
