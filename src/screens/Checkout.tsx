import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline, Circle, Path, Polygon } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { orderService } from '@/services/orderService';

export const Checkout: React.FC = () => {
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
        console.error('Failed to fetch order status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Setup polling every 5 seconds
    const interval = setInterval(async () => {
      try {
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
        if (orderData.orderStatus === 'delivered' || orderData.orderStatus === 'cancelled') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Polling failed:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const getStepStatus = (stepName: string, currentStatus: string) => {
    const statusOrder = ['placed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepName);

    if (currentStatus === 'cancelled') return 'pending';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getStepTime = (stepName: string, statusHistory: any[]) => {
    const record = statusHistory?.find((h) => h.status === stepName);
    if (!record) return '';
    try {
      const date = new Date(record.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };

  const timelineSteps = order ? [
    { title: 'Order Placed', time: getStepTime('placed', order.statusHistory), status: getStepStatus('placed', order.orderStatus) },
    { title: 'Preparing Your Order', time: getStepTime('preparing', order.statusHistory), status: getStepStatus('preparing', order.orderStatus) },
    { title: 'Out for Delivery', time: getStepTime('out_for_delivery', order.statusHistory), status: getStepStatus('out_for_delivery', order.orderStatus) },
    { title: 'Delivered', time: getStepTime('delivered', order.statusHistory), status: getStepStatus('delivered', order.orderStatus) },
  ] : [];


  const getProgressInfo = (status: string) => {
    if (status === 'placed') return { width: '25%', dots: 1 };
    if (status === 'preparing') return { width: '50%', dots: 2 };
    if (status === 'out_for_delivery') return { width: '75%', dots: 3 };
    if (status === 'delivered') return { width: '100%', dots: 4 };
    return { width: '0%', dots: 0 };
  };

  const { width: progressWidth, dots: progressDots } = getProgressInfo(order?.orderStatus || 'placed');

  if (loading) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}><Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" /></Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0F5B35" />
        </View>
      </components.SafeAreaView>
    );
  }

  if (!order) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}><Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" /></Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: '#7E8B97', textAlign: 'center' }}>Order could not be found or tracked.</Text>
        </View>
      </components.SafeAreaView>
    );
  }

  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}><Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" /></Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 40 }} />
      </View>
 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order ID + Help */}
        <View style={styles.orderRow}>
          <Text style={styles.orderId}>Order ID: VD-{order._id.substring(18).toUpperCase()}</Text>
          <TouchableOpacity onPress={() => navigate(constants.routes.FAQ)}>
            <Text style={styles.helpLink}>Help</Text>
          </TouchableOpacity>
        </View>
 
        <View style={styles.divider} />
 
        {/* ETA */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.etaLabel}>Estimated Delivery</Text>
          <Text style={styles.etaTime}>
            {order.orderStatus === 'delivered' ? 'Delivered' : order.orderStatus === 'cancelled' ? 'Cancelled' : '25-30 min'}
          </Text>
          <Text style={styles.etaTitle}>
            {order.orderStatus === 'placed' && 'Preparing your pure vegetarian food'}
            {order.orderStatus === 'preparing' && 'Chef is crafting your order'}
            {order.orderStatus === 'out_for_delivery' && 'Your food is out for delivery'}
            {order.orderStatus === 'delivered' && 'Enjoy your good food!'}
            {order.orderStatus === 'cancelled' && 'Order has been cancelled'}
          </Text>
        </View>
 
        {/* Horizontal progress dots */}
        {order.orderStatus !== 'cancelled' && (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack} />
            <View style={[styles.progressFill, { width: progressWidth as any }]} />
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.progressDot, i < progressDots ? styles.progressDotFilled : styles.progressDotEmpty]} />
            ))}
          </View>
        )}
 
        <View style={styles.divider} />
 
        {/* Timeline */}
        {timelineSteps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          return (
            <View key={idx} style={[styles.timelineRow, isActive && styles.timelineRowActive]}>
              {idx < timelineSteps.length - 1 && (
                <View style={[styles.connector, { backgroundColor: isCompleted ? '#4CAF50' : '#E2E8F0' }]} />
              )}
              <View style={[styles.stepDot,
                isCompleted && styles.stepDotCompleted,
                isActive && styles.stepDotActive,
                !isCompleted && !isActive && styles.stepDotPending,
              ]}>
                {isCompleted && <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={4}><Polyline points="20 6 9 17 4 12" /></Svg>}
                {isActive && <Svg width={11} height={11} viewBox="0 0 24 24" fill="#fff" stroke="#fff"><Polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" /></Svg>}
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, isActive && { color: '#0F5B35', fontWeight: '700' }, !isActive && !isCompleted && { color: '#7E8B97' }]}>{step.title}</Text>
                {!!step.time && <Text style={[styles.stepTime, isActive && { color: '#0F5B35', fontWeight: '700' }]}>{step.time}</Text>}
              </View>
            </View>
          );
        })}
 
        <View style={styles.divider} />
 
        {/* Delivery Partner */}
        <View style={styles.partnerCard}>
          <Image source={{ uri: order.driver?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150' }} style={styles.partnerAvatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.partnerName}>{order.driver ? order.driver.name : 'Assigning partner...'}</Text>
            <Text style={styles.partnerSub}>{order.driver ? 'Your Delivery Partner' : 'Finding driver near restaurant'}</Text>
          </View>
          {order.driver && (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.iconBtn}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0F5B35" strokeWidth={2.5}><Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6z" /></Svg>
              </TouchableOpacity>
            </View>
          )}
        </View>
 
        <TouchableOpacity style={styles.receiptBtn} onPress={() => navigate(constants.routes.ORDER_SUCCESSFUL, { state: { orderId: order._id } })}>
          <Text style={styles.receiptBtnText}>View Order Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  orderId: { fontSize: 16, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  helpLink: { fontSize: 15, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  divider: { height: 1, backgroundColor: '#F3F4F5', marginVertical: 16 },
  etaLabel: { fontSize: 13, color: '#7E8B97', fontWeight: '600', fontFamily: 'Outfit', marginBottom: 6 },
  etaTime: { fontSize: 32, fontWeight: '900', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 8 },
  etaTitle: { fontSize: 16, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 4 },
  etaSub: { fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit' },
  progressRow: { position: 'relative', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  progressTrack: { position: 'absolute', left: 10, right: 10, height: 5, backgroundColor: '#E2E8F0', borderRadius: 2.5 },
  progressFill: { position: 'absolute', left: 10, height: 5, backgroundColor: '#4CAF50', borderRadius: 2.5 },
  progressDot: { width: 18, height: 18, borderRadius: 9, zIndex: 2 },
  progressDotFilled: { backgroundColor: '#4CAF50', shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  progressDotEmpty: { backgroundColor: '#E2E8F0' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, position: 'relative', marginBottom: 4 },
  timelineRowActive: { backgroundColor: 'rgba(76,175,80,0.08)' },
  connector: { position: 'absolute', left: 23.5, top: 22, bottom: -22, width: 3, zIndex: 1 },
  stepDot: { width: 22, height: 22, borderRadius: 11, marginRight: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  stepDotCompleted: { backgroundColor: '#4CAF50' },
  stepDotActive: { backgroundColor: '#0F5B35' },
  stepDotPending: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#E2E8F0' },
  stepContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { fontSize: 15, fontWeight: '500', color: '#1E2022', fontFamily: 'Outfit' },
  stepTime: { fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit' },
  partnerCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, backgroundColor: 'rgba(15,91,53,0.04)', borderWidth: 1, borderColor: 'rgba(15,91,53,0.08)', marginBottom: 20 },
  partnerAvatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 2 },
  partnerSub: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit', fontWeight: '600' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(15,91,53,0.1)', alignItems: 'center', justifyContent: 'center' },
  receiptBtn: { height: 52, borderRadius: 16, backgroundColor: '#0F5B35', alignItems: 'center', justifyContent: 'center' },
  receiptBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Outfit' },
});
