import { theme } from '@/theme/theme';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import Svg, { Path, Line, Polyline, Circle } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { DishType } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { orderService } from '@/services/orderService';

export const Order: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('wallet');
  const [loading, setLoading] = useState(false);
  
  const { user, isLoggedIn } = useAuthStore();
  const userAddresses = Array.isArray(user?.addresses) ? user.addresses : [];
  const defaultAddressStr = userAddresses.find((a: any) => a.isDefault)?.street || userAddresses[0]?.street || '';
  const [addressInput, setAddressInput] = useState(defaultAddressStr || 'Flat 102, Green Meadows, Gachibowli');

  const { list: cart, addToCart, removeFromCart, promoCode, discount, setPromoCode, setDiscount, resetCart } = stores.useCartStore();

  const itemTotal = cart.reduce((sum, item) => sum + (item.quantity || 0) * Number(item.price), 0);
  const deliveryFee = 25;
  const packagingFee = 15;

  let discountAmount = 0;
  if (promoCode === 'VEGDASH50') discountAmount = 60;
  else if (promoCode === 'VEGDASH100') discountAmount = 100;
  else if (promoCode === 'JAIN25') discountAmount = Math.round(itemTotal * 0.25);
  else if (discount > 0) discountAmount = Math.round(itemTotal * (discount / 100));

  const toPay = Math.max(0, itemTotal + deliveryFee + packagingFee - discountAmount);


  if (cart.length === 0) {
    return (
      <components.SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}><Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" /></Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Add some delicious vegetarian items to your cart.</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigate(constants.routes.SHOP)}>
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </components.SafeAreaView>
    );
  }

  const handlePlaceOrder = async () => {
    if (!addressInput.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        restaurantId: cart[0].restaurantId || '',
        items: cart.map((item) => ({
          foodItem: String(item.id),
          quantity: item.quantity || 1,
        })),
        paymentMethod: (selectedPayment === 'cod' ? 'COD' : 'Online') as 'COD' | 'Online',
        deliveryAddress: {
          street: addressInput,
          city: user?.addresses?.[0]?.city || 'Gachibowli',
          state: user?.addresses?.[0]?.state || 'Telangana',
          zip: user?.addresses?.[0]?.zip || '500032',
        },
        discount: discountAmount,
      };

      const order = await orderService.placeOrder(orderPayload);
      
      if (selectedPayment !== 'cod') {
        // Online payment simulation success verification
        await orderService.verifyPayment({
          orderId: order._id,
          razorpayPaymentId: 'pay_' + Math.random().toString(36).substring(2, 11),
          razorpaySignature: 'sig_' + Math.random().toString(36).substring(2, 11),
        });
      }

      resetCart();
      setShowPaymentModal(false);
      
      // Navigate to Checkout tracking screen
      navigate(constants.routes.CHECKOUT, { state: { orderId: order._id } });
    } catch (err: any) {
      Alert.alert('Order Failed', err.response?.data?.message || err.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.headerBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}><Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" /></Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
        {/* Cart items */}
        {cart.map((item: DishType, index: number) => (
          <View key={index} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.price}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => addToCart(item)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Delivery Address Capture */}
        <View style={[styles.billCard, { marginBottom: 16, backgroundColor: '#FFFFFF' }]}>
          <Text style={styles.billTitle}>📍 Delivery Address</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              padding: 12,
              fontSize: 14,
              color: theme.colors.primaryText,
              fontFamily: 'Outfit',
              backgroundColor: '#F8FAFC',
              textAlignVertical: 'top',
              height: 52,
            }}
            placeholder="Enter street address, flat number, building"
            placeholderTextColor={theme.colors.lightText}
            value={addressInput}
            onChangeText={setAddressInput}
            multiline
          />
        </View>

        {/* Bill Details */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Details</Text>
          <View style={styles.billRow}><Text style={styles.billLabel}>Item Total</Text><Text style={styles.billValue}>₹{itemTotal}</Text></View>
          <View style={styles.billRow}><Text style={styles.billLabel}>Delivery Fee</Text><Text style={styles.billValue}>₹{deliveryFee}</Text></View>
          <View style={styles.billRow}><Text style={styles.billLabel}>Packaging Fee</Text><Text style={styles.billValue}>₹{packagingFee}</Text></View>
          {promoCode && discountAmount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: '#4CAF50' }]}>Discount ({promoCode})</Text>
              <Text style={[styles.billValue, { color: '#4CAF50' }]}>-₹{discountAmount}</Text>
            </View>
          )}
          <View style={[styles.billRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <Text style={[styles.billLabel, { fontWeight: '700', color: theme.colors.primaryText, fontSize: 16 }]}>To Pay</Text>
            <Text style={[styles.billValue, { color: theme.colors.primaryGreen, fontWeight: '700', fontSize: 16 }]}>₹{toPay}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => {
            if (!isLoggedIn) {
              Alert.alert(
                'Login Required',
                'You must be logged in to proceed to checkout.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log In', onPress: () => navigate(constants.routes.SIGN_IN) },
                ]
              );
            } else {
              setShowPaymentModal(true);
            }
          }}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPaymentModal(false)} activeOpacity={1}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={{ fontSize: 18, color: theme.colors.lightText, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { id: 'wallet', icon: '💳', label: 'Veg Dash Wallet', sub: 'Available Balance: ₹250' },
              { id: 'upi', icon: '📱', label: 'UPI (Google Pay / PhonePe)', sub: '' },
              { id: 'cod', icon: '💵', label: 'Cash on Delivery', sub: '' },
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionActive]}
                onPress={() => setSelectedPayment(method.id)}
              >
                <Text style={{ fontSize: 22 }}>{method.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.paymentLabel}>{method.label}</Text>
                  {!!method.sub && <Text style={{ fontSize: 12, color: '#4CAF50', fontWeight: '600', fontFamily: 'Outfit' }}>{method.sub}</Text>}
                </View>
                <View style={[styles.radioOuter, selectedPayment === method.id && styles.radioOuterActive]}>
                  {selectedPayment === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.payBtn}
              onPress={loading ? undefined : handlePlaceOrder}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.payBtnText}>Pay & Place Order (₹{toPay})</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.warmWhite },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 8, fontFamily: 'Outfit' },
  emptySubtitle: { fontSize: 14, color: theme.colors.lightText, marginBottom: 24, fontFamily: 'Outfit', textAlign: 'center' },
  browseBtn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', fontFamily: 'Outfit' },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  itemImage: { width: 65, height: 65, borderRadius: 12 },
  itemName: { fontSize: 15, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 4, fontFamily: 'Outfit' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: theme.colors.primaryGreen, fontFamily: 'Outfit' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', width: 90, height: 32, borderRadius: 8, borderWidth: 1.5, borderColor: theme.colors.primaryGreen, paddingHorizontal: 6, justifyContent: 'space-between' },
  qtyBtn: { padding: 2 },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryGreen },
  qtyText: { fontSize: 13, fontWeight: '700', color: theme.colors.primaryGreen, fontFamily: 'Outfit' },
  billCard: { padding: 20, borderRadius: 18, backgroundColor: theme.colors.warmWhite, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 25 },
  billTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 14, fontFamily: 'Outfit' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: 14, color: theme.colors.lightText, fontFamily: 'Outfit' },
  billValue: { fontSize: 14, fontWeight: '600', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  checkoutBtn: { height: 52, borderRadius: 16, backgroundColor: theme.colors.primaryGreen, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Outfit' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, borderColor: theme.colors.border, marginBottom: 12 },
  paymentOptionActive: { borderColor: theme.colors.primaryGreen, backgroundColor: 'rgba(15,91,53,0.02)' },
  paymentLabel: { fontSize: 15, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit', marginBottom: 2 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.lightText, alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: theme.colors.primaryGreen },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primaryGreen },
  payBtn: { height: 52, borderRadius: 16, backgroundColor: theme.colors.primaryGreen, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Outfit' },
});
