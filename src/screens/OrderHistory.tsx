import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator, Dimensions, Platform } from 'react-native';
import Svg, { Line, Path, Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { orderService } from '@/services/orderService';
import { theme } from '@/theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const OrderHistory: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { addToCart } = stores.useCartStore();
  const { showToast } = stores.useToastStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'favourites'>('past');

  useFocusEffect(
    React.useCallback(() => {
      const fetchOrders = async () => {
        try {
          const orderList = await orderService.getMyOrders();
          setOrders(orderList || []);
          const hasActive = orderList.some((o: any) => 
            o.status !== 'delivered' && o.status !== 'cancelled' && 
            o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
          );
          if (hasActive) {
            setActiveTab('current');
          }
        } catch (err) {
          console.error('Failed to load order history:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, [])
  );

  // Sort orders by date descending (latest first)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Find the single most recent active order
  const latestActiveOrder = sortedOrders.find(o => 
    o.status !== 'delivered' && o.status !== 'cancelled' && 
    o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
  );

  // Only the single most recent active order is shown in current tab
  const activeOrders = latestActiveOrder ? [latestActiveOrder] : [];

  // All other orders go to the past tab
  const pastOrders = sortedOrders.filter(o => !latestActiveOrder || o._id !== latestActiveOrder._id);

  const handleReorder = (orderItems: any[]) => {
    orderItems.forEach((item) => {
      const dish: any = {
        id: item.foodItem?._id || Math.random().toString(),
        name: item.foodItem?.name || 'Veg Dish',
        price: item.price,
        image: item.foodItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150',
        description: '',
        category: item.foodItem?.category || 'Reorder',
        cookingTime: 20,
        rating: 4.5,
      };
      addToCart(dish);
    });
    showToast('Items added to Cart!');
    navigate(constants.routes.ORDER);
  };

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      return `${day} ${month}, ${year}  •  ${hours}:${minStr} ${ampm}`;
    } catch (_) {
      return dateString;
    }
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderActiveOrderItem = ({ item }: { item: any }) => {
    const statusLabel = formatStatusLabel(item.status || item.orderStatus || 'placed');
    const firstItemImage = item.items?.[0]?.foodItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150';
    const itemsText = item.items?.map((i: any) => i.foodItem?.name).join(', ') || 'Veg Dish';

    return (
      <View style={styles.card}>
        <Image source={{ uri: firstItemImage }} style={styles.cardImage} />
        
        <View style={styles.cardInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#D97706' }} />
            <Text style={[styles.statusText, { color: '#D97706', fontSize: 10.5, fontWeight: '700' }]}>
              {statusLabel}
            </Text>
          </View>
          
          <Text style={styles.kitchenName}>{item.restaurantName || 'Sattvik Kitchen'}</Text>
          <Text style={styles.itemsSummary} numberOfLines={1}>
            {item.items?.length || 1} {item.items?.length === 1 ? 'Item' : 'Items'}  •  {itemsText}
          </Text>
          <Text style={styles.orderDate}>{formatOrderDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.orderPrice}>₹{item.totalAmount}</Text>
          <TouchableOpacity 
            style={[styles.reorderBtn, { borderColor: '#0B4D3A', borderWidth: 1.2, paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#FFFFFF' }]} 
            onPress={() => navigate(constants.routes.CHECKOUT, { state: { orderId: item._id } })}
          >
            <Text style={[styles.reorderText, { color: '#0B4D3A' }]}>Track  ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const isCancelled = item.orderStatus === 'cancelled';
    const firstItemImage = item.items?.[0]?.foodItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150';
    const itemsText = item.items?.map((i: any) => i.foodItem?.name).join(', ') || 'Veg Dish';

    return (
      <View style={styles.card}>
        <Image source={{ uri: firstItemImage }} style={styles.cardImage} />
        
        <View style={styles.cardInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <View style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: isCancelled ? '#FF2121' : '#2E7D32',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900' }}>{isCancelled ? '✕' : '✓'}</Text>
            </View>
            <Text style={[styles.statusText, { color: isCancelled ? '#FF2121' : '#2E7D32' }]}>
              {isCancelled ? 'Cancelled' : 'Delivered'}
            </Text>
          </View>
          
          <Text style={styles.kitchenName}>{item.restaurantName || 'Sattvik Kitchen'}</Text>
          <Text style={styles.itemsSummary} numberOfLines={1}>
            {item.items?.length || 1} {item.items?.length === 1 ? 'Item' : 'Items'}  •  {itemsText}
          </Text>
          <Text style={styles.orderDate}>{formatOrderDate(item.createdAt)}</Text>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.orderPrice}>₹{item.totalAmount}</Text>
          <TouchableOpacity 
            style={styles.reorderBtn} 
            onPress={() => handleReorder(item.items || [])}
          >
            <Text style={styles.reorderText}>Reorder  ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <components.SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSubtitle}>delicious meals, delivered with care</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigate(constants.routes.NOTIFICATIONS)}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Filter Segment Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'current' && styles.tabButtonActive]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.tabTextActive]}>Current</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>Past Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'favourites' && styles.tabButtonActive]}
          onPress={() => setActiveTab('favourites')}
        >
          <Text style={[styles.tabText, activeTab === 'favourites' && styles.tabTextActive]}>Favourites</Text>
        </TouchableOpacity>
      </View>

      {/* Gold Member Delivery Savings Banner */}
      <TouchableOpacity 
        style={styles.goldSavingsCard}
        onPress={() => navigate(constants.routes.MY_PROMOCODES)}
        activeOpacity={0.9}
      >
        <View style={styles.goldIconBg}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="#C7A96B">
            <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
          </Svg>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.goldSavingsTitle}>VegDash Gold Member</Text>
          <Text style={styles.goldSavingsSub}>You saved ₹1,496 on delivery fees</Text>
        </View>
        <Text style={styles.viewBenefitsLink}>View Benefits  ›</Text>
      </TouchableOpacity>

      {/* Order History Header Row (Mockup 2) */}
      {activeTab === 'past' && !loading && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 22, marginBottom: 4 }}>
          <Text style={{ fontSize: 18, fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif', fontWeight: '700', color: theme.colors.primaryText }}>Order History</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#5E5E5E" strokeWidth={2.5}>
              <Path d="M4 6h16M6 12h12M8 18h8" />
            </Svg>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#5E5E5E' }}>Filter</Text>
            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#5E5E5E" strokeWidth={2.5}>
              <Path d="M6 9l6 6 6-6" />
            </Svg>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primaryGreen} />
        </View>
      ) : activeTab === 'current' ? (
        /* Current Orders List */
        <FlatList
          data={activeOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderActiveOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🥬</Text>
              <Text style={styles.emptyText}>No active orders</Text>
              <Text style={styles.emptySub}>Place some delicious meals to track them here!</Text>
            </View>
          }
        />
      ) : activeTab === 'past' ? (
        /* Past Orders List */
        <FlatList
          data={pastOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            /* Customer support banner at the bottom of the list */
            <View style={styles.supportCard}>
              <View style={styles.supportIconBg}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0B4D3A" strokeWidth={2.5}>
                  <Path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </Svg>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.supportTitle}>Need help with your order?</Text>
                <Text style={styles.supportSub}>Our support team is here for you.</Text>
              </View>
              <TouchableOpacity style={styles.supportBtn} onPress={() => navigate(constants.routes.FAQ)}>
                <Text style={styles.supportBtnText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🍽️</Text>
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySub}>Place some delicious meals to fill it up!</Text>
            </View>
          }
        />
      ) : (
        /* Favourites tab */
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>❤️</Text>
          <Text style={styles.emptyText}>No favourites yet</Text>
          <Text style={styles.emptySub}>Mark your favorite restaurants to see them here.</Text>
        </View>
      )}

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
    fontSize: 24, fontWeight: '800', color: theme.colors.primaryGreen,
  },
  headerSubtitle: { fontSize: 12, color: theme.colors.secondaryText, marginTop: 2 },
  bellBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border,
    justifyContent: 'center', alignItems: 'center',
  },

  // Tabs
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.divider, backgroundColor: theme.colors.background },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: theme.colors.primaryGreen },
  tabText: { fontSize: 13, color: theme.colors.secondaryText, fontWeight: '600' },
  tabTextActive: { color: theme.colors.primaryGreen, fontWeight: '700' },

  // Gold Member banner
  goldSavingsCard: {
    marginHorizontal: 20, marginTop: 18,
    backgroundColor: '#FAF8F5',
    borderRadius: 16, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
    borderWidth: 1, borderColor: '#EAE6DF',
  },
  goldIconBg: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#0A3B2E', justifyContent: 'center', alignItems: 'center' },
  goldSavingsTitle: { fontSize: 12, fontWeight: '700', color: '#0A3B2E' },
  goldSavingsSub: { fontSize: 10, color: '#5E5E5E', marginTop: 1 },
  viewBenefitsLink: { fontSize: 10, fontWeight: '700', color: '#C7A96B' },

  // Order cards
  listContainer: { padding: 20, paddingTop: 10, gap: 14 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9',
    padding: 12, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#0B4D3A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  cardImage:  { width: 65, height: 65, borderRadius: 12 },
  cardInfo:   { flex: 1, marginLeft: 14, justifyContent: 'center' },
  statusIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  statusText: { fontSize: 10, fontWeight: '700', color: theme.colors.success },
  kitchenName:  { fontSize: 15, fontWeight: '700', color: theme.colors.primaryText, marginTop: 1, fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif' },
  itemsSummary: { fontSize: 11, color: theme.colors.secondaryText, marginTop: 3 },
  orderDate:    { fontSize: 10, color: theme.colors.lightText, marginTop: 2 },
  cardRight:    { alignItems: 'flex-end', justifyContent: 'space-between', height: 65 },
  orderPrice:   { fontSize: 15, fontWeight: '700', color: theme.colors.primaryText },
  reorderBtn:   { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFFFFF' },
  reorderText:  { fontSize: 10, fontWeight: '700', color: theme.colors.primaryText },

  // Support footer
  supportCard: {
    backgroundColor: '#0B4D3A', borderRadius: 20,
    padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 20,
  },
  supportIconBg:  { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  supportTitle:   { color: '#FFFFFF', fontWeight: '700', fontSize: 13, fontFamily: 'Inter' },
  supportSub:     { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2, fontFamily: 'Inter' },
  supportBtn:     { borderWidth: 1, borderColor: '#C7A96B', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'transparent' },
  supportBtnText: { color: '#C7A96B', fontWeight: '700', fontSize: 10.5, fontFamily: 'Inter' },

  // Loader / empty
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 6 },
  emptySub:  { fontSize: 12, color: theme.colors.lightText, textAlign: 'center', lineHeight: 16 },
});
