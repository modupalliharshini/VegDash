import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hooks } from '../hooks';
import { constants } from '@/constants';
import { stores } from '@/stores';
import { theme } from '@/theme/theme';

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

  const isHomeRoute = activeRoute === constants.routes.HOME;

  return (
    <View style={{ paddingHorizontal: 10, paddingBottom: Math.max(insets.bottom, 6), width: '100%' }}>
      {cart.length > 0 && !isCartPage && !isDetailPage && (
        <View style={{ paddingHorizontal: 10, marginBottom: 10 }}>
          <TouchableOpacity
            onPress={() => navigate(constants.routes.ORDER)}
            style={{
              backgroundColor: theme.colors.darkGreen,
              borderRadius: 16,
              height: 52,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 18,
              elevation: 8,
              ...theme.shadows.boxShadow(theme.colors.darkGreen),
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
        </View>
      )}

      <View
        style={{
          backgroundColor: '#0A3B2E',
          borderRadius: 25,
          height: 60,
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          elevation: 8,
          ...theme.shadows.boxShadow('#0A3B2E'),
        }}
      >
        {constants.tabs.map((tab) => {
          const isActive = activeRoute === tab.route;
          
          const color = isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)';

          const Icon = tab.icon;
          const displayName = tab.id === 5 && !isLoggedIn ? 'Login' : tab.name;
          
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => navigate(tab.route)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon color={color} />
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    color,
                    marginTop: 3,
                    fontWeight: isActive ? '700' : '500',
                    fontFamily: 'Inter',
                    letterSpacing: 0.1,
                    flexShrink: 0,
                  }}
                >
                  {displayName}
                </Text>
                {isActive && (
                  <View 
                    style={{
                      height: 2.5,
                      width: 18,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 1.5,
                      marginTop: 3.5,
                      position: 'absolute',
                      bottom: -8,
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
