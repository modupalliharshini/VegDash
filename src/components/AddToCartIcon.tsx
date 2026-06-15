import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { constants } from '@/constants';

type Props = { inCart?: boolean };

export const AddToCartIcon: React.FC<Props> = ({ inCart }) => (
  <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
    <Path
      stroke={inCart ? constants.colors.RED_COLOR : '#8A8D9F'}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.5 5.5v6m-3-3h6m4.5 0a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
    />
  </Svg>
);
