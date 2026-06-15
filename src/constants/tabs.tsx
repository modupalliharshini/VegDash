import React from 'react';
import Svg, { Circle, Line, Path, Rect, Polyline } from 'react-native-svg';
import { routes } from './routes';

const HomeTabIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const SearchIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={11} cy={11} r={8} />
    <Line x1={21} y1={21} x2={16.65} y2={16.65} />
  </Svg>
);

const OrdersIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <Rect x={8} y={2} width={8} height={4} rx={1} />
    <Line x1={9} y1={9} x2={15} y2={9} />
    <Line x1={9} y1={13} x2={15} y2={13} />
    <Line x1={9} y1={17} x2={15} y2={17} />
  </Svg>
);

const OffersIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Line x1={19} y1={5} x2={5} y2={19} />
    <Circle cx={6.5} cy={6.5} r={2.5} />
    <Circle cx={17.5} cy={17.5} r={2.5} />
  </Svg>
);

const UserTabIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

export const tabs = [
  { id: 1, route: routes.HOME, icon: HomeTabIcon, name: 'Home' },
  { id: 2, route: routes.SHOP, icon: SearchIcon, name: 'Search' },
  { id: 3, route: routes.ORDER_HISTORY, icon: OrdersIcon, name: 'Orders' },
  { id: 4, route: routes.MY_PROMOCODES, icon: OffersIcon, name: 'Offers' },
  { id: 5, route: routes.PROFILE, icon: UserTabIcon, name: 'Profile' },
];
