import { theme } from '@/theme/theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline, Path, Circle } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { DishType } from '@/types';
import { foodService } from '@/services/foodService';

// Heart icon
const HeartIcon: React.FC<{ active: boolean }> = ({ active }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? '#FF2121' : 'none'} stroke={active ? '#FF2121' : theme.colors.primaryText} strokeWidth={2}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const Dish: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  
  // Extract dishId from params (with fallbacks)
  const routerParams = params as any;
  const dishId = routerParams?.dishId || routerParams?.state?.dishId;

  const [dish, setDish] = useState<DishType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { list: wishlist, addToWishlist, removeFromWishlist } = stores.useWishlistStore();
  const { list: cart, addToCart, removeFromCart } = stores.useCartStore();
  const { showToast } = stores.useToastStore();

  useEffect(() => {
    if (!dishId) return;
    const fetchDish = async () => {
      setIsLoading(true);
      try {
        const item = await foodService.getFoodItemById(dishId);
        if (item) {
          setDish({
            id: item._id,
            name: item.name,
            price: item.price,
            image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300',
            description: item.description || 'Delicately prepared with organic, 100% vegetarian ingredients. Highly recommended by chef.',
            category: item.category || 'Dishes',
            cookingTime: item.cookingTime || 30,
            rating: item.rating || 4.5,
            ingredients: item.ingredients || ['Fresh Vegetables', 'Organic Herbs', 'Spices'],
          });
        }
      } catch (err) {
        console.error('Failed to load food item details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDish();
  }, [dishId]);

  const isFav = wishlist.some(item => item.id === dishId);
  const cartItem = cart.find(item => item.id === dishId);
  const quantity = cartItem?.quantity || 0;


  // Track checked ingredients state locally for visual feedback
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [ing]: !prev[ing]
    }));
  };

  const toggleWishlist = () => {
    if (!dish) return;
    if (isFav) {
      removeFromWishlist(dish);
      showToast(`${dish.name} removed from Wishlist`);
    } else {
      addToWishlist(dish);
      showToast(`${dish.name} added to Wishlist`);
    }
  };

  if (isLoading || !dish) {
    return (
      <components.SafeAreaView>
        <View style={styles.center}>
          <components.Loader />
        </View>
      </components.SafeAreaView>
    );
  }

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {dish.name}
        </Text>
        <TouchableOpacity onPress={toggleWishlist} style={styles.headerBtn}>
          <HeartIcon active={isFav} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Big Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: dish.image }} style={styles.dishImage} resizeMode="cover" />
          <View style={styles.badgeRow}>
            <View style={styles.vegBadge}>
              <View style={styles.vegDot} />
            </View>
            <View style={styles.timeBadge}>
              <Text style={styles.badgeText}>🕒 {dish.cookingTime} mins</Text>
            </View>
            <View style={styles.weightBadge}>
              <Text style={styles.badgeText}>⚖️ {dish.weight || '300g'}</Text>
            </View>
          </View>
        </View>

        {/* Name and Price */}
        <View style={styles.nameSection}>
          <View style={styles.titleRow}>
            <Text style={styles.dishName}>{dish.name}</Text>
            <Text style={styles.dishPrice}>₹{dish.price}</Text>
          </View>
          <View style={styles.ratingRow}>
            <components.Rating rating={3} />
            <Text style={styles.ratingText}>{dish.rating || '4.0'} / 5.0 Rating</Text>
            <Text style={styles.categoryTag}>{dish.category}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descText}>
            {dish.description || 'Delicately prepared with organic, 100% vegetarian ingredients. Highly recommended by chef.'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Ingredients section */}
        {dish.ingredients && dish.ingredients.length > 0 && (
          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.ingredientsSub}>Select ingredients to customize your meal or check contents:</Text>
            <View style={styles.ingredientsGrid}>
              {dish.ingredients.map((ing) => {
                const isChecked = !!checkedIngredients[ing];
                return (
                  <TouchableOpacity
                    key={ing}
                    style={[styles.ingredientItem, isChecked && styles.ingredientItemChecked]}
                    onPress={() => toggleIngredient(ing)}
                    activeOpacity={0.7}
                  >
                    <components.Checkbox checked={isChecked} />
                    <Text style={[styles.ingredientLabel, isChecked && styles.ingredientLabelChecked]}>
                      {ing}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom floating control bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.totalPriceLabel}>Total Price</Text>
          <Text style={styles.totalPriceVal}>₹{dish.price * (quantity || 1)}</Text>
        </View>

        {quantity > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={styles.qtyContainer}>
              <TouchableOpacity onPress={() => removeFromCart(dish)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity onPress={() => addToCart(dish)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.goCartBtn}
              onPress={() => navigate(constants.routes.ORDER)}
            >
              <Text style={styles.goCartBtnText}>Go to Cart</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCartBtn}
            onPress={() => {
              addToCart(dish);
              showToast(`${dish.name} added to cart`);
            }}
          >
            <Text style={styles.addCartBtnText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.warmWhite },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit', maxWidth: '60%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 40 },
  imageContainer: { width: '100%', height: 260, position: 'relative', backgroundColor: theme.colors.warmWhite },
  dishImage: { width: '100%', height: '100%' },
  badgeRow: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', gap: 10, alignItems: 'center' },
  vegBadge: { width: 24, height: 24, borderWidth: 2, borderColor: '#4CAF50', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  vegDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
  timeBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  weightBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit' },
  nameSection: { padding: 20, backgroundColor: '#FFFFFF' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dishName: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryText, fontFamily: 'Outfit', flex: 1, textTransform: 'capitalize' },
  dishPrice: { fontSize: 22, fontWeight: '900', color: theme.colors.primaryGreen, fontFamily: 'Outfit', marginLeft: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { fontSize: 13, color: theme.colors.lightText, fontFamily: 'Outfit', fontWeight: '500' },
  categoryTag: { marginLeft: 'auto', backgroundColor: theme.colors.softSuccessBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 11, color: theme.colors.primaryGreen, fontWeight: '700', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: theme.colors.warmWhite, marginHorizontal: 20 },
  descSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit', marginBottom: 8 },
  descText: { fontSize: 14, color: '#666', lineHeight: 20, fontFamily: 'Outfit' },
  ingredientsSection: { padding: 20 },
  ingredientsSub: { fontSize: 13, color: theme.colors.lightText, fontFamily: 'Outfit', marginBottom: 12 },
  ingredientsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ingredientItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: '#FFFFFF' },
  ingredientItemChecked: { borderColor: theme.colors.primaryGreen, backgroundColor: theme.colors.softSuccessBg },
  ingredientLabel: { fontSize: 13, color: theme.colors.primaryText, fontFamily: 'Outfit', textTransform: 'capitalize' },
  ingredientLabelChecked: { color: theme.colors.primaryGreen, fontWeight: '600' },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: theme.colors.warmWhite, backgroundColor: '#FFFFFF' },
  bottomPriceCol: { flexDirection: 'column' },
  totalPriceLabel: { fontSize: 12, color: theme.colors.lightText, fontFamily: 'Outfit' },
  totalPriceVal: { fontSize: 20, fontWeight: '900', color: theme.colors.primaryGreen, fontFamily: 'Outfit' },
  addCartBtn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 16, paddingHorizontal: 36, paddingVertical: 14, height: 50, alignItems: 'center', justifyContent: 'center' },
  addCartBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', width: 100, height: 48, borderRadius: 16, borderWidth: 2, borderColor: theme.colors.primaryGreen, justifyContent: 'space-between', paddingHorizontal: 10 },
  qtyBtn: { padding: 4 },
  qtyBtnText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primaryGreen },
  qtyText: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryGreen, fontFamily: 'Outfit' },
  goCartBtn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 16, paddingHorizontal: 20, height: 48, alignItems: 'center', justifyContent: 'center' },
  goCartBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'Outfit' },
});
