import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';

type Props = {
  title?: string;
  showBasket?: boolean;
  showGoBack?: boolean;
  showBurger?: boolean;
};

export const Header: React.FC<Props> = ({
  title,
  showGoBack,
  showBasket,
  showBurger,
}) => {
  const { navigate } = hooks.useRouter();
  const { total, list: cart } = stores.useCartStore();
  const { setVisible } = stores.useModalStore();

  return (
    <View
      style={{
        height: constants.sizes.HEADER_HEIGHT,
        backgroundColor: constants.colors.WHITE_COLOR,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F5',
      }}
    >
      {/* Left: Burger or Back */}
      <View style={{ width: 50, alignItems: 'flex-start' }}>
        {showBurger && (
          <TouchableOpacity onPress={() => setVisible(true)} style={{ padding: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={constants.colors.MAIN_DARK_COLOR} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <Line x1={3} y1={12} x2={21} y2={12} />
              <Line x1={3} y1={6} x2={21} y2={6} />
              <Line x1={3} y1={18} x2={21} y2={18} />
            </Svg>
          </TouchableOpacity>
        )}
        {showGoBack && (
          <TouchableOpacity onPress={() => navigate(-1)} style={{ padding: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={constants.colors.MAIN_DARK_COLOR} strokeWidth={2.5}>
              <Line x1={19} y1={12} x2={5} y2={12} />
              <Polyline points="12 19 5 12 12 5" />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title */}
      <Text style={{ fontSize: 17, fontWeight: '700', color: constants.colors.MAIN_DARK_COLOR, fontFamily: 'Outfit' }}>
        {title}
      </Text>

      {/* Right: Basket or empty spacer */}
      <View style={{ width: 50, alignItems: 'flex-end' }}>
        {showBasket && (
          <TouchableOpacity
            onPress={() => {
              if (cart.length > 0) navigate(constants.routes.ORDER);
            }}
            style={{ padding: 8 }}
          >
            <View style={{
              backgroundColor: constants.colors.RED_COLOR,
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                ${total > 0 ? total.toFixed(2) : '0'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
