import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hooks } from '../hooks';
import { constants } from '@/constants';
import { stores } from '@/stores';

export const BottomTabBar: React.FC = () => {
  const { location, navigate, params } = hooks.useRouter();
  const insets = useSafeAreaInsets();
  const { list: cart } = stores.useCartStore();
  const { isLoggedIn } = stores.useAuthStore();

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.quantity || 0) * Number(item.price), 0);
  const isCartPage = location.pathname === constants.routes.ORDER;
  const isDetailPage = location.pathname === constants.routes.DISH;

  let activeRoute = location.pathname;
  if (location.pathname === constants.routes.RESTAURANT_MENU || location.pathname === constants.routes.DISH) {
    const routerParams = params as any;
    activeRoute = routerParams?.from || routerParams?.state?.from || constants.routes.HOME;
  }

  return (
    <View style={{ paddingHorizontal: 10, paddingBottom: Math.max(insets.bottom, 6) }}>
      {cart.length > 0 && !isCartPage && !isDetailPage && (
        <TouchableOpacity
          onPress={() => navigate(constants.routes.ORDER)}
          style={{
            backgroundColor: '#0F5B35',
            borderRadius: 16,
            height: 52,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 18,
            marginBottom: 10,
            elevation: 8,
            shadowColor: '#0F5B35',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
          }}
          activeOpacity={0.9}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, fontFamily: 'Outfit' }}>
                🛒 {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
              </Text>
            </View>
            <View style={{ width: 1.5, height: 16, backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15, fontFamily: 'Outfit' }}>
              ₹{totalPrice}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14, fontFamily: 'Outfit' }}>
              View Cart
            </Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>➔</Text>
          </View>
        </TouchableOpacity>
      )}

      <View
        style={{
          backgroundColor: '#0F5B35',
          borderRadius: 25,
          height: 60,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          shadowColor: '#0F5B35',
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        {constants.tabs.map((tab) => {
          const isActive = activeRoute === tab.route;
          const color = isActive ? '#FFFFFF' : '#A6CBB7';
          const Icon = tab.icon;
          const displayName = tab.id === 5 && !isLoggedIn ? 'Login' : tab.name;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => navigate(tab.route)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }}
            >
              <Icon color={color} />
              <Text style={{ fontSize: 9, color, marginTop: 3, fontWeight: isActive ? '600' : '400', letterSpacing: 0.2 }}>
                {displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
