import { theme } from '@/theme/theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { orderService } from '@/services/orderService';

export const OrderSuccessful: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const orderId = (params as any)?.orderId || (params as any)?.state?.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error('Failed to load order receipt details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primaryGreen} />
        </View>
      </components.SafeAreaView>
    );
  }

  return (
    <components.SafeAreaView>
      <View style={styles.content}>
        {/* Success Icon Animation/Mock */}
        <View style={styles.successRing}>
          <Svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <Path d="M22 4L12 14.01l-3-3" />
          </Svg>
        </View>
 
        <Text style={styles.title}>Order Placed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your order has been received by Veg Dash and is being prepared with 100% vegetarian care.
        </Text>
 
        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>VD-{orderId ? orderId.substring(18).toUpperCase() : 'UNKNOWN'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated Delivery</Text>
            <Text style={styles.infoValue}>25-30 Mins</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Status</Text>
            <Text style={[styles.infoValue, { color: order?.paymentStatus === 'paid' ? '#4CAF50' : '#FE724E', textTransform: 'uppercase' }]}>
              {order?.paymentStatus || 'PENDING'}
            </Text>
          </View>
        </View>
 
        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigate(constants.routes.CHECKOUT, { state: { orderId } })}
          >
            <Text style={styles.trackBtnText}>Track Order</Text>
          </TouchableOpacity>
 
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigate(constants.routes.HOME)}
          >
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </components.SafeAreaView>
  );
};


const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFFFFF' },
  successRing: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(76,175,80,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: theme.colors.primaryText, fontFamily: 'Outfit', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: theme.colors.lightText, fontFamily: 'Outfit', textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  infoCard: { width: '100%', padding: 20, backgroundColor: theme.colors.warmWhite, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 35, gap: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, color: theme.colors.lightText, fontFamily: 'Outfit', fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  btnRow: { width: '100%', flexDirection: 'column', gap: 12 },
  trackBtn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', width: '100%' },
  trackBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
  homeBtn: { backgroundColor: '#FFFFFF', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: theme.colors.primaryGreen, width: '100%' },
  homeBtnText: { color: theme.colors.primaryGreen, fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
});
