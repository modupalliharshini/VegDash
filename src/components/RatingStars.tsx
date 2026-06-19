import { theme } from '@/theme/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

type Props = { value: number; maxValue?: number };

export const RatingStars: React.FC<Props> = ({ value, maxValue = 5 }) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxValue }).map((_, i) => (
        <Svg key={i} width={16} height={16} viewBox="0 0 24 24" fill={i < value ? '#FFC700' : theme.colors.border} stroke={i < value ? '#FFC700' : theme.colors.border} strokeWidth={1}>
          <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </Svg>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
