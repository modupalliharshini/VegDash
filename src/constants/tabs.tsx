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
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
    <Line x1={3} y1={6} x2={21} y2={6} />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const PrivilegesIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <Path d="M3 20h18" stroke={color} strokeWidth={2.5} />
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
  { id: 4, route: routes.MY_PROMOCODES, icon: PrivilegesIcon, name: 'Privileges' },
  { id: 5, route: routes.PROFILE, icon: UserTabIcon, name: 'Profile' },
];
