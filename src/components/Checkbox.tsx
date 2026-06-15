import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { constants } from '@/constants';

type Props = {
  checked?: boolean;
};

export const Checkbox: React.FC<Props> = ({ checked }) => {
  return (
    <View
      style={{
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: constants.colors.SEA_GREEN_COLOR,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked && (
        <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={constants.colors.SEA_GREEN_COLOR} strokeWidth={3}>
          <Polyline points="20 6 9 17 4 12" />
        </Svg>
      )}
    </View>
  );
};
