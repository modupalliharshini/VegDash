import { theme } from '@/theme/theme';
import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Animated, Dimensions, Easing, BackHandler } from 'react-native';
import { stores } from '@/stores';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import Svg, { Path, Circle, Line, Polyline, Rect } from 'react-native-svg';
import logoImage from '../assets/images/logo_drawer.png';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.76;

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
  const { user, isLoggedIn } = stores.useAuthStore();

  const [active, setActive] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      setActive(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      if (active) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -DRAWER_WIDTH,
            duration: 150,
            easing: Easing.bezier(0.25, 1, 0.5, 1),
            useNativeDriver: true,
          })
        ]).start(() => {
          setActive(false);
        });
      }
    }
  }, [visible]);

  React.useEffect(() => {
    if (active) {
      const backAction = () => {
        handleClose();
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [active]);

  const handleClose = () => {
    setVisible(false);
  };

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
    handleClose();
    // Delay navigation slightly so the close animation runs completely first
    setTimeout(() => {
      if (route === 'wallet') {
        showToast('Veg Dash Wallet is currently at full balance! ₹250');
      } else {
        navigate(route);
      }
    }, 180);
  };

  if (!active) return null;

  return (
    <View style={styles.overlay}>
      {/* Animated Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Animated Left Side Drawer */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        </View>

        {/* User Profile Info Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {isLoggedIn && user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetter}>
                  {isLoggedIn && user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {isLoggedIn ? user?.name : 'Guest User'}
            </Text>
            <Text style={styles.profileSubText} numberOfLines={1}>
              {isLoggedIn ? user?.email : 'Login to order organic veg foods'}
            </Text>
            {isLoggedIn && (
              <View style={styles.vegBadge}>
                <Text style={styles.vegBadgeText}>🟢 PURE VEG</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Menu Items */}
        <ScrollView contentContainerStyle={styles.menuList} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isHomeActive = item.label === 'Home' && location.pathname === constants.routes.HOME;
            const isItemActive = isHomeActive || (item.route !== 'wallet' && location.pathname === item.route);

            return (
              <View key={item.label}>
                <TouchableOpacity
                  style={[styles.menuItem, isItemActive && styles.menuItemActive]}
                  onPress={() => handlePress(item.route)}
                  activeOpacity={0.7}
                >
                  <Icon color="#FFFFFF" />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  {isItemActive && (
                    <View style={styles.activeIndicator}>
                      <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth={3}>
                        <Polyline points="9 18 15 12 9 6" />
                      </Svg>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Tagline Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>💚 100% VEG. 100% GOOD.</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  backdrop: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: theme.colors.primaryGreen,
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 20,
    shadowColor: '#091E42',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 8, height: 0 },
  },
  logoContainer: {
    paddingLeft: 12,
    marginBottom: 8,
    marginTop: 10,
  },
  logo: { width: 220, height: 88 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    marginVertical: 10,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFD600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primaryGreen,
    fontFamily: 'Outfit',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: theme.colors.primaryGreen,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
  },
  profileSubText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
    fontFamily: 'Outfit',
    marginTop: 1,
  },
  vegBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vegBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#81C784',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
    marginHorizontal: 4,
  },
  menuList: {
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 14,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderLeftColor: '#FFD600',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
  },
  activeIndicator: {
    marginLeft: 'auto',
    paddingRight: 4,
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
