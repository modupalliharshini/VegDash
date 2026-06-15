import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type Props = { rating: number };

export const Rating: React.FC<Props> = ({ rating }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Svg key={star} width={10} height={10} viewBox="0 0 10 10" fill={rating >= star ? '#FFCA40' : '#fff'}>
        <Path
          stroke="#FFCA40"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m5 .833 1.288 2.609 2.879.42-2.084 2.03.492 2.866L5 7.404 2.425 8.758l.492-2.866-2.084-2.03 2.88-.42L5 .833Z"
        />
      </Svg>
    ))}
  </View>
);
