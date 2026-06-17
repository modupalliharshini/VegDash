import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, TextInput, Platform } from 'react-native';

import Svg, { Line, Polyline, Polygon, Path } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { orderService } from '@/services/orderService';
import { supabase } from '@/services/api';

const LeafletMap: React.FC<{
  restaurantLat: number;
  restaurantLng: number;
  customerLat: number;
  customerLng: number;
  riderLat: number;
  riderLng: number;
  stage: 'to_store' | 'to_customer';
}> = ({ restaurantLat, restaurantLng, customerLat, customerLng, riderLat, riderLng, stage }) => {
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = React.useRef<any>(null);
  const riderMarkerRef = React.useRef<any>(null);
  const pathPolylineRef = React.useRef<any>(null);
  const [mapLibLoaded, setMapLibLoaded] = React.useState(typeof window !== 'undefined' && !!(window as any).L);

  React.useEffect(() => {
    if (mapLibLoaded) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).L) {
        setMapLibLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [mapLibLoaded]);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || !mapLibLoaded) return;
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (!leafletMapInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([restaurantLat, restaurantLng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      leafletMapInstance.current = map;

      // Add Restaurant marker
      const restIcon = L.divIcon({
        className: 'custom-rest-icon',
        html: `<div style="background-color: #3B82F6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px; font-weight: bold;">R</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([restaurantLat, restaurantLng], { icon: restIcon }).addTo(map);

      // Add Customer marker
      const custIcon = L.divIcon({
        className: 'custom-cust-icon',
        html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px; font-weight: bold;">C</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([customerLat, customerLng], { icon: custIcon }).addTo(map);

      // Add Rider marker
      const riderIcon = L.divIcon({
        className: 'custom-rider-icon',
        html: `<div style="background-color: #0F5B35; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 12px; display: block; text-align: center; line-height: 22px;">🏍️</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);

      // Draw route path line
      const pathPoints = stage === 'to_store' 
        ? [[riderLat, riderLng], [restaurantLat, restaurantLng]]
        : [[restaurantLat, restaurantLng], [customerLat, customerLng]];
      
      pathPolylineRef.current = L.polyline(pathPoints, {
        color: stage === 'to_store' ? '#3B82F6' : '#10B981',
        weight: 5,
        opacity: 0.8,
        dashArray: stage === 'to_store' ? '5, 10' : undefined
      }).addTo(map);

      // Fit map to show both markers
      try {
        map.fitBounds(pathPolylineRef.current.getBounds(), { padding: [40, 40] });
      } catch (err) {
        console.error('fitBounds error:', err);
      }
    } else {
      const map = leafletMapInstance.current;
      // Update rider position
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([riderLat, riderLng]);
      }
      // Update polyline path
      if (pathPolylineRef.current) {
        const pathPoints = stage === 'to_store'
          ? [[riderLat, riderLng], [restaurantLat, restaurantLng]]
          : [[restaurantLat, restaurantLng], [customerLat, customerLng]];
        pathPolylineRef.current.setLatLngs(pathPoints);
        pathPolylineRef.current.setStyle({
          color: stage === 'to_store' ? '#3B82F6' : '#10B981',
          dashArray: stage === 'to_store' ? '5, 10' : null
        });
      }
    }
  }, [riderLat, riderLng, stage, restaurantLat, restaurantLng, customerLat, customerLng, mapLibLoaded]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  if (Platform.OS !== 'web') {
    return null;
  }

  return <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '12px' }} />;
};


export const Checkout: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const orderId = (params as any)?.orderId || (params as any)?.state?.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [cancelTimeLeft, setCancelTimeLeft] = useState(0);

  useEffect(() => {
    if (!order || order.orderStatus !== 'placed') {
      setCancelTimeLeft(0);
      return;
    }

    const checkTime = () => {
      const createdTime = new Date(order.createdAt).getTime();
      const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
      const limit = 60; // 60s window
      const left = Math.max(0, limit - elapsedSeconds);
      setCancelTimeLeft(left);
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [order]);

  const handleCancelOrder = async () => {
    const createdTime = new Date(order.createdAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
    if (elapsedSeconds > 60 || order.orderStatus !== 'placed') {
      alert('The order cannot be cancelled now.');
      return;
    }

    try {
      const now = new Date().toISOString();
      const statusHistoryUpdate = [
        ...(order.statusHistory || []),
        { status: 'cancelled', timestamp: now }
      ];

      const { error } = await supabase
        .from('orders')
        .update({
          orderStatus: 'cancelled',
          statusHistory: statusHistoryUpdate,
          updatedAt: now
        })
        .eq('_id', orderId);

      if (error) throw error;

      alert('Order cancelled successfully.');
      setOrder((prev: any) => ({
        ...prev,
        orderStatus: 'cancelled',
        statusHistory: statusHistoryUpdate
      }));
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      alert('Error cancelling order: ' + err.message);
    }
  };


  const handleSubmitReview = async () => {
    if (!reviewRating) return;
    setSubmittingReview(true);
    try {
      let currentDriver = order.driver || {};
      const updatedDriver = {
        ...currentDriver,
        review: {
          rating: reviewRating,
          comment: reviewComment,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('orders')
        .update({ driver: JSON.stringify(updatedDriver) })
        .eq('_id', orderId);

      if (error) throw error;
      setReviewSubmitted(true);
      
      // Update order state locally
      setOrder((prev: any) => ({
        ...prev,
        driver: updatedDriver
      }));
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };


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
    const statusOrder = ['placed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'];
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
    { title: 'Order Ready to be Picked Up', time: getStepTime('ready_for_pickup', order.statusHistory), status: getStepStatus('ready_for_pickup', order.orderStatus) },
    { title: 'Out for Delivery', time: getStepTime('out_for_delivery', order.statusHistory), status: getStepStatus('out_for_delivery', order.orderStatus) },
    { title: 'Delivered', time: getStepTime('delivered', order.statusHistory), status: getStepStatus('delivered', order.orderStatus) },
  ] : [];


  const getProgressInfo = (status: string) => {
    if (status === 'placed') return { width: '20%', dots: 1 };
    if (status === 'preparing') return { width: '40%', dots: 2 };
    if (status === 'ready_for_pickup') return { width: '60%', dots: 3 };
    if (status === 'out_for_delivery') return { width: '80%', dots: 4 };
    if (status === 'delivered') return { width: '100%', dots: 5 };
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

  let parsedDriver: any = null;
  if (order && order.driver) {
    try {
      parsedDriver = typeof order.driver === 'string' ? JSON.parse(order.driver) : order.driver;
    } catch (_) {
      parsedDriver = order.driver;
    }
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
            {order.orderStatus === 'ready_for_pickup' && 'Order ready to be picked up'}
            {order.orderStatus === 'out_for_delivery' && 'Your food is out for delivery'}
            {order.orderStatus === 'delivered' && 'Enjoy your good food!'}
            {order.orderStatus === 'cancelled' && 'Order has been cancelled'}
          </Text>
        </View>

        {/* Order Cancellation Box */}
        {order.orderStatus === 'placed' && (
          <View style={styles.cancelBox}>
            {cancelTimeLeft > 0 ? (
              <View>
                <Text style={styles.cancelInfo}>You can cancel this order within the next {cancelTimeLeft} seconds.</Text>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
                  <Text style={styles.cancelBtnText}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cannotCancelRow}>
                <Text style={styles.cannotCancelText}>⚠️ The order cannot be cancelled now.</Text>
              </View>
            )}
          </View>
        )}

 
        {/* Horizontal progress dots */}
        {order.orderStatus !== 'cancelled' && (
          <View style={styles.progressRow}>
            <View style={styles.progressTrack} />
            <View style={[styles.progressFill, { width: progressWidth as any }]} />
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.progressDot, i < progressDots ? styles.progressDotFilled : styles.progressDotEmpty]} />
            ))}
          </View>
        )}

        {/* Live Location Map for Customer */}
        {parsedDriver && parsedDriver.location && (order.orderStatus === 'ready_for_pickup' || order.orderStatus === 'out_for_delivery') && (
          <View style={styles.trackingMap}>
            <LeafletMap
              restaurantLat={17.4483}
              restaurantLng={78.3741}
              customerLat={17.4435}
              customerLng={78.3812}
              riderLat={parsedDriver.location.lat || 17.4520}
              riderLng={parsedDriver.location.lng || 78.3680}
              stage={parsedDriver.location.stage || 'to_store'}
            />
            <Text style={styles.navInstruction}>
              {order.orderStatus === 'ready_for_pickup' && `🏍️ Rider en route to restaurant (${Math.round((parsedDriver.location.progress || 0) * 100)}% progress)`}
              {order.orderStatus === 'out_for_delivery' && `🏍️ Rider en route to your location (${Math.round((parsedDriver.location.progress || 0) * 100)}% progress)`}
            </Text>
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
 
        {/* Customer Review Card */}
        {order.orderStatus === 'delivered' && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewCardTitle}>Rate your experience</Text>
            {reviewSubmitted || (order.driver && order.driver.review) ? (
              <View style={styles.submittedContainer}>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={[styles.starIcon, { fontSize: 24, color: star <= (reviewRating || order.driver?.review?.rating || 0) ? '#F59E0B' : '#E2E8F0' }]}>★</Text>
                  ))}
                </View>
                <Text style={styles.submittedComment}>"{reviewComment || order.driver?.review?.comment || 'No comment'}"</Text>
                <Text style={styles.submittedText}>🎉 Thank you for your feedback!</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.reviewSub}>How was the food and delivery?</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                      <Text style={[styles.starIcon, { fontSize: 32, color: star <= reviewRating ? '#F59E0B' : '#E2E8F0', paddingHorizontal: 4 }]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Tell us what you liked or how we can improve..."
                  placeholderTextColor="#94A3B8"
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                />
                <TouchableOpacity 
                  style={[styles.submitReviewBtn, (!reviewRating || submittingReview) && styles.disabledBtn]} 
                  onPress={handleSubmitReview}
                  disabled={!reviewRating || submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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
  trackingMap: { height: 180, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginVertical: 14, overflow: 'hidden', position: 'relative' },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.04, borderWidth: 1, borderColor: '#475569' },
  mapBadge: { position: 'absolute', backgroundColor: 'rgba(15, 23, 42, 0.85)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  mapBadgeText: { color: '#ffffff', fontSize: 8, fontWeight: '700' },
  navInstruction: { position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: '#FFFFFF', padding: 6, borderRadius: 6, fontSize: 10, fontWeight: '700', color: '#475569', textAlign: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E2022',
    fontFamily: 'Outfit',
    textAlign: 'center',
    marginBottom: 4,
  },
  reviewSub: {
    fontSize: 13,
    color: '#7E8B97',
    fontFamily: 'Outfit',
    textAlign: 'center',
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  starIcon: {
    fontFamily: 'Outfit',
  },
  reviewInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    color: '#1E2022',
    fontSize: 14,
    fontFamily: 'Outfit',
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  submitReviewBtn: {
    backgroundColor: '#0F5B35',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Outfit',
  },
  disabledBtn: {
    backgroundColor: '#CBD5E1',
  },
  submittedContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  submittedComment: {
    fontSize: 14,
    color: '#7E8B97',
    fontStyle: 'italic',
    fontFamily: 'Outfit',
    textAlign: 'center',
    marginBottom: 10,
  },
  submittedText: {
    fontSize: 14,
    color: '#0F5B35',
    fontWeight: '700',
    fontFamily: 'Outfit',
    textAlign: 'center',
  },
  cancelBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  cancelInfo: {
    fontSize: 12,
    color: '#C53030',
    fontFamily: 'Outfit',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: '#E53E3E',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Outfit',
  },
  cannotCancelRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cannotCancelText: {
    fontSize: 13,
    color: '#C53030',
    fontFamily: 'Outfit',
    fontWeight: '700',
    textAlign: 'center',
  },
});


