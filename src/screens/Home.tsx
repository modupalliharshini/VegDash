import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Modal, TextInput, Alert, Dimensions, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { stores } from '@/stores';
import { restaurantService } from '@/services/restaurantService';
import { searchService } from '@/services/searchService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.72; // Occupies ~3/4ths of the screen

const RaysBackground: React.FC<{ style?: any }> = ({ style }) => {
  return (
    <Svg width="200%" height="200%" viewBox="0 0 200 200" style={style}>
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 100 + 150 * Math.cos(angle - 0.16);
        const y1 = 100 + 150 * Math.sin(angle - 0.16);
        const x2 = 100 + 150 * Math.cos(angle + 0.16);
        const y2 = 100 + 150 * Math.sin(angle + 0.16);
        return (
          <Path
            key={i}
            d={`M 100 100 L ${x1} ${y1} L ${x2} ${y2} Z`}
            fill="rgba(255, 255, 255, 0.12)"
          />
        );
      })}
    </Svg>
  );
};

const CouponIcon: React.FC<{ style?: any }> = ({ style }) => (
  <Svg width={24} height={15} viewBox="0 0 28 18" style={style}>
    <Path
      d="M2 0 C0.9 0 0 0.9 0 2 V5 C1.1 5 2 5.9 2 7 C2 8.1 1.1 9 0 9 V12 C0 13.1 0.9 14 2 14 V16 C2 17.1 2.9 18 4 18 H24 C25.1 18 26 17.1 26 16 V14 C27.1 14 28 13.1 28 12 V9 C26.9 9 26 8.1 26 7 C26 5.9 26.9 5 28 5 V2 C28 0.9 27.1 0 26 0 H4 Z"
      fill="#FFD600"
    />
    <Path d="M 6 3 L 6 15" stroke="#E6B800" strokeWidth={1} strokeDasharray="2,2" />
    <Circle cx={16} cy={9} r={2} fill="#E6B800" />
    <Line x1={13} y1={12} x2={19} y2={6} stroke="#E6B800" strokeWidth={1.5} />
    <Circle cx={14} cy={7} r={1} fill="#E6B800" />
    <Circle cx={18} cy={11} r={1} fill="#E6B800" />
  </Svg>
);

export const Home: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { setVisible } = stores.useModalStore();
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [mustTryDishes, setMustTryDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cart Badge state
  const { list: cart } = stores.useCartStore();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Location selector state
  const [locationText, setLocationText] = useState('Gachibowli, Hyderabad');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [simulatedCoords, setSimulatedCoords] = useState({ lat: 17.4485, lng: 78.3741 });

  // Safe area
  const insets = useSafeAreaInsets();
  const [isHeaderDark, setIsHeaderDark] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Animated values
  const scrollX = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textPulseAnim = useRef(new Animated.Value(0)).current;

  // Slide 1 Bobbing & Rotation
  const bobAnim1 = useRef(new Animated.Value(0)).current;
  const bobAnim2 = useRef(new Animated.Value(0)).current;
  
  // Slide 2 Floating X/Y
  const orbitX1 = useRef(new Animated.Value(0)).current;
  const orbitY1 = useRef(new Animated.Value(0)).current;
  const orbitX2 = useRef(new Animated.Value(0)).current;
  const orbitY2 = useRef(new Animated.Value(0)).current;

  // Slide 3 Scale & Swing
  const scale3_1 = useRef(new Animated.Value(0)).current;
  const scale3_2 = useRef(new Animated.Value(0)).current;
  const swing3_1 = useRef(new Animated.Value(0)).current;
  const swing3_2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Starburst ray rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Slide 1 Bobbing
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim1, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bobAnim1, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim2, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bobAnim2, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Slide 2 Floating X/Y (complex drift)
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbitX1, { toValue: 1, duration: 3400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbitX1, { toValue: 0, duration: 3400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbitY1, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbitY1, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbitX2, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbitX2, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbitY2, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orbitY2, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Slide 3 Scale & Swing
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale3_1, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale3_1, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scale3_2, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale3_2, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(swing3_1, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(swing3_1, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(swing3_2, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(swing3_2, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Text Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(textPulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(textPulseAnim, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Slide 1 Interpolations
  const translateY1 = bobAnim1.interpolate({ inputRange: [0, 1], outputRange: [-5, 7] });
  const rotatePlate1 = bobAnim1.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] });
  const translateY2 = bobAnim2.interpolate({ inputRange: [0, 1], outputRange: [7, -7] });
  const rotatePlate2 = bobAnim2.interpolate({ inputRange: [0, 1], outputRange: ['7deg', '-3deg'] });

  // Slide 2 Interpolations
  const translate2_1X = orbitX1.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] });
  const translate2_1Y = orbitY1.interpolate({ inputRange: [0, 1], outputRange: [-6, 6] });
  const translate2_2X = orbitX2.interpolate({ inputRange: [0, 1], outputRange: [8, -8] });
  const translate2_2Y = orbitY2.interpolate({ inputRange: [0, 1], outputRange: [5, -10] });

  // Slide 3 Interpolations
  const scale3_1Val = scale3_1.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] });
  const scale3_2Val = scale3_2.interpolate({ inputRange: [0, 1], outputRange: [1.04, 0.96] });
  const swing3_1Val = swing3_1.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] });
  const swing3_2Val = swing3_2.interpolate({ inputRange: [0, 1], outputRange: ['10deg', '-6deg'] });

  // Common interpolations
  const rotateInterpolate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const textScale = textPulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.02] });

  // Dynamic Background color based on scrollX
  const bannerBgColor = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2],
    outputRange: ['#0F5B35', '#C28E00', '#BF360C'],
    extrapolate: 'clamp',
  });

  // Fetch location on mount
  useEffect(() => {
    const loadStoredLocation = async () => {
      try {
        const stored = await AsyncStorage.getItem('vegdash_user_location');
        if (stored) {
          setLocationText(stored);
        }
      } catch (_) {}
    };
    loadStoredLocation();
  }, []);

  const handleGetLiveLocation = () => {
    setFetchingLocation(true);
    let count = 0;
    const interval = setInterval(() => {
      setSimulatedCoords({
        lat: 17.42 + Math.random() * 0.04,
        lng: 78.35 + Math.random() * 0.04
      });
      count++;
      if (count >= 8) {
        clearInterval(interval);
      }
    }, 150);

    setTimeout(async () => {
      const addresses = [
        '506, Road No. 36, Jubilee Hills, Hyderabad',
        'Flat 12B, Block A, My Home Bhooja, Hitec City, Hyderabad',
        'Villa 22, Rainbow Vistas, Moosapet, Hyderabad',
        'Plot 45, DLF Cyber City, Gachibowli, Hyderabad',
        'Street No. 4, Czech Colony, Sanath Nagar, Hyderabad'
      ];
      const selected = addresses[Math.floor(Math.random() * addresses.length)];
      setLocationText(selected);
      await AsyncStorage.setItem('vegdash_user_location', selected);
      setFetchingLocation(false);
      setShowLocationModal(false);
    }, 1500);
  };

  const handleSaveManualLocation = async () => {
    if (!manualLocation.trim()) {
      Alert.alert('Error', 'Please enter a valid address');
      return;
    }
    setLocationText(manualLocation);
    await AsyncStorage.setItem('vegdash_user_location', manualLocation);
    setManualLocation('');
    setShowLocationModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resList, trendingData] = await Promise.all([
          restaurantService.getRestaurants(),
          searchService.getTrending(),
        ]);
        setRestaurants(resList || []);
        setMustTryDishes((trendingData?.popularItems || []).slice(0, 4));
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY > 60) {
      setIsHeaderDark(true);
    } else {
      setIsHeaderDark(false);
    }
  };

  const handleCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const xOffset = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(xOffset / SCREEN_WIDTH);
        if (pageIndex !== activeSlide) {
          setActiveSlide(pageIndex);
        }
      },
    }
  );

  const categories = [
    { name: 'All', icon: '🍽️' },
    { name: 'Pure Vegetarian Restaurants', icon: '🟢' },
    { name: 'Jain Food', icon: '🍛' },
    { name: 'Satvik Meals', icon: '🥛' },
    { name: 'Healthy Foods', icon: '🥗' },
    { name: 'Organic Food Partners', icon: '🌱' },
    { name: 'Temple Prasadam Deliveries', icon: '🛕' },
  ];

  const offers = [
    { code: 'VEGDASH50', title: '50% OFF up to ₹100', desc: 'Use code: VEGDASH50', bgColor: '#0F5B35' },
    { code: 'VEGDASH100', title: 'Flat ₹100 OFF', desc: 'Use code: VEGDASH100', bgColor: '#C28E00' },
    { code: 'JAIN25', title: '25% OFF Jain Food', desc: 'Use code: JAIN25', bgColor: '#BF360C' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style={isHeaderDark ? 'dark' : 'light'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Animated Carousel Banner Container */}
        <Animated.View style={[styles.bannerContainer, { height: BANNER_HEIGHT, paddingTop: insets.top + 8, backgroundColor: bannerBgColor }]}>
          {/* Animated Ray Background */}
          <Animated.View style={[styles.raysWrapper, { transform: [{ rotate: rotateInterpolate }] }]}>
            <RaysBackground />
          </Animated.View>

          {/* Unified Location Selector + Header Row */}
          <View style={styles.bannerHeaderRow}>
            {/* Hamburger button on top left corner */}
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.bannerHeaderBtnLeft}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Line x1={3} y1={12} x2={21} y2={12} /><Line x1={3} y1={6} x2={21} y2={6} /><Line x1={3} y1={18} x2={21} y2={18} />
              </Svg>
            </TouchableOpacity>

            {/* Location in middle */}
            <TouchableOpacity style={styles.bannerLocationBtnMiddle} onPress={() => setShowLocationModal(true)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx={12} cy={10} r={3} />
                </Svg>
                <Text style={styles.bannerLocationTitle} numberOfLines={1}>Work ▾</Text>
              </View>
              <Text style={styles.bannerLocationAddress} numberOfLines={1}>{locationText}</Text>
            </TouchableOpacity>

            {/* Cart & Profile on top right */}
            <View style={styles.bannerHeaderActions}>
              <TouchableOpacity onPress={() => navigate(constants.routes.ORDER)} style={styles.bannerHeaderBtn}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx={9} cy={21} r={1} />
                  <Circle cx={20} cy={21} r={1} />
                  <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </Svg>
                {cartCount > 0 && (
                  <View style={styles.bannerCartBadge}>
                    <Text style={styles.bannerCartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigate(constants.routes.PROFILE)} style={styles.bannerHeaderBtn}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Unified Search Row inside Banner */}
          <TouchableOpacity style={styles.bannerSearchBar} onPress={() => navigate(constants.routes.SHOP)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0F5B35" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx={11} cy={11} r={8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} />
              </Svg>
              <Text style={styles.bannerSearchText} numberOfLines={1}>Search "salad under ₹400"</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#0F5B35" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><Path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
              </Svg>
              <View style={styles.verticalDivider} />
              <View style={styles.vegSwitchContainer}>
                <Text style={styles.vegSwitchText}>VEG</Text>
                <View style={styles.vegSwitchPill}>
                  <View style={styles.vegSwitchDot} />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Slidable Carousel Content */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleCarouselScroll}
            scrollEventThrottle={16}
            style={styles.carouselScrollView}
          >
            {/* Slide 1: 50% OFF (Healthy Salads) */}
            <View style={styles.carouselSlide}>
              <View style={styles.bannerPromoBody}>
                <View style={styles.bannerPromoLeft}>
                  <View style={styles.bannerPromoBadge}>
                    <Text style={styles.bannerPromoBadgeText}>🥗 Fresh & Organic</Text>
                  </View>
                  <Text style={styles.bannerPromoSubtitle}>ITEMS AT</Text>
                  <Animated.View style={{ transform: [{ scale: textScale }] }}>
                    <Text style={styles.bannerPromoTitleText}>50% OFF</Text>
                  </Animated.View>
                  <Text style={styles.bannerPromoDesc} numberOfLines={2}>
                    Crisp salads prepared fresh daily with handpicked organic veggies.
                  </Text>
                  <View style={styles.bannerPromoCodeContainer}>
                    <Text style={styles.bannerPromoCodeText}>Code: VEGDASH50</Text>
                  </View>
                  <TouchableOpacity style={styles.bannerOrderBtn} onPress={() => navigate(constants.routes.SHOP)}>
                    <Text style={styles.bannerOrderBtnText}>Order now ➔</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bannerPromoRight}>
                  {/* Plate 1: Fresh Salad */}
                  <Animated.View style={[styles.plate1Wrapper, { transform: [{ translateY: translateY1 }, { rotate: rotatePlate1 }] }]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=250' }}
                      style={styles.plateImageLarge as any}
                    />
                  </Animated.View>

                  {/* Plate 2: Healthy Salad Bowl */}
                  <Animated.View style={[styles.plate2Wrapper, { transform: [{ translateY: translateY2 }, { rotate: rotatePlate2 }] }]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=250' }}
                      style={styles.plateImageSmall as any}
                    />
                  </Animated.View>
                </View>
              </View>
            </View>

            {/* Slide 2: Flat ₹100 OFF (Veg Biryani & Paneer Cuisines) */}
            <View style={styles.carouselSlide}>
              <View style={styles.bannerPromoBody}>
                <View style={styles.bannerPromoLeft}>
                  <View style={styles.bannerPromoBadge}>
                    <Text style={styles.bannerPromoBadgeText}>🍛 Premium Taste</Text>
                  </View>
                  <Text style={styles.bannerPromoSubtitle}>FLAT ₹100 OFF</Text>
                  <Animated.View style={{ transform: [{ scale: textScale }] }}>
                    <Text style={styles.bannerPromoTitleText2}>MIN ₹250</Text>
                  </Animated.View>
                  <Text style={styles.bannerPromoDesc} numberOfLines={2}>
                    Aromatic long-grain basmati biryanis & rich, fresh paneer curries.
                  </Text>
                  <View style={styles.bannerPromoCodeContainer}>
                    <Text style={styles.bannerPromoCodeText}>Code: VEGDASH100</Text>
                  </View>
                  <TouchableOpacity style={styles.bannerOrderBtn} onPress={() => navigate(constants.routes.MY_PROMOCODES)}>
                    <Text style={styles.bannerOrderBtnText}>Grab Offer ➔</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bannerPromoRight}>
                  {/* Plate 1: Veg Biryani */}
                  <Animated.View style={[styles.plate1Wrapper, { transform: [{ translateX: translate2_1X }, { translateY: translate2_1Y }] }]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=250' }}
                      style={styles.plateImageLarge as any}
                    />
                  </Animated.View>

                  {/* Plate 2: Paneer Curry */}
                  <Animated.View style={[styles.plate2Wrapper, { transform: [{ translateX: translate2_2X }, { translateY: translate2_2Y }] }]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=250' }}
                      style={styles.plateImageSmall as any}
                    />
                  </Animated.View>
                </View>
              </View>
            </View>

            {/* Slide 3: 25% OFF Jain Food (Dal/Satvik Meals) */}
            <View style={styles.carouselSlide}>
              <View style={styles.bannerPromoBody}>
                <View style={styles.bannerPromoLeft}>
                  <View style={styles.bannerPromoBadge}>
                    <Text style={styles.bannerPromoBadgeText}>🟢 Strict Satvik</Text>
                  </View>
                  <Text style={styles.bannerPromoSubtitle}>JAIN SPECIAL</Text>
                  <Animated.View style={{ transform: [{ scale: textScale }] }}>
                    <Text style={styles.bannerPromoTitleText2}>25% OFF</Text>
                  </Animated.View>
                  <Text style={styles.bannerPromoDesc} numberOfLines={2}>
                    Prepared without root veg, onion or garlic. Traditional Jain rules.
                  </Text>
                  <View style={styles.bannerPromoCodeContainer}>
                    <Text style={styles.bannerPromoCodeText}>Code: JAIN25</Text>
                  </View>
                  <TouchableOpacity style={styles.bannerOrderBtn} onPress={() => navigate(constants.routes.SHOP, { state: { category: 'Jain Food' } })}>
                    <Text style={styles.bannerOrderBtnText}>Explore Menu ➔</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.bannerPromoRight}>
                  {/* Plate 1: Jain Thali */}
                  <Animated.View style={[styles.plate1Wrapper, { transform: [{ scale: scale3_1Val }, { rotate: swing3_1Val }] }]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=250' }}
                      style={styles.plateImageLarge as any}
                    />
                  </Animated.View>

                  {/* Plate 2: Satvik Thali snack */}
                  <Animated.View style={[styles.plate2Wrapper, { transform: [{ scale: scale3_2Val }, { rotate: swing3_2Val }] }]}>
                    <Image
                      source={{ uri: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=250' }}
                      style={styles.plateImageSmall as any}
                    />
                  </Animated.View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Pager Dots Indicator */}
          <View style={styles.bannerDotsContainer}>
            <View style={[styles.bannerDot, activeSlide === 0 && styles.bannerDotActive]} />
            <View style={[styles.bannerDot, activeSlide === 1 && styles.bannerDotActive]} />
            <View style={[styles.bannerDot, activeSlide === 2 && styles.bannerDotActive]} />
          </View>
        </Animated.View>

        {/* Categories / Cuisines (Now first section below banner) */}
        <View style={styles.sectionHeaderUnderBanner}>
          <Text style={styles.sectionTitle}>Explore Cuisines</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, gap: 10 }}>
          {categories.map((cat) => {
            const isActive = cat.name === activeCategory;
            return (
              <TouchableOpacity
                key={cat.name}
                onPress={() => {
                  setActiveCategory(cat.name);
                  if (cat.name !== 'All') {
                    navigate(constants.routes.SHOP, { state: { category: cat.name } });
                  }
                }}
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Offers For You Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers For You</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, gap: 14, marginBottom: 25 }}>
          {offers.map((offer) => (
            <TouchableOpacity
              key={offer.code}
              style={[styles.offerCard, { backgroundColor: offer.bgColor }]}
              onPress={() => navigate(constants.routes.MY_PROMOCODES)}
              activeOpacity={0.9}
            >
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={styles.offerCardTitle}>{offer.title}</Text>
                <Text style={styles.offerCardDesc}>{offer.desc}</Text>
              </View>
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>COPY</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <TouchableOpacity onPress={() => navigate(constants.routes.SHOP)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#0F5B35" style={{ marginVertical: 30 }} />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, gap: 16, marginBottom: 25 }}>
              {restaurants.map((res) => (
                <TouchableOpacity
                  key={res._id}
                  style={styles.restaurantCard}
                  onPress={() => navigate(constants.routes.RESTAURANT_MENU, { state: { restaurantId: res._id, from: constants.routes.HOME } })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: res.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=250' }}
                    style={styles.restaurantImage as any}
                  />
                  <View style={styles.restaurantRating}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="#FFC700" stroke="#FFC700" strokeWidth={1}>
                      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </Svg>
                    <Text style={styles.restaurantRatingText}>{res.rating || '4.5'}</Text>
                  </View>
                  <View style={styles.restaurantDetails}>
                    <Text style={styles.restaurantName} numberOfLines={1}>{res.name}</Text>
                    <Text style={styles.restaurantMeta}>{res.deliveryTime || '30-40 min'} | ₹₹</Text>
                    {res.discountText ? (
                      <View style={styles.offerTag}>
                        <Text style={styles.offerText}>🏷 {res.discountText}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Must Try Veg Dishes */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Must Try Dishes</Text>
              <TouchableOpacity onPress={() => navigate(constants.routes.SHOP)}>
                <Text style={styles.seeAll}>View Menu</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mustTryContainer}>
              {mustTryDishes.map((dish) => {
                const formattedDish = {
                  id: dish._id,
                  name: dish.name,
                  price: dish.price,
                  image: dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150',
                  category: dish.category,
                  restaurantId: dish.restaurant?._id || dish.restaurant,
                };
                return (
                  <TouchableOpacity
                    key={dish._id}
                    style={styles.dishListItem}
                    onPress={() => navigate(constants.routes.DISH, { state: { dishId: dish._id, from: constants.routes.HOME } })}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: formattedDish.image }} style={styles.dishListImage as any} />
                    <View style={styles.dishListInfo}>
                      <Text style={styles.dishListName}>{formattedDish.name}</Text>
                      <Text style={styles.dishListCuisine}>{formattedDish.category}</Text>
                      <Text style={styles.dishListPrice}>₹{formattedDish.price}</Text>
                    </View>
                    <View style={styles.dishListAction}>
                      <components.AddToCart dish={formattedDish as any} vertical={true} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <TouchableOpacity style={styles.viewOffersBtn} onPress={() => navigate(constants.routes.MY_PROMOCODES)}>
          <Text style={styles.viewOffersText}>View All Offers ›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Location Selector Bottom Sheet Modal */}
      <Modal visible={showLocationModal} transparent animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowLocationModal(false)} activeOpacity={1}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={{ fontSize: 18, color: '#7E8B97', fontWeight: '700', padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {fetchingLocation ? (
              <View style={styles.gpsContainer}>
                <ActivityIndicator size="large" color="#0F5B35" />
                <Text style={styles.gpsLoaderText}>Fetching GPS Location...</Text>
                <Text style={styles.gpsCoords}>
                  Lat: {simulatedCoords.lat.toFixed(5)}  |  Lng: {simulatedCoords.lng.toFixed(5)}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <TouchableOpacity style={styles.liveLocationBtn} onPress={handleGetLiveLocation}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#0F5B35" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx={12} cy={12} r={10} /><Circle cx={12} cy={12} r={3} /><Line x1={12} y1={1} x2={12} y2={3} /><Line x1={12} y1={21} x2={12} y2={23} /><Line x1={1} y1={12} x2={3} y2={12} /><Line x1={21} y1={12} x2={23} y2={12} />
                  </Svg>
                  <Text style={styles.liveLocationText}>Use Current Live GPS Location</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.modalDivider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.modalDivider} />
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={styles.inputLabel}>Enter Address Manually</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter street, area, or landmark address..."
                    placeholderTextColor="#7E8B97"
                    value={manualLocation}
                    onChangeText={setManualLocation}
                  />
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveManualLocation}>
                    <Text style={styles.saveBtnText}>Save Location</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <components.BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  
  // New Animated Carousel Banner Styles
  bannerContainer: {
    paddingHorizontal: 0, // removed to let Carousel stretch fully
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  raysWrapper: {
    position: 'absolute',
    top: '15%',
    right: '-45%',
    width: BANNER_HEIGHT * 1.5,
    height: BANNER_HEIGHT * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.65,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    marginTop: 4,
    paddingHorizontal: 18,
  },
  bannerHeaderBtnLeft: {
    padding: 8,
    width: 40,
  },
  bannerLocationBtnMiddle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bannerLocationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
  },
  bannerLocationAddress: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Outfit',
    marginTop: 1,
    textAlign: 'center',
    maxWidth: 200,
  },
  bannerHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 80,
    justifyContent: 'flex-end',
  },
  bannerHeaderBtn: {
    padding: 8,
    position: 'relative',
  },
  bannerCartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  bannerCartBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  bannerSearchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    marginTop: 16,
    marginHorizontal: 18,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  bannerSearchText: {
    fontSize: 13,
    color: '#7E8B97',
    fontFamily: 'Outfit',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  vegSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  vegSwitchText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  vegSwitchPill: {
    width: 24,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    padding: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  vegSwitchDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  
  // Carousel specific styles
  carouselScrollView: {
    flex: 1,
    marginTop: 10,
    zIndex: 5,
  },
  carouselSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    paddingHorizontal: 18,
  },
  bannerPromoBody: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
  },
  bannerPromoLeft: {
    width: '55%',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  bannerPromoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerPromoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    letterSpacing: 0.3,
  },
  bannerPromoSubtitle: {
    fontFamily: 'Outfit',
    fontWeight: '900',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bannerPromoTitleText: {
    fontFamily: 'Outfit',
    fontWeight: '900',
    fontSize: 34,
    color: '#FFF9C4',
    fontStyle: 'italic',
    marginTop: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bannerPromoTitleText2: {
    fontFamily: 'Outfit',
    fontWeight: '900',
    fontSize: 28,
    color: '#FFF9C4',
    fontStyle: 'italic',
    marginTop: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bannerPromoDesc: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Outfit',
    marginTop: 4,
    lineHeight: 15,
  },
  bannerPromoCodeContainer: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bannerPromoCodeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF9C4',
    fontFamily: 'Outfit',
    letterSpacing: 0.5,
  },
  bannerOrderBtn: {
    backgroundColor: '#1E2022',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bannerOrderBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
  },
  bannerPromoRight: {
    width: '48%',
    position: 'relative',
  },
  plate1Wrapper: {
    position: 'absolute',
    right: -10,
    top: '12%',
    zIndex: 3,
  },
  plateImageLarge: {
    width: 125,
    height: 125,
    borderRadius: 62.5,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  plate2Wrapper: {
    position: 'absolute',
    right: 48,
    top: '32%',
    zIndex: 2,
  },
  plateImageSmall: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  bannerDotsContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bannerDotActive: {
    backgroundColor: '#FFFFFF',
    width: 16,
  },
  
  // Adjusted elements below banner
  sectionHeaderUnderBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2022',
    fontFamily: 'Outfit',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  categoriesScroll: {
    marginBottom: 25,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryBtnActive: {
    borderColor: '#0F5B35',
    backgroundColor: '#0F5B35',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E2022',
    fontFamily: 'Outfit',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  restaurantCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 120,
  },
  restaurantRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  restaurantRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E2022',
    fontFamily: 'Outfit',
  },
  restaurantDetails: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2022',
    marginBottom: 4,
    fontFamily: 'Outfit',
  },
  restaurantMeta: {
    fontSize: 12,
    color: '#7E8B97',
    marginBottom: 10,
    fontFamily: 'Outfit',
  },
  offerTag: {
    backgroundColor: 'rgba(15,91,53,0.08)',
    borderRadius: 8,
    padding: 6,
  },
  offerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  offerCard: {
    width: 260,
    height: 100,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
    marginBottom: 4,
  },
  offerCardDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Outfit',
    fontWeight: '600',
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  offerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Outfit',
  },
  mustTryContainer: {
    gap: 14,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  dishListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  dishListImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
  },
  dishListInfo: {
    flex: 1,
  },
  dishListName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E2022',
    fontFamily: 'Outfit',
    marginBottom: 2,
  },
  dishListCuisine: {
    fontSize: 11,
    color: '#7E8B97',
    fontFamily: 'Outfit',
    marginBottom: 4,
  },
  dishListPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  dishListAction: {
    width: 105,
  },
  viewOffersBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  viewOffersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  
  // Location selector sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E2022',
    fontFamily: 'Outfit',
  },
  gpsContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  gpsLoaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E2022',
    fontFamily: 'Outfit',
  },
  gpsCoords: {
    fontSize: 13,
    color: '#7E8B97',
    fontFamily: 'Outfit',
    fontWeight: '600',
  },
  liveLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0F5B35',
    backgroundColor: 'rgba(15,91,53,0.02)',
    justifyContent: 'center',
  },
  liveLocationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F5B35',
    fontFamily: 'Outfit',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 10,
  },
  modalDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    color: '#7E8B97',
    fontWeight: '700',
    fontFamily: 'Outfit',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E8B97',
    fontFamily: 'Outfit',
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#1E2022',
    fontFamily: 'Outfit',
    backgroundColor: '#F9FAFB',
  },
  saveBtn: {
    backgroundColor: '#0F5B35',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Outfit',
  },
});
