import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { theme } from '@/theme/theme';

// ... other imports remain unchanged

type HeaderProps = {
  title: string;
  showGoBack?: boolean;
  showBasket?: boolean;
  showBurger?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
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
        backgroundColor: theme.colors.pureWhite,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.warmWhite,
      }}
    >
      {/* Left: Burger or Back */}
      <View style={{ width: 50, alignItems: 'flex-start' }}>
        {showBurger && (
          <TouchableOpacity onPress={() => setVisible(true)} style={{ padding: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <Line x1={3} y1={12} x2={21} y2={12} />
              <Line x1={3} y1={6} x2={21} y2={6} />
              <Line x1={3} y1={18} x2={21} y2={18} />
            </Svg>
          </TouchableOpacity>
        )}
        {showGoBack && (
          <TouchableOpacity onPress={() => navigate(-1)} style={{ padding: 8 }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
              <Line x1={19} y1={12} x2={5} y2={12} />
              <Polyline points="12 19 5 12 12 5" />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Title */}
      <Text style={{ fontSize: 17, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' }}>
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
              backgroundColor: theme.colors.gold,
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
