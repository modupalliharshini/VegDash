import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { constants } from '@/constants';

type Props = {
  label: string;
  onClick?: () => void;
  colorScheme?: 'primary' | 'secondary';
  containerStyle?: ViewStyle;
};

export const Button: React.FC<Props> = ({
  label,
  onClick,
  containerStyle,
  colorScheme = 'primary',
}) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: colorScheme === 'primary' ? constants.colors.SEA_GREEN_COLOR : '#E8F9F1',
          width: '100%',
          borderRadius: 10,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
        },
        containerStyle,
      ]}
    >
      <Text
        style={{
          fontWeight: '700',
          color: colorScheme === 'primary' ? '#fff' : constants.colors.SEA_GREEN_COLOR,
          fontSize: 16,
          textTransform: 'capitalize',
          fontFamily: 'Outfit',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
