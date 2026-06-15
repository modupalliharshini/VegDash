import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = { fillColor?: string; strokeColor?: string };

export const InWishlist: React.FC<Props> = ({ fillColor = '#FE2121', strokeColor = '#000' }) => (
  <Svg width={24} height={22} viewBox="0 0 24 22" fill="none">
    <Path
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={1.399}
      d="M23.021 6.317c0 1.938-.868 3.756-2.539 5.8-1.678 2.053-4.091 4.245-7.063 6.946l-1.197 1.086-1.199-1.086c-2.974-2.7-5.387-4.892-7.064-6.944-1.67-2.043-2.537-3.861-2.537-5.802l-.001-.008A5.556 5.556 0 0 1 7.039.693h.003a6.2 6.2 0 0 1 4.65 2.154l.53.615.53-.615A6.201 6.201 0 0 1 17.403.693h.002a5.556 5.556 0 0 1 5.617 5.616v.008Z"
    />
  </Svg>
);
