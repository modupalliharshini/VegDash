import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';
import { theme } from '@/theme/theme';

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
          backgroundColor: colorScheme === 'primary' ? theme.colors.primaryGreen : theme.colors.card,
          width: '100%',
          borderRadius: theme.borderRadius,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          // Apply consistent shadow for web
          ...theme.shadows.boxShadow('#000'),
        },
        containerStyle,
      ]}
    >
      <Text
        style={{
          fontWeight: '700',
          color: colorScheme === 'primary' ? theme.colors.pureWhite : theme.colors.primaryGreen,
          fontSize: 16,
          textTransform: 'capitalize',
          fontFamily: theme.fonts.body,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
