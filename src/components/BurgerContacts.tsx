import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';
import { stores } from '@/stores';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import logoImage from '../assets/images/logo_drawer.png';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.72;

// Custom Outline Icons matching screenshot
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const SearchIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={11} cy={11} r={8} />
    <Line x1={21} y1={21} x2={16.65} y2={16.65} />
  </Svg>
);

const OrdersIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <Line x1={3} y1={6} x2={21} y2={6} />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const OffersIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <Circle cx={7} cy={7} r={1} />
  </Svg>
);

const FavouritesIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

const WalletIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h14v4" />
    <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
    <Rect x={14} y={11} width={8} height={4} rx={1} />
  </Svg>
);

const ProfileIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx={12} cy={7} r={4} />
  </Svg>
);

const HelpIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <Line x1={12} y1={7} x2={12} y2={13} />
    <Line x1={9} y1={10} x2={15} y2={10} />
  </Svg>
);

const SettingsIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={3} />
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const BurgerContacts: React.FC = () => {
  const { visible, setVisible } = stores.useModalStore();
  const { navigate, location } = hooks.useRouter();
  const { showToast } = stores.useToastStore();

  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const menuItems = [
    { label: 'Home', route: constants.routes.HOME, icon: HomeIcon },
    { label: 'Search', route: constants.routes.SHOP, icon: SearchIcon },
    { label: 'Orders', route: constants.routes.ORDER_HISTORY, icon: OrdersIcon },
    { label: 'Offers', route: constants.routes.MY_PROMOCODES, icon: OffersIcon },
    { label: 'Favourites', route: constants.routes.WISHLIST, icon: FavouritesIcon },
    { label: 'Wallet', route: 'wallet', icon: WalletIcon },
    { label: 'Profile', route: constants.routes.PROFILE, icon: ProfileIcon },
    { label: 'Help & Support', route: constants.routes.FAQ, icon: HelpIcon },
    { label: 'Settings', route: constants.routes.PROFILE, icon: SettingsIcon },
  ];

  const handlePress = (route: string) => {
    setVisible(false);
    if (route === 'wallet') {
      showToast('Veg Dash Wallet is currently at full balance! ₹250');
    } else {
      navigate(route);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        {/* Transparent Backdrop to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setVisible(false)} />

        {/* Animated Left Side Drawer */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Menu Items */}
          <ScrollView contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isHomeActive = item.label === 'Home' && location.pathname === constants.routes.HOME;
              const isItemActive = isHomeActive || (item.route !== 'wallet' && location.pathname === item.route);

              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, isItemActive && styles.menuItemActive]}
                  onPress={() => handlePress(item.route)}
                  activeOpacity={0.8}
                >
                  <Icon color="#FFFFFF" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Tagline Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>💚 100% VEG. 100% GOOD.</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#0F5B35',
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 0 },
  },
  logoContainer: {
    paddingLeft: 12,
    marginBottom: 15,
    marginTop: 10,
  },
  logo: { width: 260, height: 104 },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 14,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
  },
  footer: {
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
