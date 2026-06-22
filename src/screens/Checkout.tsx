import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, TextInput, Platform, Dimensions } from 'react-native';
import Svg, { Line, Polyline, Polygon, Path, Circle, G } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { orderService } from '@/services/orderService';
import { supabase } from '@/services/api';
import { theme } from '@/theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Support headset Icon
const SupportIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </Svg>
);

// Map markers & route visualization for React Native / Web
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
        html: `<div style="background-color: #0A3B2E; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px; font-weight: bold;">R</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([restaurantLat, restaurantLng], { icon: restIcon }).addTo(map);

      // Add Customer marker
      const custIcon = L.divIcon({
        className: 'custom-cust-icon',
        html: `<div style="background-color: #C7A96B; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px; font-weight: bold;">C</span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([customerLat, customerLng], { icon: custIcon }).addTo(map);

      // Add Rider marker
      const riderIcon = L.divIcon({
        className: 'custom-rider-icon',
        html: `<div style="background-color: #0B4D3A; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"><span style="color: white; font-size: 12px; display: block; text-align: center; line-height: 22px;">🏍️</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      riderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);

      // Draw route path line
      const pathPoints = stage === 'to_store' 
        ? [[riderLat, riderLng], [restaurantLat, restaurantLng]]
        : [[restaurantLat, restaurantLng], [customerLat, customerLng]];
      
      pathPolylineRef.current = L.polyline(pathPoints, {
        color: '#0B4D3A',
        weight: 5,
        opacity: 0.8,
      }).addTo(map);

      // Fit map to show both markers
      try {
        map.fitBounds(pathPolylineRef.current.getBounds(), { padding: [40, 40] });
      } catch (err) {
        console.error('fitBounds error:', err);
      }
    } else {
      const map = leafletMapInstance.current;
      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([riderLat, riderLng]);
      }
      if (pathPolylineRef.current) {
        const pathPoints = stage === 'to_store'
          ? [[riderLat, riderLng], [restaurantLat, restaurantLng]]
          : [[restaurantLat, restaurantLng], [customerLat, customerLng]];
        pathPolylineRef.current.setLatLngs(pathPoints);
      }
    }
  }, [riderLat, riderLng, stage, restaurantLat, restaurantLng, customerLat, customerLng, mapLibLoaded]);

  React.useEffect(() => {
    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  if (Platform.OS !== 'web') {
    const minLat = 17.440;
    const maxLat = 17.452;
    const minLng = 78.370;
    const maxLng = 78.385;
    const mapWidth = SCREEN_WIDTH - 40;
    const mapHeight = 200;

    const getX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    const getY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * mapHeight;

    const rx = getX(restaurantLng);
    const ry = getY(restaurantLat);
    const cx = getX(customerLng);
    const cy = getY(customerLat);
    const dx = getX(riderLng);
    const dy = getY(riderLat);

    return (
      <View style={{ flex: 1, backgroundColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
        <Svg width="100%" height="100%">
          {/* Background streets / grid */}
          <Line x1={0} y1={50} x2={mapWidth} y2={50} stroke="#CBD5E1" strokeWidth={18} strokeLinecap="round" />
          <Line x1={0} y1={50} x2={mapWidth} y2={50} stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="5,5" />
          
          <Line x1={0} y1={150} x2={mapWidth} y2={150} stroke="#CBD5E1" strokeWidth={22} strokeLinecap="round" />
          <Line x1={0} y1={150} x2={mapWidth} y2={150} stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="5,5" />
          
          <Line x1={mapWidth * 0.3} y1={0} x2={mapWidth * 0.3} y2={mapHeight} stroke="#CBD5E1" strokeWidth={18} strokeLinecap="round" />
          <Line x1={mapWidth * 0.3} y1={0} x2={mapWidth * 0.3} y2={mapHeight} stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="5,5" />

          <Line x1={mapWidth * 0.75} y1={0} x2={mapWidth * 0.75} y2={mapHeight} stroke="#CBD5E1" strokeWidth={20} strokeLinecap="round" />
          <Line x1={mapWidth * 0.75} y1={0} x2={mapWidth * 0.75} y2={mapHeight} stroke="#FFFFFF" strokeWidth={1.5} strokeDasharray="5,5" />

          {/* Route path from rider -> restaurant -> customer */}
          {stage === 'to_store' ? (
            <Path
              d={`M ${dx} ${dy} L ${rx} ${ry}`}
              stroke="#0B4D3A"
              strokeWidth={4}
              strokeDasharray="4,4"
              fill="none"
            />
          ) : (
            <Path
              d={`M ${rx} ${ry} L ${cx} ${cy}`}
              stroke="#0B4D3A"
              strokeWidth={4}
              strokeDasharray="4,4"
              fill="none"
            />
          )}

          {/* Restaurant Marker */}
          <G transform={`translate(${rx}, ${ry})`}>
            <Circle cx={0} cy={0} r={12} fill="#0A3B2E" stroke="#FFFFFF" strokeWidth={2} />
            <Circle cx={0} cy={0} r={2} fill="#FFFFFF" />
          </G>

          {/* Customer Marker */}
          <G transform={`translate(${cx}, ${cy})`}>
            <Circle cx={0} cy={0} r={12} fill="#C7A96B" stroke="#FFFFFF" strokeWidth={2} />
            <Circle cx={0} cy={0} r={2} fill="#FFFFFF" />
          </G>

          {/* Rider Marker */}
          <G transform={`translate(${dx}, ${dy})`}>
            <Circle cx={0} cy={0} r={14} fill="#0B4D3A" stroke="#FFFFFF" strokeWidth={2} />
          </G>
        </Svg>
        
        {/* Floating overlays for labels */}
        <View style={{ position: 'absolute', left: rx - 35, top: ry - 28, backgroundColor: 'rgba(10,59,46,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFF' }}>
          <Text style={{ color: '#FFF', fontSize: 8.5, fontWeight: '700' }}>Sattvik Kitchen</Text>
        </View>

        <View style={{ position: 'absolute', left: cx - 20, top: cy + 15, backgroundColor: 'rgba(199,169,107,0.9)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFF' }}>
          <Text style={{ color: '#FFF', fontSize: 8.5, fontWeight: '700' }}>Home</Text>
        </View>

        <View style={{ position: 'absolute', left: dx - 18, top: dy - 30, backgroundColor: '#0B4D3A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, borderWidth: 1.5, borderColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>🏍️ Rider</Text>
        </View>
      </View>
    );
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
      const limit = 60; 
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

    const orderChannel = supabase
      .channel(`order-changes:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `_id=eq.${orderId}` },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    const trackingChannel = supabase
      .channel(`order-tracking:${orderId}`)
      .on('broadcast', { event: 'location-update' }, (payload: any) => {
        const loc = payload.payload;
        setOrder((prev: any) => {
          if (!prev) return prev;
          const currentDriver = prev.driver || {};
          return {
            ...prev,
            driver: {
              ...currentDriver,
              location: {
                lat: loc.lat,
                lng: loc.lng,
                progress: loc.progress,
                stage: loc.stage
              }
            }
          };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(trackingChannel);
    };
  }, [orderId]);

  const calculateETA = () => {
    if (!order) return '-- min';
    if (order.orderStatus === 'delivered') return '0 min';
    if (order.orderStatus === 'cancelled') return '-- min';
    
    let localParsedDriver: any = order.driver;
    if (order.driver && typeof order.driver === 'string') {
      try {
        localParsedDriver = JSON.parse(order.driver);
      } catch (_) {}
    }

    // If rider is out for delivery or arriving, calculate distance to customer
    if (order.orderStatus === 'out_for_delivery' || order.orderStatus === 'arriving') {
      const rLat = localParsedDriver?.location?.lat || 17.4483;
      const rLng = localParsedDriver?.location?.lng || 78.3741;
      const cLat = 17.4435;
      const cLng = 78.3812;
      
      const R = 6371; // km
      const dLat = (cLat - rLat) * Math.PI / 180;
      const dLon = (cLng - rLng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rLat * Math.PI / 180) * Math.cos(cLat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      const minutes = Math.max(1, Math.round(distance * 8.5));
      return `${minutes} min`;
    }
    
    // If rider is ready or assigned, calculate total distance (rider -> restaurant -> customer)
    if (order.orderStatus === 'rider_assigned' || order.orderStatus === 'ready_for_pickup') {
      const rLat = localParsedDriver?.location?.lat || 17.4520;
      const rLng = localParsedDriver?.location?.lng || 78.3680;
      const restLat = 17.4483;
      const restLng = 78.3741;
      const cLat = 17.4435;
      const cLng = 78.3812;
      
      const R = 6371;
      const dLat1 = (restLat - rLat) * Math.PI / 180;
      const dLon1 = (restLng - rLng) * Math.PI / 180;
      const a1 =
        Math.sin(dLat1 / 2) * Math.sin(dLat1 / 2) +
        Math.cos(rLat * Math.PI / 180) * Math.cos(restLat * Math.PI / 180) *
        Math.sin(dLon1 / 2) * Math.sin(dLon1 / 2);
      const c1 = 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
      const distanceToStore = R * c1;
      
      const dLat2 = (cLat - restLat) * Math.PI / 180;
      const dLon2 = (cLng - restLng) * Math.PI / 180;
      const a2 =
        Math.sin(dLat2 / 2) * Math.sin(dLat2 / 2) +
        Math.cos(restLat * Math.PI / 180) * Math.cos(cLat * Math.PI / 180) *
        Math.sin(dLon2 / 2) * Math.sin(dLon2 / 2);
      const c2 = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
      const distanceStoreToCust = R * c2;
      
      const totalDistance = distanceToStore + distanceStoreToCust;
      const minutes = Math.max(2, Math.round(totalDistance * 8.5));
      return `${minutes} min`;
    }
    
    return '12 min';
  };

  const getStepStatus = (stepName: string, currentStatus: string) => {
    if (currentStatus === 'cancelled') return 'pending';

    const statusOrder = ['placed', 'preparing', 'ready_for_pickup', 'rider_assigned', 'out_for_delivery', 'arriving', 'delivered'];
    
    let normalizedCurrentStatus = currentStatus;
    let normalizedStepName = stepName;

    if (currentStatus === 'rider_assigned') {
      normalizedCurrentStatus = 'ready_for_pickup';
    }
    if (currentStatus === 'arriving') {
      normalizedCurrentStatus = 'out_for_delivery';
    }

    const currentIdx = statusOrder.indexOf(normalizedCurrentStatus);
    const stepIdx = statusOrder.indexOf(normalizedStepName);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const getStepTime = (stepName: string, statusHistory: any[]) => {
    let statusesToMatch = [stepName];
    if (stepName === 'ready_for_pickup') {
      statusesToMatch = ['ready_for_pickup', 'rider_assigned'];
    }
    if (stepName === 'out_for_delivery') {
      statusesToMatch = ['out_for_delivery', 'arriving'];
    }
    
    const record = statusHistory?.find((h) => statusesToMatch.includes(h.status));
    if (!record) return '09:35 AM';
    try {
      const date = new Date(record.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return '';
    }
  };


  if (loading) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primaryGreen} />
        </View>
      </components.SafeAreaView>
    );
  }

  if (!order) {
    return (
      <components.SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 15, color: theme.colors.lightText, textAlign: 'center' }}>Order could not be tracked.</Text>
        </View>
      </components.SafeAreaView>
    );
  }
  let parsedDriver: any = order.driver;
  if (order.driver && typeof order.driver === 'string') {
    try {
      parsedDriver = JSON.parse(order.driver);
    } catch (_) {}
  }

  // Helper to render customized SVG step icons on the left
  const renderStepIcon = (stepKey: string, stepStatus: 'completed' | 'active' | 'pending') => {
    const isCompleted = stepStatus === 'completed';
    const isActive = stepStatus === 'active';
    
    let bgColor = '#F8FAFC';
    let borderColor = '#E2E8F0';
    let borderWidth = 1.5;
    
    if (isCompleted || isActive) {
      borderWidth = 0;
      if (stepKey === 'out_for_delivery') {
        bgColor = '#FAF8F5'; // beige/peach background for scooter icon
      } else {
        bgColor = '#0B4D3A'; // dark green background
      }
    }
    
    return (
      <View style={[
        styles.statusIndicatorCircle,
        { backgroundColor: bgColor, borderWidth, borderColor }
      ]}>
        {stepKey === 'placed' && (
          <Svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={(isCompleted || isActive) ? '#FFFFFF' : '#8A8A8A'} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="20 6 9 17 4 12" />
          </Svg>
        )}
        {stepKey === 'preparing' && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={(isCompleted || isActive) ? '#FFFFFF' : '#8A8A8A'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 10h16c0 4.4-3.6 8-8 8s-8-3.6-8-8z" />
            <Path d="M12 2v4" />
            <Path d="M8 4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2H8V4z" />
          </Svg>
        )}
        {stepKey === 'ready_for_pickup' && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={(isCompleted || isActive) ? '#FFFFFF' : '#8A8A8A'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
            <Line x1={3} y1={6} x2={21} y2={6} />
            <Path d="M16 10a4 4 0 0 1-8 0" />
          </Svg>
        )}
        {stepKey === 'out_for_delivery' && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={(isCompleted || isActive) ? '#C7A96B' : '#8A8A8A'} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={5.5} cy={18} r={2.5} />
            <Circle cx={18.5} cy={18} r={2.5} />
            <Path d="M3 10h11v8H3z" />
            <Path d="M14 12h5l2.5 3V18h-7.5z" />
            <Path d="M8 6h5" />
          </Svg>
        )}
      </View>
    );
  };

  // Pre-calculated timeline statuses
  const steps = [
    { key: 'placed', label: 'Order Confirmed', desc: "We've received your order", icon: '✓' },
    { key: 'preparing', label: 'Preparing Your Order', desc: 'Our chef is preparing your fresh & pure veg meal', icon: '🍲' },
    { key: 'ready_for_pickup', label: 'Order Ready at Restaurant', desc: 'Rider is arriving to pick up your order', icon: '🛍️' },
    { key: 'out_for_delivery', label: 'Order Picked Up', desc: 'Your order is picked up & on the way', icon: '🏍️' },
  ];

  const orderCode = order._id.length > 6 ? order._id.substring(order._id.length - 6).toUpperCase() : order._id.toUpperCase();

  return (
    <components.SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
          <Text style={{ fontSize: 20, color: theme.colors.primaryText }}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSubtitle}>We're preparing your order with care.</Text>
        </View>
        <TouchableOpacity style={styles.supportBadge} onPress={() => navigate(constants.routes.FAQ)}>
          <SupportIcon />
          <Text style={styles.supportBadgeText}>Support</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Restaurant & Order Info Card */}
        <View style={styles.infoCard}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=150' }}
            style={styles.restaurantThumb}
          />
          <View style={styles.infoMiddle}>
            <Text style={styles.restaurantName}>{order.restaurantName || 'Sattvik Kitchen'}</Text>
            <Text style={styles.orderIdText}>Order #VD{orderCode}</Text>
            <Text style={styles.orderItemsText}>
              {order.items?.length || 2} {order.items?.length === 1 ? 'item' : 'items'}  •  ₹{order.totalAmount}
            </Text>
          </View>
          <View style={styles.feeHighlightBadge}>
            <Text style={styles.feeBadgeTextLabel}>Delivery at flat</Text>
            <Text style={styles.feeBadgeTextAmount}>₹99</Text>
          </View>
        </View>

        {/* Live Route Map (Image 5) */}
        <View style={styles.mapContainer}>
          <LeafletMap
            restaurantLat={17.4483}
            restaurantLng={78.3741}
            customerLat={17.4435}
            customerLng={78.3812}
            riderLat={parsedDriver?.location?.lat || 17.4460}
            riderLng={parsedDriver?.location?.lng || 78.3780}
            stage={parsedDriver?.location?.stage || 'to_customer'}
          />
          {/* Floating ETA Tag */}
          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' && (
            <View style={styles.etaFloatingTag}>
              <Text style={styles.etaText}>{calculateETA()}</Text>
              <Text style={styles.etaSubtext}>away</Text>
              <View style={styles.etaTriangle} />
            </View>
          )}
        </View>

        {/* Timeline Progress List Card */}
        <View style={styles.timelineCard}>
          {steps.map((step, idx) => {
            const stepStatus = getStepStatus(step.key, order.orderStatus);
            const isCompleted = stepStatus === 'completed';
            const isActive = stepStatus === 'active';
            const stepTime = getStepTime(step.key, order.statusHistory || []);
            
            return (
              <View key={step.key} style={styles.timelineRow}>
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <View style={[
                    styles.connectorLine, 
                    { borderColor: (isCompleted || isActive) ? theme.colors.primaryGreen : '#E2E8F0' }
                  ]} />
                )}

                {/* Status Indicator Circle */}
                {renderStepIcon(step.key, stepStatus)}

                {/* Content Text */}
                <View style={styles.timelineTextContainer}>
                  <Text style={[
                    styles.stepTitleText, 
                    isActive && { color: theme.colors.primaryGreen, fontWeight: '700' }
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepDescText}>{step.desc}</Text>
                </View>

                {/* Time & End Checkmark Status */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'flex-end', minWidth: 90 }}>
                  {isActive && step.key === 'out_for_delivery' ? (
                    <>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#C7A96B', fontFamily: 'Inter' }}>{calculateETA()} away</Text>
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#C7A96B" strokeWidth={3} style={{ transform: [{ rotate: '45deg' }] }}>
                        <Circle cx={12} cy={12} r={10} strokeDasharray="30 20" strokeLinecap="round" />
                      </Svg>
                    </>
                  ) : isCompleted || isActive ? (
                    <>
                      <Text style={styles.stepTimeText}>{stepTime}</Text>
                      <View style={styles.endCheckmark}>
                        <Svg width={7} height={7} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                          <Polyline points="20 6 9 17 4 12" />
                        </Svg>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.stepTimeText}>--:--</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Dynamic Cancel Order Option */}
        {order.orderStatus === 'placed' && cancelTimeLeft > 0 && (
          <View style={styles.cancelContainer}>
            <Text style={styles.cancelText}>You can cancel this order within {cancelTimeLeft}s</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feedback / Thanks Banner (Image 5) */}
        <View style={styles.feedbackBanner}>
          <View style={styles.leafIconBg}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0B4D3A" strokeWidth={2.5}>
              <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 20 2c-2.48 3-3 4.5-4.1 10.2A7 7 0 0 1 11 20z" />
              <Path d="M9 13c1.5-1.5 3-2 5-2.5" />
            </Svg>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.feedbackTitle}>Pure food. Delivered with care.</Text>
            <Text style={styles.feedbackSub}>Thank you for choosing VegDash.</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewDetailsBtn} 
            onPress={() => navigate(constants.routes.ORDER_SUCCESSFUL, { state: { orderId } })}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>

        {/* Driver Review card */}
        {order.orderStatus === 'delivered' && (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Rate Delivery Partner</Text>
            {reviewSubmitted || parsedDriver?.review ? (
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <Text style={styles.reviewSub}>🎉 Thanks for rating!</Text>
                <Text style={{ fontStyle: 'italic', color: '#5E5E5E', marginTop: 5 }}>
                  "{reviewComment || parsedDriver?.review?.comment || 'Good service'}"
                </Text>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 12 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                      <Text style={{ fontSize: 26, color: star <= reviewRating ? theme.colors.gold : theme.colors.border }}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Share details about delivery partner..."
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholderTextColor="#8A8A8A"
                />
                <TouchableOpacity 
                  style={[styles.reviewBtn, !reviewRating && { backgroundColor: '#CBD5E1' }]} 
                  disabled={!reviewRating || submittingReview}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.reviewBtnText}>Submit Rating</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Hygienic Indicators Footer Banner */}
        <View style={styles.hygieneFooter}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 13, height: 13, borderRadius: 6.5, backgroundColor: 'rgba(94, 94, 94, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
              <Svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#5E5E5E" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="20 6 9 17 4 12" />
              </Svg>
            </View>
            <Text style={styles.hygieneText}>Hygienic Packaging</Text>
          </View>
          <Text style={styles.hygieneDivider}>•</Text>
          <Text style={styles.hygieneText}>Trained Delivery Partners</Text>
          <Text style={styles.hygieneDivider}>•</Text>
          <Text style={styles.hygieneText}>On-time Delivery</Text>
        </View>

      </ScrollView>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.warmWhite,
    backgroundColor: theme.colors.background,
  },
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryGreen,
  },
  headerSubtitle: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  supportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  supportBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryText,
    fontFamily: 'Inter',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Info card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0B4D3A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  restaurantThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  infoMiddle: {
    flex: 1,
    marginLeft: 14,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primaryText,
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
  },
  orderIdText: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginTop: 3,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  orderItemsText: {
    fontSize: 11,
    color: theme.colors.lightText,
    marginTop: 2,
    fontFamily: 'Inter',
  },
  feeHighlightBadge: {
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE6DF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feeBadgeTextLabel: {
    fontSize: 8,
    color: '#5E5E5E',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  feeBadgeTextAmount: {
    fontSize: 14,
    color: '#C7A96B',
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: 'Inter',
    marginTop: 1,
  },

  // Map
  mapContainer: {
    height: 200,
    backgroundColor: '#FAF9F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  etaFloatingTag: {
    position: 'absolute',
    top: 15,
    right: 25,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  etaText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Inter',
  },
  etaSubtext: {
    fontSize: 9,
    color: '#5E5E5E',
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  etaTriangle: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },

  // Timeline Progress status card
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#0B4D3A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    position: 'relative',
    alignItems: 'center',
  },
  connectorLine: {
    position: 'absolute',
    left: 12,
    top: 30,
    bottom: -18,
    width: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    zIndex: 1,
  },
  statusIndicatorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineTextContainer: {
    flex: 1,
    marginLeft: 16,
    paddingRight: 8,
  },
  stepTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primaryText,
    fontFamily: 'Inter',
  },
  stepDescText: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    marginTop: 3,
    fontFamily: 'Inter',
    lineHeight: 14,
  },
  deliveryHighlightText: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  stepTimeText: {
    fontSize: 11,
    color: theme.colors.lightText,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  endCheckmark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Cancel option
  cancelContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
    alignItems: 'center',
    gap: 8,
  },
  cancelText: {
    fontSize: 12,
    color: '#C53030',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },

  // Thanks banner
  feedbackBanner: {
    backgroundColor: '#0B4D3A',
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  leafIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'Inter',
  },
  feedbackSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 10,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  viewDetailsBtn: {
    borderWidth: 1.2,
    borderColor: theme.colors.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewDetailsText: {
    color: theme.colors.gold,
    fontWeight: '700',
    fontSize: 10,
    fontFamily: 'Inter',
  },

  // Review partners
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginTop: 20,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.primaryText,
  },
  reviewSub: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: 2,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 12,
    color: theme.colors.primaryText,
    fontSize: 13,
    marginBottom: 10,
  },
  reviewBtn: {
    backgroundColor: theme.colors.primaryGreen,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // Footer Indicators
  hygieneFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  hygieneText: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  hygieneDivider: {
    fontSize: 10,
    color: '#D1CFCA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
