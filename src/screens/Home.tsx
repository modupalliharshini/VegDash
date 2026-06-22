import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, ActivityIndicator, Modal, TextInput,
  Alert, Dimensions, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Path, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { stores } from '@/stores';
import { restaurantService } from '@/services/restaurantService';
import { searchService } from '@/services/searchService';
import { theme } from '@/theme/theme';

// ── Local generated images ─────────────────────────────────────────────────────
const IMG_HERO_BG = require('../assets/images/hero_combined_bg_blended.png');
const IMG_AFTER_GYM = require('../assets/images/after_gym_meals.png');
const IMG_JAIN = require('../assets/images/jain_specials.png');
const IMG_SATVIK = require('../assets/images/satvik_dinners.png');
const IMG_PRASADAM = require('../assets/images/temple_prasadam.png');
const IMG_KITCHEN_MAIN = require('../assets/images/featured_kitchen.png');
const IMG_KITCHEN_GREEN = require('../assets/images/kitchen_green_cafe.png');
const IMG_KITCHEN_JAIN = require('../assets/images/kitchen_jain_restaurant.png');
const IMG_KITCHEN_ORG = require('../assets/images/kitchen_organic_bowl.png');
const IMG_CAT_THALI = require('../assets/images/category_thali.png');
const IMG_CAT_BOWLS = require('../assets/images/category_bowls.png');
const IMG_CAT_STREET = require('../assets/images/category_street_food.png');
const IMG_CAT_SATVIK = require('../assets/images/satvik_dinners.png');

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────── Logo SVG ────────────────────────────────────────
const VegDashLogo = () => (
  <View style={{ alignItems: 'flex-start' }}>
    <Image 
      source={require('../assets/images/logo.png')} 
      style={{ width: 140, height: 52, alignSelf: 'flex-start', marginLeft: -16, marginTop: -6 }} 
      resizeMode="contain" 
    />
  </View>
);

// ─────────────────────── Icon components ─────────────────────────────────────
const BowlIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11h16c0 5-3.5 8-8 8s-8-3-8-8z" stroke={theme.colors.primaryGreen} strokeWidth={1.8} strokeLinejoin="round" />
    <Path d="M3 11h18" stroke={theme.colors.primaryGreen} strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M8 7c0-2 1-3 4-4 3 1 4 2 4 4" stroke={theme.colors.primaryGreen} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
const HandIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M18 11V9a2 2 0 0 0-4 0v-1a2 2 0 0 0-4 0V7a2 2 0 0 0-4 0v5l-1-1a2 2 0 0 0-2.83 2.83L6 17a6 6 0 0 0 4.24 1.76H14a4 4 0 0 0 4-4v-3.75" stroke={theme.colors.primaryGreen} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={18} cy={8} r={3} stroke={theme.colors.primaryGreen} strokeWidth={1.5} />
  </Svg>
);
const LotusIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 20c0 0-8-5-8-11a8 8 0 0 1 8-8 8 8 0 0 1 8 8c0 6-8 11-8 11z" stroke={theme.colors.primaryGreen} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 9c-2 2-3 4-2 7" stroke={theme.colors.primaryGreen} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M12 9c2 2 3 4 2 7" stroke={theme.colors.primaryGreen} strokeWidth={1.5} strokeLinecap="round" />
    <Path d="M12 9v-4" stroke={theme.colors.primaryGreen} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

// ─────────────────────────── Main Component ──────────────────────────────────
export const Home: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'brand' | 'explore'>('brand');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [mustTryDishes, setMustTryDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationText, setLocationText] = useState('Gachibowli, Hyderabad');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [simulatedCoords, setSimulatedCoords] = useState({ lat: 17.4485, lng: 78.3741 });
  const [exploreBannerSlide, setExploreBannerSlide] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem('vegdash_user_location').then(v => v && setLocationText(v)).catch(() => { });
  }, []);

  useEffect(() => {
    Promise.all([restaurantService.getRestaurants(), searchService.getTrending()])
      .then(([resList, trendingData]) => {
        setRestaurants(resList || []);
        setMustTryDishes((trendingData?.popularItems || []).slice(0, 4));
      })
      .catch(err => console.error('Home fetch:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleGetLiveLocation = () => {
    setFetchingLocation(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSimulatedCoords({ lat: latitude, lng: longitude });
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data && data.display_name) {
              const parts = data.display_name.split(',');
              const formatted = parts.slice(0, 3).join(',').trim();
              setLocationText(formatted);
              await AsyncStorage.setItem('vegdash_user_location', formatted);
            } else {
              const fallback = `DLF Cyber City, Gachibowli, Hyderabad`;
              setLocationText(fallback);
              await AsyncStorage.setItem('vegdash_user_location', fallback);
            }
          } catch (err) {
            console.error('Reverse geocode error:', err);
            const fallback = `DLF Cyber City, Gachibowli, Hyderabad`;
            setLocationText(fallback);
            await AsyncStorage.setItem('vegdash_user_location', fallback);
          } finally {
            setFetchingLocation(false);
            setShowLocationModal(false);
          }
        },
        (error) => {
          console.error('GPS error:', error);
          setTimeout(async () => {
            const addrs = ['506, Road No. 36, Jubilee Hills, Hyderabad', 'Flat 12B, My Home Bhooja, Hitec City, Hyderabad', 'Plot 45, DLF Cyber City, Gachibowli, Hyderabad'];
            const sel = addrs[Math.floor(Math.random() * addrs.length)];
            setLocationText(sel);
            await AsyncStorage.setItem('vegdash_user_location', sel);
            setFetchingLocation(false);
            setShowLocationModal(false);
          }, 1000);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setTimeout(async () => {
        const addrs = ['Plot 45, DLF Cyber City, Gachibowli, Hyderabad'];
        const sel = addrs[0];
        setLocationText(sel);
        await AsyncStorage.setItem('vegdash_user_location', sel);
        setFetchingLocation(false);
        setShowLocationModal(false);
      }, 1000);
    }
  };

  const handleSaveManualLocation = async () => {
    if (!manualLocation.trim()) { Alert.alert('Error', 'Please enter a valid address'); return; }
    setLocationText(manualLocation);
    await AsyncStorage.setItem('vegdash_user_location', manualLocation);
    setManualLocation('');
    setShowLocationModal(false);
  };

  const locationParts = locationText.split(',');
  const locLine1 = locationParts[0]?.trim() || locationText;
  const locLine2 = locationParts.slice(1).join(',').trim();

  // ── Data ─────────────────────────────────────────────────────────────────────
  const curatedCollections = [
    { id: 'gym', name: 'After Gym\nMeals', sub: 'High Protein', image: IMG_AFTER_GYM },
    { id: 'jain', name: 'Jain\nSpecials', sub: 'Pure & Satvik', image: IMG_JAIN },
    { id: 'satvik', name: 'Satvik\nDinners', sub: 'Light & Healthy', image: IMG_SATVIK },
    { id: 'prasadam', name: 'Temple\nPrasadam', sub: 'Divine Goodness', image: IMG_PRASADAM },
  ];

  const topCategories = [
    { id: 'thali', name: 'Thalis', desc: 'Complete meals', image: IMG_CAT_THALI, },
    { id: 'bowls', name: 'Bowls', desc: 'Nutrient bowls', image: IMG_CAT_BOWLS, },
    { id: 'street', name: 'Street Food', desc: 'Chaat & more', image: IMG_CAT_STREET, },
    { id: 'satvik2', name: 'Satvik', desc: 'Pure & light', image: IMG_CAT_SATVIK, },
  ];

  const featuredKitchens = [
    { id: 'res_3', name: 'Sattvik Kitchen', cuisines: 'Jain • Satvik • Organic', rating: '4.8', time: '35-40 min', delivery: '₹99', image: IMG_KITCHEN_MAIN, badge: 'Pure Veg Certified' },
    { id: 'res_4', name: 'The Green Leaf Cafe', cuisines: 'Healthy • Organic • Bowls', rating: '4.6', time: '20-30 min', delivery: '₹49', image: IMG_KITCHEN_GREEN, badge: 'Organic Certified' },
    { id: 'res_2', name: 'Jain Bhojanalaya', cuisines: 'Jain • Traditional • Thali', rating: '4.7', time: '30-40 min', delivery: '₹79', image: IMG_KITCHEN_JAIN, badge: 'Jain Certified' },
    { id: 'res_5', name: 'Organic Bowl Co.', cuisines: 'Vegan • Bowls • Smoothies', rating: '4.5', time: '25-35 min', delivery: '₹59', image: IMG_KITCHEN_ORG, badge: 'Pure Veg' },
  ];

  const brandFeatureCards = [
    { title: 'Healthy Bowls', desc: 'Nutrient rich\nmeals', icon: <BowlIcon /> },
    { title: 'Jain Certified', desc: 'No onion, no garlic\n100% pure veg', icon: <HandIcon /> },
    { title: 'Satvik Kitchens', desc: 'Wholesome\n& pure', icon: <LotusIcon /> },
  ];

  const quickCategories = [
    { name: 'Top Rated', icon: '⭐' }, { name: 'Thalis', icon: '🍛' },
    { name: 'Bowls', icon: '🥗' }, { name: 'Italian', icon: '🍕' },
    { name: 'Beverages', icon: '🥤' }, { name: 'More', icon: '🎛️' },
  ];

  // ─────────────────────────── Render ──────────────────────────────────────────
  return (
    <View style={s.container}>
      <StatusBar style="dark" />

      {viewMode === 'brand' ? (
        /* ═══════════════ BRAND / HOME VIEW ═══════════════ */
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 4 }}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Header row ──────────────────────────────────── */}
          <View style={s.headerRow}>
            <VegDashLogo />

            <TouchableOpacity style={s.locationBtn} onPress={() => setShowLocationModal(true)}>
              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryGreen} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx={12} cy={10} r={3} />
              </Svg>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.locLine1}>{locLine1},</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                  <Text style={s.locLine2}>{locLine2 || locLine1}</Text>
                  <Svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke={theme.colors.secondaryText} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M6 9l6 6 6-6" />
                  </Svg>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={s.heroSection}>
            {/* Left text column */}
            <View style={s.heroText}>
              <Text style={s.heroH}>Good Food<Text style={{ color: theme.colors.gold }}>.</Text></Text>
              <Text style={s.heroH}>Without</Text>
              <Text style={s.heroH}>Compromise<Text style={{ color: theme.colors.gold }}>.</Text></Text>
              <View style={s.goldBar} />
              <Text style={s.heroSub}>Curated vegetarian kitchens.{'\n'}Delivered fresh in under 30 minutes.</Text>
            </View>

            {/* Right side — single integrated blended image */}
            <Image source={IMG_HERO_BG} style={s.heroImg} resizeMode="contain" />
          </View>

          {/* ── Search Bar ────────────────────────────────────────── */}
          <TouchableOpacity style={s.searchBarBtn} activeOpacity={0.9} onPress={() => setViewMode('explore')}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.lightText} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx={11} cy={11} r={8} />
              <Line x1={21} y1={21} x2={16.65} y2={16.65} />
            </Svg>
            <Text style={s.searchBarText}>Search for dishes, restaurants, or cuisines...</Text>
          </TouchableOpacity>

          {/* ── Three feature cards ────────────────────────── */}
          <View style={s.cardsRow}>
            {brandFeatureCards.map((c, i) => (
              <TouchableOpacity key={i} style={s.featureCard} onPress={() => setViewMode('explore')} activeOpacity={0.9}>
                <View style={s.featureIconBg}>{c.icon}</View>
                <Text style={s.featureTitle}>{c.title}</Text>
                <Text style={s.featureDesc}>{c.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>



          {/* ── Curated Collections section ───────────────── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Curated Collections</Text>
            <TouchableOpacity onPress={() => setViewMode('explore')}>
              <Text style={s.seeAll}>View all ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, gap: 12 }}>
            {curatedCollections.map(col => (
              <TouchableOpacity
                key={col.id}
                style={s.collCard}
                activeOpacity={0.9}
                onPress={() => navigate(constants.routes.SHOP, { state: { category: col.name } })}
              >
                <Image source={col.image} style={s.collImg} resizeMode="cover" />
                <View style={StyleSheet.absoluteFill}>
                  <Svg height="100%" width="100%">
                    <Defs>
                      <LinearGradient id={`grad-${col.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#08281C" stopOpacity="0" />
                        <Stop offset="35%" stopColor="#08281C" stopOpacity="0.25" />
                        <Stop offset="65%" stopColor="#08281C" stopOpacity="0.80" />
                        <Stop offset="100%" stopColor="#08281C" stopOpacity="0.95" />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill={`url(#grad-${col.id})`} />
                  </Svg>
                </View>
                <View style={s.collTextContainer}>
                  <Text style={s.collTitle}>{col.name}</Text>
                  <Text style={s.collSub}>{col.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>


          {/* ── Top Categories section ──────────────────────
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Top Categories</Text>
            <TouchableOpacity onPress={() => setViewMode('explore')}>
              <Text style={s.seeAll}>View all ›</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, gap: 12 }}>
            {topCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={s.catCard}
                activeOpacity={0.9}
                onPress={() => navigate(constants.routes.SHOP, { state: { category: cat.name } })}
              >
                <Image source={cat.image} style={s.catImg} resizeMode="cover" />
                <View style={s.catOverlay}>
                  <Text style={s.catName}>{cat.name}</Text>
                  <Text style={s.catDesc}>{cat.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView> */}



          {/* ── Featured Kitchens section ─────────────────── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Featured Kitchens</Text>
            <TouchableOpacity onPress={() => setViewMode('explore')}>
              <Text style={s.seeAll}>View all ›</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 14 }}>
            {featuredKitchens.map(k => (
              <TouchableOpacity
                key={k.id}
                style={s.kitchenCard}
                activeOpacity={0.95}
                onPress={() => navigate(constants.routes.RESTAURANT_MENU, { state: { restaurantId: k.id, from: constants.routes.HOME } })}
              >
                {/* Left image */}
                <View style={s.kitchenImgWrap}>
                  <Image source={k.image} style={s.kitchenImg} resizeMode="cover" />
                  <View style={s.vegBadge}>
                    <View style={s.vegDot} />
                    <Text style={s.vegBadgeText}>{k.badge}</Text>
                  </View>
                </View>
                {/* Right details */}
                <View style={s.kitchenDetails}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={s.kitchenVerified}>VERIFIED KITCHEN</Text>
                    <View style={s.ratingBadge}>
                      <Text style={s.ratingText}>★ {k.rating}</Text>
                    </View>
                  </View>
                  <Text style={s.kitchenName}>{k.name}</Text>
                  <Text style={s.kitchenCuisines}>{k.cuisines}</Text>
                  <View style={s.kitchenMeta}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={theme.colors.lightText} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Circle cx={12} cy={12} r={10} /><Path d="M12 6v6l4 2" />
                    </Svg>
                    <Text style={s.kitchenMetaText}>{k.time}</Text>
                    <View style={s.metaDivider} />
                    <Text style={[s.kitchenMetaText, { color: theme.colors.gold, fontWeight: '700' }]}>{k.delivery} Delivery</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>

      ) : (
        /* ═══════════════ EXPLORE / SEARCH VIEW ═══════════════ */
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + 8 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.exploreHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity onPress={() => setViewMode('brand')} style={{ paddingRight: 8 }}>
                <Text style={{ fontSize: 20, color: theme.colors.primaryText, fontWeight: 'bold' }}>←</Text>
              </TouchableOpacity>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth={2.5}>
                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx={12} cy={10} r={3} />
              </Svg>
              <View>
                <Text style={s.explLocTitle}>{locationText.split(',')[0]}</Text>
                <Text style={s.explLocSub}>Deliver to <Text style={{ fontWeight: '700' }}>Home ▼</Text></Text>
              </View>
            </View>
            <TouchableOpacity style={s.bellBtn} onPress={() => navigate(constants.routes.NOTIFICATIONS)}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </Svg>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.searchBar} activeOpacity={0.9} onPress={() => navigate(constants.routes.SHOP)}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.colors.secondaryText} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx={11} cy={11} r={8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} />
            </Svg>
            <Text style={s.searchPlaceholder}>Search for restaurants, cuisines or dishes</Text>
          </TouchableOpacity>

          {/* Banner */}
          <View style={s.bannerWrap}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={e => setExploreBannerSlide(Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40)))} scrollEventThrottle={16}>
              {[1, 2, 3].map(item => (
                <View key={item} style={s.bannerSlide}>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={s.bannerH}>Healthy Meals.{'\n'}Happy You.</Text>
                    <Text style={s.bannerSub}>100% Pure Veg. 100% Delicious.</Text>
                    <TouchableOpacity style={s.orderBtn} onPress={() => navigate(constants.routes.SHOP)}>
                      <Text style={s.orderBtnText}>ORDER NOW ›</Text>
                    </TouchableOpacity>
                  </View>
                  <Image source={IMG_CAT_BOWLS} style={s.bannerImg} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
            <View style={s.bannerDots}>
              {[0, 1, 2].map(i => <View key={i} style={[s.bannerDot, exploreBannerSlide === i && s.bannerDotActive]} />)}
            </View>
          </View>

          {/* Quick categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catCircleScroll}>
            {quickCategories.map((c, i) => (
              <TouchableOpacity key={i} style={s.catCircleBtn} onPress={() => navigate(constants.routes.SHOP, { state: { category: c.name } })}>
                <View style={s.catCircle}><Text style={{ fontSize: 20 }}>{c.icon}</Text></View>
                <Text style={s.catCircleText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Top Restaurants */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Top Rated Restaurants</Text>
            <TouchableOpacity onPress={() => navigate(constants.routes.SHOP)}><Text style={s.seeAll}>View All ›</Text></TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 16 }}>
            {restaurants.slice(0, 3).map((res, idx) => {
              const dColors = [{ bg: '#E8F5E9', text: '#2E7D32' }, { bg: '#FFF3E0', text: '#E65100' }, { bg: '#E3F2FD', text: '#1E88E5' }];
              const dc = dColors[idx % 3];
              return (
                <TouchableOpacity key={res._id || idx} style={s.resRow} activeOpacity={0.9} onPress={() => navigate(constants.routes.RESTAURANT_MENU, { state: { restaurantId: res._id, from: constants.routes.HOME } })}>
                  <Image source={res.coverImage ? { uri: res.coverImage } : IMG_CAT_BOWLS} style={s.resRowImg} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={s.resName} numberOfLines={1}>{res.name}</Text>
                    <Text style={s.resCuisines} numberOfLines={1}>{res.categories?.join(' • ') || 'Pure Veg • Indian • Healthy'}</Text>
                    <View style={s.resMeta}>
                      <Text style={s.resMetaText}>★ {res.rating || '4.5'}</Text>
                      <Text style={s.metaDot}>•</Text>
                      <Text style={s.resMetaText}>{res.deliveryTime || '25 mins'}</Text>
                      <Text style={s.metaDot}>•</Text>
                      <Text style={s.resMetaText}>₹99 for two</Text>
                    </View>
                    <View style={[s.discountTag, { backgroundColor: dc.bg }]}>
                      <Text style={[s.discountText, { color: dc.text }]}>🏷️ {res.discountText || '50% OFF up to ₹100'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Popular Near You */}
          <View style={[s.sectionHeader, { marginTop: 24 }]}>
            <Text style={s.sectionTitle}>Popular Near You</Text>
            <TouchableOpacity onPress={() => navigate(constants.routes.SHOP)}><Text style={s.seeAll}>View All ›</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 10, gap: 14 }}>
            {mustTryDishes.map(dish => (
              <TouchableOpacity key={dish._id} style={s.miniCard} onPress={() => navigate(constants.routes.DISH, { state: { dishId: dish._id, from: constants.routes.HOME } })}>
                <Image source={dish.image ? { uri: dish.image } : IMG_CAT_BOWLS} style={s.miniImg} resizeMode="cover" />
                <View style={s.miniHeart}><Text style={{ fontSize: 12, color: '#FFF' }}>♡</Text></View>
                <Text style={s.miniTitle} numberOfLines={1}>{dish.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      )}

      {/* ── Location Modal ──────────────────────────────── */}
      <Modal visible={showLocationModal} transparent animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <TouchableOpacity style={s.modalOverlay} onPress={() => setShowLocationModal(false)} activeOpacity={1}>
          <View style={s.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Delivery Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={{ fontSize: 18, color: theme.colors.lightText, fontWeight: '700', padding: 4 }}>✕</Text>
              </TouchableOpacity>
            </View>
            {fetchingLocation ? (
              <View style={{ alignItems: 'center', paddingVertical: 30, gap: 10 }}>
                <ActivityIndicator size="large" color={theme.colors.primaryGreen} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.colors.primaryText }}>Fetching GPS Location...</Text>
                <Text style={{ fontSize: 13, color: theme.colors.lightText }}>Lat: {simulatedCoords.lat.toFixed(5)} | Lng: {simulatedCoords.lng.toFixed(5)}</Text>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                <TouchableOpacity style={s.liveBtn} onPress={handleGetLiveLocation}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryGreen} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx={12} cy={12} r={10} /><Circle cx={12} cy={12} r={3} /><Line x1={12} y1={1} x2={12} y2={3} /><Line x1={12} y1={21} x2={12} y2={23} /><Line x1={1} y1={12} x2={3} y2={12} /><Line x1={21} y1={12} x2={23} y2={12} />
                  </Svg>
                  <Text style={s.liveBtnText}>Use Current Live GPS Location</Text>
                </TouchableOpacity>
                <View style={s.orRow}>
                  <View style={s.orLine} /><Text style={s.orText}>OR</Text><View style={s.orLine} />
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.lightText }}>Enter Address Manually</Text>
                  <TextInput style={s.modalInput} placeholder="Enter street, area, or landmark..." placeholderTextColor={theme.colors.lightText} value={manualLocation} onChangeText={setManualLocation} />
                  <TouchableOpacity style={s.saveBtn} onPress={handleSaveManualLocation}>
                    <Text style={{ fontSize: 14, color: '#FFF', fontWeight: '700' }}>Save Location</Text>
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

// ─────────────────────────── Styles ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flex: 1 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: 8, paddingRight: 20, marginTop: 10 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 8 },
  locLine1: { fontSize: 10, fontWeight: '500', color: theme.colors.secondaryText, textAlign: 'right', fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif' },
  locLine2: { fontSize: 10.5, fontWeight: '700', color: theme.colors.primaryText, textAlign: 'right', fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif' },

  // Hero — single image right side, text left
  heroSection: { 
    flexDirection: 'row', 
    marginTop: 10, 
    minHeight: 260, 
    alignItems: 'flex-start', 
    position: 'relative',
    backgroundColor: 'transparent',
  },
  heroText: { flex: 1, paddingLeft: 20, paddingRight: 6, zIndex: 3, paddingTop: 10 },
  heroH: {
    fontSize: 36,
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
    fontWeight: '800',
    color: theme.colors.primaryGreen,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  goldBar: { width: 36, height: 3, backgroundColor: theme.colors.gold, borderRadius: 2, marginTop: 14, marginBottom: 10 },
  heroSub: { fontSize: 13, color: '#5E5E5E', lineHeight: 20, fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif' },
  heroImg: {
    width: SCREEN_WIDTH * 0.48,
    height: 240,
    position: 'absolute',
    right: 5,
    bottom: 5,
    zIndex: 1,
  },

  // Search Bar
  searchBarBtn: { marginHorizontal: 20, marginTop: 22, backgroundColor: theme.colors.card, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  searchBarText: { color: theme.colors.lightText, fontSize: 13, marginLeft: 10, fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif' },

  // Feature cards
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20, gap: 10 },
  featureCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 6, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  featureIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(167,184,163,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.primaryText, textAlign: 'center', fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif', marginBottom: 3 },
  featureDesc: { fontSize: 10, color: theme.colors.secondaryText, textAlign: 'center', lineHeight: 13 },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 14, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif', fontWeight: '700', color: theme.colors.primaryText },
  seeAll: { fontSize: 13, fontWeight: '600', color: theme.colors.primaryText },

  // Top Categories horizontal cards
  catCard: { width: 128, height: 155, borderRadius: 16, overflow: 'hidden' },
  catImg: { width: '100%', height: '100%' },
  catOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: 'rgba(8,40,28,0.7)' },
  catName: { color: '#FFF', fontWeight: '700', fontSize: 13, fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif' },
  catDesc: { color: theme.colors.gold, fontSize: 9, fontWeight: '600', marginTop: 1 },

  // Curated collections
  collCard: { width: 140, height: 190, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  collImg: { width: '100%', height: '100%' },
  collTextContainer: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 0, 
    paddingHorizontal: 14, 
    paddingBottom: 14, 
    paddingTop: 30,
    zIndex: 2,
  },
  collTitle: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 15, 
    lineHeight: 19,
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
  },
  collSub: { 
    color: theme.colors.gold, 
    fontSize: 11, 
    fontWeight: '600', 
    marginTop: 4,
    fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif',
  },

  // Featured kitchens
  kitchenCard: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, height: 130 },
  kitchenImgWrap: { width: 130, position: 'relative' },
  kitchenImg: { width: '100%', height: '100%' },
  vegBadge: { position: 'absolute', top: 10, left: 8, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4, elevation: 2 },
  vegDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2E7D32' },
  vegBadgeText: { fontSize: 9, fontWeight: '700', color: '#2E7D32' },
  kitchenDetails: { flex: 1, padding: 14, justifyContent: 'center' },
  kitchenVerified: { fontSize: 9, fontWeight: '700', color: theme.colors.gold, letterSpacing: 0.5 },
  ratingBadge: { backgroundColor: theme.colors.primaryGreen, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  ratingText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  kitchenName: { fontSize: 15, fontWeight: '800', color: theme.colors.primaryText, fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif', marginTop: 4 },
  kitchenCuisines: { fontSize: 11, color: theme.colors.secondaryText, marginTop: 3 },
  kitchenMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  kitchenMetaText: { fontSize: 11, color: theme.colors.lightText },
  metaDivider: { width: 1, height: 10, backgroundColor: theme.colors.border },

  // Explore view
  exploreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 16 },
  explLocTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryText },
  explLocSub: { fontSize: 11, color: theme.colors.secondaryText, marginTop: 1 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF', borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center' },
  searchBar: { marginHorizontal: 20, marginTop: 16, height: 48, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  searchPlaceholder: { flex: 1, color: theme.colors.lightText, fontSize: 13 },

  bannerWrap: { marginHorizontal: 20, marginTop: 18, backgroundColor: '#E8F5E9', borderRadius: 22, overflow: 'hidden', height: 140, borderWidth: 1, borderColor: '#C8E6C9' },
  bannerSlide: { width: SCREEN_WIDTH - 40, height: '100%', flexDirection: 'row', padding: 16, gap: 10 },
  bannerH: { fontSize: 18, fontWeight: '800', color: '#0A3B2E', lineHeight: 22 },
  bannerSub: { fontSize: 10, color: '#2E7D32', fontWeight: '600', marginTop: 4 },
  orderBtn: { backgroundColor: '#0B4D3A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginTop: 10 },
  orderBtnText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  bannerImg: { width: 100, height: 100, borderRadius: 50 },
  bannerDots: { position: 'absolute', bottom: 8, left: 16, flexDirection: 'row', gap: 4 },
  bannerDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#A7B8A3' },
  bannerDotActive: { backgroundColor: '#0B4D3A', width: 10 },

  catCircleScroll: { paddingLeft: 20, paddingRight: 10, marginTop: 20, marginBottom: 20, gap: 12 },
  catCircleBtn: { alignItems: 'center', width: 64 },
  catCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  catCircleText: { fontSize: 11, fontWeight: '600', color: theme.colors.secondaryText, marginTop: 6, textAlign: 'center' },

  resRow: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: theme.colors.warmWhite, padding: 12, flexDirection: 'row', gap: 12, elevation: 1 },
  resRowImg: { width: 80, height: 80, borderRadius: 12 },
  resName: { fontSize: 15, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 2 },
  resCuisines: { fontSize: 11, color: theme.colors.secondaryText, marginBottom: 4 },
  resMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  resMetaText: { fontSize: 11, color: theme.colors.lightText, fontWeight: '600' },
  metaDot: { fontSize: 10, color: theme.colors.border },
  discountTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText: { fontSize: 9, fontWeight: '700' },

  miniCard: { width: 100, alignItems: 'center', position: 'relative' },
  miniImg: { width: 90, height: 90, borderRadius: 16 },
  miniHeart: { position: 'absolute', top: 6, right: 12, backgroundColor: 'rgba(0,0,0,0.35)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  miniTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.primaryText, marginTop: 6, textAlign: 'center', width: 90 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText },
  liveBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: theme.colors.primaryGreen, backgroundColor: 'rgba(11,77,58,0.02)', justifyContent: 'center' },
  liveBtnText: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryGreen },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  orText: { fontSize: 12, color: theme.colors.lightText, fontWeight: '700' },
  modalInput: { height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#EEE', paddingHorizontal: 16, fontSize: 13, color: theme.colors.primaryText, backgroundColor: theme.colors.warmWhite },
  saveBtn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
});
