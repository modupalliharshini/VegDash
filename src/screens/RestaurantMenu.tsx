import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline, Circle, Path, Polygon } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { DishType } from '@/types';
import { restaurantService } from '@/services/restaurantService';
import { foodService } from '@/services/foodService';

export const RestaurantMenu: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const routerParams = params as any;
  const restaurantId = routerParams?.restaurantId || routerParams?.state?.restaurantId;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [liveDishes, setLiveDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!restaurantId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const [resDetails, foodItems] = await Promise.all([
          restaurantService.getRestaurantById(restaurantId),
          foodService.getFoodByRestaurant(restaurantId),
        ]);
        setRestaurant(resDetails);
        setLiveDishes(foodItems || []);
      } catch (err) {
        console.error('Failed to load restaurant menu:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [restaurantId]);

  // Format dishes to format expected by AddToCart and types
  const restaurantDishes = useMemo(() => {
    return liveDishes.map((item) => ({
      id: item._id,
      name: item.name,
      price: item.price,
      image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150',
      description: item.description || '',
      category: item.category || 'Dishes',
      restaurantId: item.restaurant,
    }));
  }, [liveDishes]);

  // Extract categories dynamically
  const categories = useMemo(() => {
    const cats = new Set<string>();
    restaurantDishes.forEach((d) => {
      if (d.category) cats.add(d.category);
    });
    return ['All', ...Array.from(cats)];
  }, [restaurantDishes]);

  // Filter by category and search query
  const filteredDishes = useMemo(() => {
    return restaurantDishes.filter((dish) => {
      const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [restaurantDishes, searchQuery, selectedCategory]);


  const renderDishItem = ({ item }: { item: DishType }) => {
    return (
      <TouchableOpacity
        style={styles.dishCard}
        onPress={() => navigate(constants.routes.DISH, { state: { dishId: item.id, from: routerParams?.from || routerParams?.state?.from || constants.routes.HOME } })}
        activeOpacity={0.9}
      >
        <View style={styles.dishInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
            {item.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Bestseller</Text>
              </View>
            )}
          </View>
          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.dishPrice}>₹{item.price}</Text>
          <Text style={styles.dishDesc} numberOfLines={2}>
            {item.description}
          </Text>
        </View>

        <View style={styles.dishImageContainer}>
          <Image source={{ uri: item.image }} style={styles.dishImage} />
          <View style={styles.addBtnWrapper}>
            <components.AddToCart dish={item} vertical={true} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
              <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Loading Menu...</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0F5B35" />
        </View>
      </components.SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
              <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#7E8B97', textAlign: 'center' }}>Restaurant not found</Text>
        </View>
      </components.SafeAreaView>
    );
  }

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDishItem}
        ListHeaderComponent={
          <>
            {/* Restaurant Cover Info */}
            <View style={styles.restaurantSection}>
              <Image
                source={{ uri: restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400' }}
                style={styles.coverImage}
              />
              <View style={styles.detailsCard}>
                <Text style={styles.brandName}>{restaurant.name}</Text>
                <Text style={styles.cuisineText}>
                  {Array.isArray(restaurant.categories) ? restaurant.categories.join(', ') : 'Pure Veg Restaurant'}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaVal}>⭐ {restaurant.rating || '4.5'}</Text>
                    <Text style={styles.metaLabel}>Rating</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.metaCol}>
                    <Text style={styles.metaVal}>🕒 {restaurant.deliveryTime || '30-40 min'}</Text>
                    <Text style={styles.metaLabel}>Delivery Time</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.metaCol}>
                    <Text style={styles.metaVal}>₹₹</Text>
                    <Text style={styles.metaLabel}>Cost For One</Text>
                  </View>
                </View>

                {restaurant.discountText ? (
                  <View style={styles.couponRow}>
                    <Text style={styles.couponText}>🏷️ {restaurant.discountText}</Text>
                  </View>
                ) : null}
              </View>
            </View>


            {/* Menu Title and Search */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu ({restaurantDishes.length} items)</Text>
              <View style={styles.searchBar}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7E8B97" strokeWidth={2.2}>
                  <Circle cx={11} cy={11} r={8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} />
                </Svg>
                <TextInput
                  placeholder="Search in menu..."
                  placeholderTextColor="#7E8B97"
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Categories scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              style={{ marginBottom: 15 }}
            >
              {categories.map((cat) => {
                const isActive = cat === selectedCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                  >
                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 32, marginBottom: 10 }}>🍽️</Text>
            <Text style={styles.emptyText}>No matching items found</Text>
            <Text style={styles.emptySub}>Try searching for something else.</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', maxWidth: '65%' },
  restaurantSection: { padding: 16, alignItems: 'center' },
  coverImage: { width: '100%', height: 160, borderRadius: 20, opacity: 0.85 },
  detailsCard: { width: '92%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginTop: -50, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  brandName: { fontSize: 20, fontWeight: '800', color: '#1E2022', fontFamily: 'Outfit', textAlign: 'center', marginBottom: 4 },
  cuisineText: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center', marginBottom: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F5', borderBottomWidth: 1, borderBottomColor: '#F3F4F5', marginBottom: 12 },
  metaCol: { alignItems: 'center' },
  metaVal: { fontSize: 14, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  metaLabel: { fontSize: 10, color: '#7E8B97', fontFamily: 'Outfit', marginTop: 2 },
  verticalDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0' },
  couponRow: { backgroundColor: 'rgba(15,91,53,0.06)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center' },
  couponText: { fontSize: 12, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  menuHeader: { paddingHorizontal: 20, marginTop: 10, marginBottom: 12 },
  menuTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 10 },
  searchBar: { backgroundColor: '#F4F6F8', borderRadius: 12, flexDirection: 'row', alignItems: 'center', height: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  searchInput: { flex: 1, fontSize: 13, color: '#1E2022', fontFamily: 'Outfit', paddingVertical: 0 },
  categoriesContainer: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  categoryBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  categoryBtnActive: { borderColor: '#0F5B35', backgroundColor: '#0F5B35' },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#1E2022', fontFamily: 'Outfit' },
  categoryTextActive: { color: '#FFFFFF' },
  dishCard: { flexDirection: 'row', padding: 16, marginHorizontal: 20, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', gap: 14 },
  dishInfo: { flex: 1 },
  vegBadge: { width: 16, height: 16, borderWidth: 1.5, borderColor: '#4CAF50', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  vegDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50' },
  popularBadge: { backgroundColor: '#FFECEC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  popularBadgeText: { fontSize: 9, fontWeight: '700', color: '#FF2121', fontFamily: 'Outfit' },
  dishName: { fontSize: 16, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2 },
  dishPrice: { fontSize: 15, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit', marginBottom: 6 },
  dishDesc: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit', lineHeight: 16 },
  dishImageContainer: { width: 100, height: 100, position: 'relative' },
  dishImage: { width: '100%', height: '100%', borderRadius: 14 },
  addBtnWrapper: { position: 'absolute', bottom: -10, left: 10, right: 10, minHeight: 32 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit' },
});
