import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { constants } from '@/constants';

type Props = { text: string };

export const BlockHeading: React.FC<Props> = ({ text }) => (
  <Text style={styles.heading}>{text}</Text>
);

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: constants.colors.MAIN_DARK_COLOR,
    marginBottom: 16,
    fontFamily: 'Outfit',
  },
});
