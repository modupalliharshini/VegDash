import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { orderService } from '@/services/orderService';


export const OrderHistory: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { addToCart } = stores.useCartStore();
  const { showToast } = stores.useToastStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderList = await orderService.getMyOrders();
        setOrders(orderList || []);
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  const getStatusText = (status: string) => {
    if (status === 'placed') return 'Placed';
    if (status === 'preparing') return 'Preparing';
    if (status === 'out_for_delivery') return 'Out for Delivery';
    if (status === 'delivered') return 'Delivered';
    if (status === 'cancelled') return 'Cancelled';
    return status;
  };

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (_) {
      return dateString;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const isCancelled = item.orderStatus === 'cancelled';
    const isDelivered = item.orderStatus === 'delivered';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId} numberOfLines={1}>
              VD-{item._id.substring(18).toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>{formatOrderDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, 
            isDelivered && styles.statusDelivered,
            isCancelled && styles.statusCancelled
          ]}>
            <Text style={[styles.statusText,
              isDelivered && { color: '#4CAF50' },
              isCancelled && { color: '#FF2121' }
            ]}>
              {getStatusText(item.orderStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ordered items list preview */}
        {item.items.map((prod: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <Image
              source={{ uri: prod.foodItem?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150' }}
              style={styles.itemImage}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{prod.foodItem?.name || 'Item'}</Text>
              <Text style={styles.itemQty}>Qty: {prod.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{prod.price}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Total: <Text style={styles.totalVal}>₹{item.totalAmount}</Text></Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {!isDelivered && !isCancelled && (
              <TouchableOpacity
                style={styles.trackBtn}
                onPress={() => navigate(constants.routes.CHECKOUT, { state: { orderId: item._id } })}
              >
                <Text style={styles.trackText}>Track Order</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.reorderBtn}
              onPress={() => handleReorder(item.items)}
            >
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0F5B35" />
        </View>
      ) : (
        /* Main List */
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 300 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🍽️</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 4 }}>No orders found</Text>
              <Text style={{ fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center' }}>Place some delicious meals to fill it up!</Text>
            </View>
          }
        />
      )}


      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  listContainer: { padding: 20, gap: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', padding: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 15, fontWeight: '800', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2 },
  orderDate: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F4F6F8' },
  statusDelivered: { backgroundColor: 'rgba(76,175,80,0.1)' },
  statusCancelled: { backgroundColor: 'rgba(255,33,33,0.1)' },
  statusText: { fontSize: 11, fontWeight: '700', fontFamily: 'Outfit' },
  divider: { height: 1, backgroundColor: '#F3F4F5', marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  itemImage: { width: 45, height: 45, borderRadius: 8 },
  itemName: { fontSize: 13, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2 },
  itemQty: { fontSize: 11, color: '#7E8B97', fontFamily: 'Outfit' },
  itemPrice: { fontSize: 13, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#7E8B97', fontFamily: 'Outfit' },
  totalVal: { fontSize: 16, fontWeight: '900', color: '#1E2022' },
  reorderBtn: { backgroundColor: '#E8F9F1', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  reorderText: { color: '#0F5B35', fontSize: 12, fontWeight: '700', fontFamily: 'Outfit' },
  trackBtn: { backgroundColor: '#0F5B35', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  trackText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: 'Outfit' },
});
