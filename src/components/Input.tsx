import { theme } from '@/theme/theme';
import React from 'react';
import { View, TextInput, ViewStyle } from 'react-native';
import { constants } from '@/constants';

type Props = {
  placeholder?: string;
  value?: string;
  inputType?: 'text' | 'password';
  containerStyle?: ViewStyle;
  onChangeText?: (text: string) => void;
  isValid?: boolean;
  onClick?: () => void;
};

export const Input: React.FC<Props> = ({
  placeholder,
  containerStyle,
  value,
  inputType = 'text',
  onChangeText,
}) => {
  return (
    <View
      style={[
        {
          backgroundColor: constants.colors.LIGHT_GRAY_COLOR,
          width: '100%',
          borderRadius: 12,
          height: 52,
          paddingHorizontal: 20,
          borderWidth: 1.5,
          borderColor: theme.colors.border,
          flexDirection: 'row',
          alignItems: 'center',
        },
        containerStyle,
      ]}
    >
      <TextInput
        secureTextEntry={inputType === 'password'}
        placeholder={placeholder}
        value={value || ''}
        onChangeText={onChangeText}
        placeholderTextColor={theme.colors.lightText}
        style={{
          flex: 1,
          fontSize: 14,
          color: constants.colors.MAIN_DARK_COLOR,
          fontFamily: 'Outfit',
          height: '100%',
        }}
      />
    </View>
  );
};
