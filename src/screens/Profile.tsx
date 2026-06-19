import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';
import { userService } from '@/services/userService';
import { theme } from '@/theme/theme';

const C = theme.colors;

type MenuItem = { id: string; title: string; to: string; value?: string };

export const Profile: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { user, isLoggedIn, logout, updateUser } = useAuthStore();

  const [showAddresses, setShowAddresses] = useState(false);
  const [addresses, setAddresses] = useState<any[]>(Array.isArray(user?.addresses) ? user.addresses : []);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'card' | 'upi'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const menuItems: MenuItem[] = [
    { id: 'orders',        title: 'My Orders',         to: constants.routes.ORDER_HISTORY },
    { id: 'addresses',     title: 'Addresses',         to: '#' },
    { id: 'payments',      title: 'Payment Methods',   to: '#' },
    { id: 'favourites',    title: 'Favourites',        to: constants.routes.WISHLIST },
    { id: 'wallet',        title: 'VegDash Wallet',    to: '#', value: '₹250' },
    { id: 'notifications', title: 'Notifications',     to: constants.routes.NOTIFICATIONS },
    { id: 'faq',           title: 'FAQ & Help',        to: constants.routes.FAQ },
  ];

  const loadAddresses = async () => {
    if (!isLoggedIn) return;
    setLoadingAddresses(true);
    try {
      const list = await userService.getAddresses();
      setAddresses(list || []);
      if (user) updateUser({ ...user, addresses: list || [] });
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadPayments = async () => {
    try {
      const stored = await AsyncStorage.getItem('vegdash_payment_methods');
      if (stored) {
        setPayments(JSON.parse(stored));
      } else {
        const defaultPayments = [
          { id: 'pay_1', type: 'card', name: user?.name || 'User Name', brand: 'visa', number: '•••• •••• •••• 4242', expiry: '12/29' },
          { id: 'pay_2', type: 'upi', address: 'vegdasher@okaxis' },
        ];
        await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(defaultPayments));
        setPayments(defaultPayments);
      }
    } catch (err) { console.error('Failed to load payment methods:', err); }
  };

  useEffect(() => {
    if (isLoggedIn) { setAddresses(Array.isArray(user?.addresses) ? user.addresses : []); loadPayments(); }
  }, [isLoggedIn, user]);

  const handleLogout = async () => { await logout(); navigate(constants.routes.ONBOARDING, { replace: true }); };

  const handleAddAddress = async () => {
    if (!street.trim() || !city.trim() || !stateName.trim() || !zip.trim()) { Alert.alert('Error', 'Please fill in all address fields'); return; }
    setAddingAddress(true);
    try {
      const updatedList = await userService.addAddress({ street, city, state: stateName, zip, isDefault: addresses.length === 0 });
      setAddresses(updatedList);
      if (user) updateUser({ ...user, addresses: updatedList });
      setStreet(''); setCity(''); setStateName(''); setZip('');
      setShowAddAddress(false);
      Alert.alert('Success', 'Address added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not add address');
    } finally { setAddingAddress(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const updatedList = await userService.deleteAddress(id);
          setAddresses(updatedList);
          if (user) updateUser({ ...user, addresses: updatedList });
        } catch (err: any) { Alert.alert('Error', err.message || 'Could not delete address'); }
      }},
    ]);
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updatedList = await userService.setDefaultAddress(id);
      setAddresses(updatedList);
      if (user) updateUser({ ...user, addresses: updatedList });
    } catch (err: any) { Alert.alert('Error', err.message || 'Could not set default'); }
  };

  const handleAddPayment = async () => {
    if (paymentType === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) { Alert.alert('Error', 'Please fill in all card details'); return; }
      const newCard = { id: 'pay_' + Date.now(), type: 'card', name: cardName, brand: cardNumber.startsWith('5') ? 'mastercard' : 'visa', number: '•••• •••• •••• ' + cardNumber.slice(-4), expiry: cardExpiry };
      const updated = [...payments, newCard];
      await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(updated));
      setPayments(updated); setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv('');
      setShowAddPayment(false); Alert.alert('Success', 'Card added successfully');
    } else {
      if (!upiId.trim() || !upiId.includes('@')) { Alert.alert('Error', 'Please enter a valid UPI ID'); return; }
      const newUpi = { id: 'pay_' + Date.now(), type: 'upi', address: upiId };
      const updated = [...payments, newUpi];
      await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(updated));
      setPayments(updated); setUpiId(''); setShowAddPayment(false); Alert.alert('Success', 'UPI ID added successfully');
    }
  };

  const handleDeletePayment = async (id: string) => {
    Alert.alert('Remove', 'Remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        const updated = payments.filter(p => p.id !== id);
        await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(updated));
        setPayments(updated);
      }},
    ]);
  };

  const Chevron = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.sageGreen} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );

  return (
    <components.SafeAreaView style={s.container}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={{ padding: 8 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={C.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={s.headerTitle}>My Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Profile Card ─────────────────────────────────── */}
        <View style={s.profileCard}>
          {isLoggedIn ? (
            <Image source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150' }} style={s.avatar} />
          ) : (
            <View style={s.avatarPlaceholder}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke={C.sageGreen} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} />
              </Svg>
            </View>
          )}
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={s.profileName}>{isLoggedIn && user ? user.name : 'Guest User'}</Text>
            {isLoggedIn && user ? (
              <Text style={s.profileSub}>{user.phone}</Text>
            ) : (
              <TouchableOpacity onPress={() => navigate(constants.routes.SIGN_IN)} style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 14, color: C.primaryGreen, fontWeight: '700' }}>Log In / Sign Up ›</Text>
              </TouchableOpacity>
            )}
          </View>
          {isLoggedIn && (
            <TouchableOpacity onPress={() => navigate(constants.routes.EDIT_PROFILE)} style={s.editBtn}>
              <Text style={s.editBtnText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── VegDash Gold membership strip ─────────────────── */}
        <View style={s.goldStrip}>
          <View style={s.goldStripIcon}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill={C.gold}>
              <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
            </Svg>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.goldStripTitle}>VegDash Gold Member</Text>
            <Text style={s.goldStripSub}>Earn points · Priority delivery · Free desserts</Text>
          </View>
          <TouchableOpacity onPress={() => navigate(constants.routes.MY_PROMOCODES)}>
            <Text style={s.goldStripLink}>View ›</Text>
          </TouchableOpacity>
        </View>

        {/* ── Menu Items ───────────────────────────────────── */}
        <View style={s.menuSection}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[s.menuItem, i === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => {
                if (item.id === 'addresses') { loadAddresses(); setShowAddresses(true); }
                else if (item.id === 'payments') { loadPayments(); setShowPayments(true); }
                else if (item.id === 'wallet') Alert.alert('VegDash Wallet', 'Your current balance is ₹250.');
                else if (item.to !== '#') navigate(item.to);
              }}
            >
              <Text style={s.menuItemText}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {item.value && <Text style={s.menuItemValue}>{item.value}</Text>}
                <Chevron />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout / Login ──────────────────────────────── */}
        <View style={{ padding: 20, marginTop: 8 }}>
          {isLoggedIn ? (
            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Text style={s.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.loginBtn} onPress={() => navigate(constants.routes.SIGN_IN)}>
              <Text style={s.loginBtnText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Addresses Modal ─────────────────────────────── */}
      <Modal visible={showAddresses} animationType="slide" transparent onRequestClose={() => setShowAddresses(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Delivery Addresses</Text>
              <TouchableOpacity onPress={() => { setShowAddresses(false); setShowAddAddress(false); }}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingAddresses ? (
              <ActivityIndicator size="large" color={C.primaryGreen} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                {addresses.length === 0 ? (
                  <Text style={s.emptyText}>No addresses saved yet.</Text>
                ) : (
                  addresses.map((addr) => (
                    <View key={addr._id} style={[s.sheetCard, addr.isDefault && s.sheetCardActive]}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Text style={s.sheetCardTitle}>{addr.street}</Text>
                          {addr.isDefault && <View style={s.defaultBadge}><Text style={s.defaultBadgeText}>Default</Text></View>}
                        </View>
                        <Text style={s.sheetCardSub}>{addr.city}, {addr.state} - {addr.zip}</Text>
                        {!addr.isDefault && (
                          <TouchableOpacity style={{ marginTop: 8 }} onPress={() => handleSetDefaultAddress(addr._id)}>
                            <Text style={s.actionLink}>Set as Default</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteAddress(addr._id)} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
            {showAddAddress ? (
              <View style={s.formContainer}>
                <Text style={s.formHeader}>Add New Address</Text>
                <TextInput style={s.input} placeholder="Street Address" placeholderTextColor={C.lightText} value={street} onChangeText={setStreet} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[s.input, { flex: 1 }]} placeholder="City" placeholderTextColor={C.lightText} value={city} onChangeText={setCity} />
                  <TextInput style={[s.input, { flex: 1 }]} placeholder="State" placeholderTextColor={C.lightText} value={stateName} onChangeText={setStateName} />
                </View>
                <TextInput style={s.input} placeholder="ZIP / Postal Code" placeholderTextColor={C.lightText} value={zip} onChangeText={setZip} keyboardType="numeric" />
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                  <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowAddAddress(false)}>
                    <Text style={s.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={addingAddress ? undefined : handleAddAddress}>
                    {addingAddress ? <ActivityIndicator size="small" color="#fff" /> : <Text style={s.btnPrimaryText}>Add</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={s.addNewBtn} onPress={() => setShowAddAddress(true)}>
                <Text style={s.addNewBtnText}>+ Add New Address</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Payments Modal ─────────────────────────────── */}
      <Modal visible={showPayments} animationType="slide" transparent onRequestClose={() => setShowPayments(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Payment Methods</Text>
              <TouchableOpacity onPress={() => { setShowPayments(false); setShowAddPayment(false); }}>
                <Text style={s.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {payments.length === 0 ? (
                <Text style={s.emptyText}>No payment methods added yet.</Text>
              ) : (
                payments.map((pm) => (
                  <View key={pm.id} style={s.sheetCard}>
                    {pm.type === 'card' ? (
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Text style={{ fontSize: 18 }}>💳</Text>
                          <Text style={s.sheetCardTitle}>{pm.brand.toUpperCase()} {pm.number}</Text>
                        </View>
                        <Text style={s.sheetCardSub}>Holder: {pm.name}  |  Exp: {pm.expiry}</Text>
                      </View>
                    ) : (
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Text style={{ fontSize: 18 }}>📱</Text>
                          <Text style={s.sheetCardTitle}>UPI: {pm.address}</Text>
                        </View>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => handleDeletePayment(pm.id)} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
            {showAddPayment ? (
              <View style={s.formContainer}>
                <Text style={s.formHeader}>Add Payment Method</Text>
                <View style={s.tabsRow}>
                  <TouchableOpacity style={[s.tab, paymentType === 'card' && s.tabActive]} onPress={() => setPaymentType('card')}>
                    <Text style={[s.tabTxt, paymentType === 'card' && s.tabTxtActive]}>Credit/Debit Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.tab, paymentType === 'upi' && s.tabActive]} onPress={() => setPaymentType('upi')}>
                    <Text style={[s.tabTxt, paymentType === 'upi' && s.tabTxtActive]}>UPI ID</Text>
                  </TouchableOpacity>
                </View>
                {paymentType === 'card' ? (
                  <>
                    <TextInput style={s.input} placeholder="Cardholder Name" placeholderTextColor={C.lightText} value={cardName} onChangeText={setCardName} />
                    <TextInput style={s.input} placeholder="Card Number" placeholderTextColor={C.lightText} value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" maxLength={16} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput style={[s.input, { flex: 1 }]} placeholder="MM/YY" placeholderTextColor={C.lightText} value={cardExpiry} onChangeText={setCardExpiry} maxLength={5} />
                      <TextInput style={[s.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor={C.lightText} value={cardCvv} onChangeText={setCardCvv} keyboardType="numeric" maxLength={3} secureTextEntry />
                    </View>
                  </>
                ) : (
                  <TextInput style={s.input} placeholder="UPI ID (e.g. user@okhdfcbank)" placeholderTextColor={C.lightText} value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
                )}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                  <TouchableOpacity style={[s.btnSecondary, { flex: 1 }]} onPress={() => setShowAddPayment(false)}>
                    <Text style={s.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.btnPrimary, { flex: 1 }]} onPress={handleAddPayment}>
                    <Text style={s.btnPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={s.addNewBtn} onPress={() => setShowAddPayment(true)}>
                <Text style={s.addNewBtnText}>+ Add Payment Method</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.background },
  header:       { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.divider },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: C.primaryText, fontFamily: Platform.OS === 'web' ? 'Inter' : 'sans-serif' },

  profileCard:       { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.divider },
  avatar:            { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: C.border },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: C.warmWhite, alignItems: 'center', justifyContent: 'center' },
  profileName:       { fontSize: 18, fontWeight: '700', color: C.primaryText, fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif', marginBottom: 4 },
  profileSub:        { fontSize: 13, color: C.secondaryText },
  editBtn:           { marginLeft: 'auto' as any, padding: 8 },
  editBtnText:       { fontSize: 20 },

  goldStrip:      { marginHorizontal: 20, marginTop: 14, backgroundColor: C.darkGreen, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center' },
  goldStripIcon:  { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(199,169,107,0.2)', justifyContent: 'center', alignItems: 'center' },
  goldStripTitle: { fontSize: 12, fontWeight: '700', color: C.gold },
  goldStripSub:   { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  goldStripLink:  { fontSize: 11, fontWeight: '700', color: C.gold },

  menuSection: { marginTop: 14, backgroundColor: C.card, borderRadius: 20, marginHorizontal: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.divider },
  menuItem:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.divider },
  menuItemText:  { fontSize: 14, fontWeight: '600', color: C.primaryText },
  menuItemValue: { fontSize: 13, fontWeight: '700', color: C.primaryGreen },

  logoutBtn:     { backgroundColor: '#FEE2E2', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  logoutBtnText: { fontSize: 15, fontWeight: '700', color: '#D32F2F' },
  loginBtn:      { backgroundColor: C.primaryGreen, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  loginBtnText:  { fontSize: 15, fontWeight: '700', color: '#FFF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: C.card, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 24, paddingBottom: 40 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle:   { fontSize: 17, fontWeight: '700', color: C.primaryText },
  closeBtn:     { fontSize: 18, color: C.lightText, fontWeight: '700', padding: 4 },
  emptyText:    { textAlign: 'center', fontSize: 13, color: C.lightText, marginVertical: 20 },

  sheetCard:       { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 12, backgroundColor: C.warmWhite },
  sheetCardActive: { borderColor: C.primaryGreen, backgroundColor: 'rgba(11,77,58,0.03)' },
  sheetCardTitle:  { fontSize: 14, fontWeight: '700', color: C.primaryText },
  sheetCardSub:    { fontSize: 12, color: C.secondaryText, marginTop: 2 },
  defaultBadge:    { backgroundColor: 'rgba(11,77,58,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText:{ fontSize: 9, color: C.primaryGreen, fontWeight: '700' },
  actionLink:      { fontSize: 12, color: C.primaryGreen, fontWeight: '700' },

  addNewBtn:     { height: 46, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, borderColor: C.primaryGreen, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  addNewBtnText: { fontSize: 14, color: C.primaryGreen, fontWeight: '700' },

  formContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: C.divider, paddingTop: 16, gap: 10 },
  formHeader:    { fontSize: 14, fontWeight: '700', color: C.primaryText, marginBottom: 6 },
  input:         { height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, fontSize: 13, color: C.primaryText, backgroundColor: C.warmWhite },

  btnPrimary:     { height: 46, backgroundColor: C.primaryGreen, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { fontSize: 14, color: '#FFF', fontWeight: '700' },
  btnSecondary:     { height: 46, backgroundColor: C.warmWhite, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 14, color: C.primaryText, fontWeight: '700' },

  tabsRow:     { flexDirection: 'row', gap: 10, marginBottom: 5 },
  tab:         { flex: 1, height: 38, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card },
  tabActive:   { borderColor: C.primaryGreen, backgroundColor: 'rgba(11,77,58,0.05)' },
  tabTxt:      { fontSize: 12, color: C.lightText, fontWeight: '600' },
  tabTxtActive:{ color: C.primaryGreen, fontWeight: '700' },
});
