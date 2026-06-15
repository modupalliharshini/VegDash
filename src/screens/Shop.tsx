import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline, Circle, Path, Polygon } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { DishType } from '@/types';
import { searchService } from '@/services/searchService';
import { restaurantService } from '@/services/restaurantService';

// Heart Wishlist toggle icon
const HeartIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={active ? '#FF2121' : 'none'} stroke={active ? '#FF2121' : '#7E8B97'} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const Shop: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const { list: wishlist, addToWishlist, removeFromWishlist } = stores.useWishlistStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [matchedRestaurants, setMatchedRestaurants] = useState<any[]>([]);
  const [matchedDishes, setMatchedDishes] = useState<any[]>([]);

  // Category dishes (defaults when query is empty)
  const [satvikDishes, setSatvikDishes] = useState<any[]>([]);
  const [templeDishes, setTempleDishes] = useState<any[]>([]);
  const [healthyDishes, setHealthyDishes] = useState<any[]>([]);

  const routerParams = params as any;
  const initialCategory = routerParams?.category || routerParams?.state?.category || 'All';

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Load defaults on mount
  useEffect(() => {
    const loadDefaults = async () => {
      setLoading(true);
      try {
        const [resList, trendingData] = await Promise.all([
          restaurantService.getRestaurants(),
          searchService.getTrending(),
        ]);
        setRestaurants(resList || []);

        const items = trendingData?.popularItems || [];
        setSatvikDishes(items.filter((d: any) => {
          const cat = (d.category || '').toLowerCase();
          return cat.includes('satvik') || cat.includes('jain') || cat.includes('thali') || cat.includes('course');
        }).slice(0, 3));
        setTempleDishes(items.filter((d: any) => {
          const cat = (d.category || '').toLowerCase();
          return cat.includes('prasad') || cat.includes('temple');
        }).slice(0, 2));
        setHealthyDishes(items.filter((d: any) => {
          const cat = (d.category || '').toLowerCase();
          return cat.includes('bowl') || cat.includes('salad') || cat.includes('soup') || cat.includes('healthy');
        }).slice(0, 3));
      } catch (err) {
        console.error('Failed to load search page defaults:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDefaults();
  }, []);

  // Search trigger when query or category changes
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setMatchedRestaurants([]);
        setMatchedDishes([]);
        return;
      }
      setSearching(true);
      try {
        const results = await searchService.search(searchQuery);
        setMatchedRestaurants(results.restaurants || []);
        setMatchedDishes(results.foodItems || []);
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setSearching(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Main Categories
  const categories = [
    'All',
    'Pure Vegetarian Restaurants',
    'Jain Food',
    'Satvik Meals',
    'Healthy Foods',
    'Organic Food Partners',
    'Temple Prasadam Deliveries'
  ];

  // Filter matchedDishes by selectedCategory
  const filteredMatchedDishes = useMemo(() => {
    if (selectedCategory === 'All') return matchedDishes;
    return matchedDishes.filter((dish) => {
      const cat = (dish.category || '').toLowerCase();
      const sel = selectedCategory.toLowerCase();
      
      if (sel.includes('jain')) {
        return cat.includes('jain') || cat.includes('specials');
      }
      if (sel.includes('satvik') || sel.includes('sattvik')) {
        return cat.includes('satvik') || cat.includes('thali') || cat.includes('course');
      }
      if (sel.includes('temple') || sel.includes('prasadam')) {
        return cat.includes('prasad') || cat.includes('temple');
      }
      if (sel.includes('healthy') || sel.includes('organic')) {
        return cat.includes('bowl') || cat.includes('salad') || cat.includes('soup') || cat.includes('organic') || cat.includes('healthy');
      }
      if (sel.includes('pure vegetarian') || sel.includes('vegetarian')) {
        return true; // All dishes are vegetarian
      }
      return cat.includes(sel) || sel.includes(cat);
    });
  }, [matchedDishes, selectedCategory]);

  const toggleWishlist = (dish: DishType) => {
    const isFav = wishlist.some((item) => item.id === dish.id);
    if (isFav) {
      removeFromWishlist(dish);
    } else {
      addToWishlist(dish);
    }
  };


  const formatDish = (item: any): DishType => {
    return {
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150',
      description: item.description || '',
      category: item.category || 'Dishes',
      cookingTime: item.cookingTime || 30,
      rating: item.rating || 4.5,
      restaurantId: item.restaurant?._id || item.restaurant,
    };
  };

  const renderDishGridCard = ({ item }: { item: any }) => {
    const dish = formatDish(item);
    const isFav = wishlist.some((fav) => fav.id === dish.id);
    return (
      <View style={styles.gridCard}>
        <TouchableOpacity
          onPress={() => navigate(constants.routes.DISH, { state: { dishId: dish.id, from: constants.routes.SHOP } })}
          activeOpacity={0.8}
        >
          <Image source={{ uri: dish.image }} style={styles.gridImage} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.favBtn} onPress={() => toggleWishlist(dish)}>
          <HeartIcon active={isFav} />
        </TouchableOpacity>
 
        <View style={styles.gridDetails}>
          <View style={styles.ratingRow}>
            <components.Rating rating={3} />
            <Text style={styles.ratingText}>({dish.rating})</Text>
            <Text style={styles.cookTime}>🕒 {dish.cookingTime}m</Text>
          </View>
 
          <Text style={styles.cardName} numberOfLines={1}>
            {dish.name}
          </Text>
          
          <Text style={styles.cardPrice}>₹{dish.price}</Text>
 
          <View style={{ marginTop: 8 }}>
            <components.AddToCart dish={dish} vertical={true} />
          </View>
        </View>
      </View>
    );
  };
 
  const renderDishRowItem = (item: any) => {
    const dish = formatDish(item);
    return (
      <TouchableOpacity
        key={dish.id}
        style={styles.dishRowCard}
        onPress={() => navigate(constants.routes.DISH, { state: { dishId: dish.id, from: constants.routes.SHOP } })}
        activeOpacity={0.9}
      >
        <Image source={{ uri: dish.image }} style={styles.dishRowImage} />
        <View style={styles.dishRowInfo}>
          <Text style={styles.dishRowName}>{dish.name}</Text>
          <Text style={styles.dishRowDesc} numberOfLines={1}>{dish.description}</Text>
          <Text style={styles.dishRowPrice}>₹{dish.price}</Text>
        </View>
        <View style={styles.dishRowAction}>
          <components.AddToCart dish={dish} vertical={true} />
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <components.SafeAreaView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Cuisines & Brands</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#7E8B97" strokeWidth={2.2}>
            <Circle cx={11} cy={11} r={8} /><Line x1={21} y1={21} x2={16.65} y2={16.65} />
          </Svg>
          <TextInput
            placeholder="Search restaurants, dishes, cuisines..."
            placeholderTextColor="#7E8B97"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ fontSize: 16, color: '#7E8B97', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F5B35" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* CATEGORY SELECTOR CAROUSEL (Always Visible) */}
          <View style={{ height: 48, marginBottom: 10 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
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
          </View>

          {/* EMPTY QUERY STATE (Default Recommendations - Vertical Scrolling) */}
          {!searchQuery.trim() && (
            <View>
              {/* 1. Restaurants Near You (Vertical Cards) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vegetarian Restaurants Near You</Text>
              </View>
              <View style={styles.verticalListContainer}>
                {restaurants.map((res) => (
                  <TouchableOpacity
                    key={res._id}
                    style={styles.restaurantCard}
                    onPress={() => navigate(constants.routes.RESTAURANT_MENU, { state: { restaurantId: res._id, from: constants.routes.SHOP } })}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{ uri: res.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=250' }}
                      style={styles.restaurantImage}
                    />
                    <View style={styles.restaurantRating}>
                      <Svg width={10} height={10} viewBox="0 0 24 24" fill="#FFC700" stroke="#FFC700" strokeWidth={1}>
                        <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </Svg>
                      <Text style={styles.restaurantRatingText}>{res.rating || '4.5'}</Text>
                    </View>
                    <View style={styles.restaurantDetails}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.restaurantName}>{res.name}</Text>
                        <Text style={styles.couponTag}>{res.discountText ? res.discountText.split(' ')[0] : '10%'} OFF</Text>
                      </View>
                      <Text style={styles.restaurantCuisine}>
                        {Array.isArray(res.categories) ? res.categories.join(', ') : 'Pure Veg'}
                      </Text>
                      <Text style={styles.restaurantMeta}>🕒 {res.deliveryTime || '30-40 min'}  |  ₹₹</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 2. Trending Satvik & Jain Specials (Vertical List) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Satvik & Jain Specials</Text>
              </View>
              <View style={styles.verticalRowsContainer}>
                {satvikDishes.map(renderDishRowItem)}
              </View>

              {/* 3. Temple Prasadam Specials (Vertical List) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Temple Prasadam Deliveries</Text>
              </View>
              <View style={styles.verticalRowsContainer}>
                {templeDishes.map(renderDishRowItem)}
              </View>

              {/* 4. Healthy Selections (Vertical List) */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Healthy Quick Bites</Text>
              </View>
              <View style={styles.verticalRowsContainer}>
                {healthyDishes.map(renderDishRowItem)}
              </View>
            </View>
          )}

          {/* ACTIVE QUERY STATE (Grouped Search Results) */}
          {!!searchQuery.trim() && (
            <View>
              {searching ? (
                <View style={{ marginVertical: 30, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#0F5B35" />
                  <Text style={{ fontSize: 13, color: '#7E8B97', marginTop: 8, fontFamily: 'Outfit' }}>Searching...</Text>
                </View>
              ) : (
                <>
                  {/* MATCHED RESTAURANTS */}
                  {matchedRestaurants.length > 0 && (
                    <View>
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Brands matching "{searchQuery}"</Text>
                      </View>
                      <View style={styles.verticalListContainer}>
                        {matchedRestaurants.map((res) => (
                          <TouchableOpacity
                            key={res._id}
                            style={styles.restaurantCard}
                            onPress={() => navigate(constants.routes.RESTAURANT_MENU, { state: { restaurantId: res._id, from: constants.routes.SHOP } })}
                            activeOpacity={0.9}
                          >
                            <Image
                              source={{ uri: res.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=250' }}
                              style={styles.restaurantImage}
                            />
                            <View style={styles.restaurantRating}>
                              <Svg width={10} height={10} viewBox="0 0 24 24" fill="#FFC700" stroke="#FFC700" strokeWidth={1}>
                                <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </Svg>
                              <Text style={styles.restaurantRatingText}>{res.rating || '4.5'}</Text>
                            </View>
                            <View style={styles.restaurantDetails}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.restaurantName}>{res.name}</Text>
                                <Text style={styles.couponTag}>{res.discountText ? res.discountText.split(' ')[0] : '10%'} OFF</Text>
                              </View>
                              <Text style={styles.restaurantCuisine}>
                                {Array.isArray(res.categories) ? res.categories.join(', ') : 'Pure Veg'}
                              </Text>
                              <Text style={styles.restaurantMeta}>🕒 {res.deliveryTime || '30-40 min'}  |  ₹₹</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* MATCHED DISHES */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Dishes matching "{searchQuery}"</Text>
                  </View>

                  {filteredMatchedDishes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={{ fontSize: 32, marginBottom: 10 }}>🔍</Text>
                      <Text style={styles.emptyText}>No matching dishes found</Text>
                      <Text style={styles.emptySub}>Try searching for something else or change categories.</Text>
                    </View>
                  ) : (
                    <FlatList
                      data={filteredMatchedDishes}
                      keyExtractor={(item) => (item.id || item._id).toString()}
                      renderItem={renderDishGridCard}
                      numColumns={2}
                      scrollEnabled={false}
                      contentContainerStyle={styles.listContainer}
                      columnWrapperStyle={styles.rowWrapper}
                    />
                  )}
                </>
              )}
            </View>
          )}
        </ScrollView>
      )}

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  searchSection: { paddingHorizontal: 20, marginVertical: 12 },
  searchBar: { backgroundColor: '#F4F6F8', borderRadius: 16, flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#1E2022', fontFamily: 'Outfit', paddingVertical: 0 },
  categoriesContainer: { paddingHorizontal: 20, gap: 10, alignItems: 'center' },
  categoryBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  categoryBtnActive: { borderColor: '#0F5B35', backgroundColor: '#0F5B35' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#1E2022', fontFamily: 'Outfit' },
  categoryTextActive: { color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 300 },
  sectionHeader: { paddingHorizontal: 20, marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E2022', fontFamily: 'Outfit' },
  verticalListContainer: { paddingHorizontal: 20, gap: 16 },
  restaurantCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', position: 'relative' },
  restaurantImage: { width: '100%', height: 135 },
  restaurantRating: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 3 },
  restaurantRatingText: { fontSize: 11, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  restaurantDetails: { padding: 14 },
  restaurantName: { fontSize: 16, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  couponTag: { backgroundColor: 'rgba(15,91,53,0.08)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 10, fontWeight: '800', color: '#0F5B35', fontFamily: 'Outfit' },
  restaurantCuisine: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit', marginVertical: 4, fontWeight: '500' },
  restaurantMeta: { fontSize: 11, color: '#1E2022', fontFamily: 'Outfit', fontWeight: '600' },
  verticalRowsContainer: { paddingHorizontal: 20, gap: 12 },
  dishRowCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12 },
  dishRowImage: { width: 60, height: 60, borderRadius: 12 },
  dishRowInfo: { flex: 1 },
  dishRowName: { fontSize: 14, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2 },
  dishRowDesc: { fontSize: 11, color: '#7E8B97', fontFamily: 'Outfit', marginBottom: 4 },
  dishRowPrice: { fontSize: 13, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  dishRowAction: { width: 100 },
  listContainer: { paddingHorizontal: 14 },
  rowWrapper: { justifyContent: 'space-between', marginBottom: 14 },
  gridCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', position: 'relative' },
  gridImage: { width: '100%', height: 110 },
  favBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, padding: 6, zIndex: 10 },
  gridDetails: { padding: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  ratingText: { fontSize: 10, color: '#7E8B97' },
  cookTime: { fontSize: 10, color: '#7E8B97', marginLeft: 'auto' },
  cardName: { fontSize: 14, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2, textTransform: 'capitalize' },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 4 },
  emptySub: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center' },
});
