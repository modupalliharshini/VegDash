import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { stores } from '@/stores';
import { restaurantService } from '@/services/restaurantService';
import { searchService } from '@/services/searchService';

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
    
    // Animate GPS coordinate locks
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
        // Pick first 4 dishes from trending items
        setMustTryDishes((trendingData?.popularItems || []).slice(0, 4));
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    <components.SafeAreaView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setVisible(true)} style={styles.headerBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <Line x1={3} y1={12} x2={21} y2={12} /><Line x1={3} y1={6} x2={21} y2={6} /><Line x1={3} y1={18} x2={21} y2={18} />
          </Svg>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationBtn} onPress={() => setShowLocationModal(true)}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0F5B35" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx={12} cy={10} r={3} />
          </Svg>
          <Text style={styles.locationText} numberOfLines={1}>{locationText}</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigate(constants.routes.ORDER)} style={styles.headerBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx={9} cy={21} r={1} />
              <Circle cx={20} cy={21} r={1} />
              <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </Svg>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate(constants.routes.PROFILE)} style={styles.headerBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => navigate(constants.routes.SHOP)}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7E8B97" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={11} cy={11} r={8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} />
          </Svg>
          <Text style={styles.searchText}>Search for food, restaurants, cuisines...</Text>
        </TouchableOpacity>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={{ maxWidth: '60%', zIndex: 2 }}>
            <Text style={styles.promoTitle}>100% Pure Veg</Text>
            <Text style={styles.promoSubtitle}>100% Trusted</Text>
            <Text style={styles.promoDesc}>Food you love, the purity you trust.</Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop' }}
            style={styles.promoImage}
          />
        </View>

        {/* Offers For You Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers For You</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, gap: 14, marginBottom: 25 }}>
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

        {/* Categories / Cuisines */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Cuisines</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={{ paddingRight: 16, gap: 10 }}>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, gap: 16, marginBottom: 25 }}>
              {restaurants.map((res) => (
                <TouchableOpacity
                  key={res._id}
                  style={styles.restaurantCard}
                  onPress={() => navigate(constants.routes.RESTAURANT_MENU, { state: { restaurantId: res._id, from: constants.routes.HOME } })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: res.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=250' }}
                    style={styles.restaurantImage}
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
                    <Image source={{ uri: formattedDish.image }} style={styles.dishListImage} />
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
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  headerBtn: { padding: 8, position: 'relative' },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
  locationText: { fontSize: 14, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', maxWidth: 130 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 30 },
  searchBar: { backgroundColor: '#F4F6F8', borderRadius: 16, flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, gap: 10 },
  searchText: { fontSize: 14, color: '#7E8B97', fontFamily: 'Outfit' },
  promoBanner: { backgroundColor: '#0F5B35', borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  promoTitle: { fontFamily: 'Outfit', fontWeight: '800', fontSize: 22, color: '#FFFFFF', marginBottom: 4 },
  promoSubtitle: { fontFamily: 'Outfit', fontWeight: '700', fontSize: 16, color: '#8BC34A', marginBottom: 4 },
  promoDesc: { fontSize: 12, color: '#A6CBB7', fontFamily: 'Outfit', lineHeight: 18 },
  promoImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
  categoriesScroll: { marginBottom: 25 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  categoryBtnActive: { borderColor: '#0F5B35', backgroundColor: '#0F5B35' },
  categoryIcon: { fontSize: 14 },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#1E2022', fontFamily: 'Outfit' },
  categoryTextActive: { color: '#FFFFFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  seeAll: { fontSize: 14, fontWeight: '600', color: '#0F5B35', fontFamily: 'Outfit' },
  restaurantCard: { width: 220, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', position: 'relative' },
  restaurantImage: { width: '100%', height: 120 },
  restaurantRating: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  restaurantRatingText: { fontSize: 11, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  restaurantDetails: { padding: 12 },
  restaurantName: { fontSize: 16, fontWeight: '700', color: '#1E2022', marginBottom: 4, fontFamily: 'Outfit' },
  restaurantMeta: { fontSize: 12, color: '#7E8B97', marginBottom: 10, fontFamily: 'Outfit' },
  offerTag: { backgroundColor: 'rgba(15,91,53,0.08)', borderRadius: 8, padding: 6 },
  offerText: { fontSize: 11, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  offerCard: { width: 260, height: 100, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  offerCardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', fontFamily: 'Outfit', marginBottom: 4 },
  offerCardDesc: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontFamily: 'Outfit', fontWeight: '600' },
  offerBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  offerBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF', fontFamily: 'Outfit' },
  mustTryContainer: { gap: 14, marginBottom: 15 },
  dishListItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  dishListImage: { width: 65, height: 65, borderRadius: 12 },
  dishListInfo: { flex: 1 },
  dishListName: { fontSize: 15, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2 },
  dishListCuisine: { fontSize: 11, color: '#7E8B97', fontFamily: 'Outfit', marginBottom: 4 },
  dishListPrice: { fontSize: 14, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  dishListAction: { width: 105 },
  viewOffersBtn: { alignItems: 'center', marginTop: 20 },
  viewOffersText: { fontSize: 14, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },

  // Location selector sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  gpsContainer: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  gpsLoaderText: { fontSize: 15, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  gpsCoords: { fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit', fontWeight: '600' },
  liveLocationBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#0F5B35', backgroundColor: 'rgba(15,91,53,0.02)', justifyContent: 'center' },
  liveLocationText: { fontSize: 14, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10, gap: 10 },
  modalDivider: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#7E8B97', fontWeight: '700', fontFamily: 'Outfit' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#7E8B97', fontFamily: 'Outfit' },
  modalInput: { height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: '#EEEEEE', paddingHorizontal: 16, fontSize: 13, color: '#1E2022', fontFamily: 'Outfit', backgroundColor: '#F9FAFB' },
  saveBtn: { backgroundColor: '#0F5B35', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  saveBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: '700', fontFamily: 'Outfit' },
  
  // Cart Badge styles
  cartBadge: { position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#0F5B35', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  cartBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', fontFamily: 'Outfit' },
});
