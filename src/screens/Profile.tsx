import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Line, Circle, Rect, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';
import { userService, AddressPayload } from '@/services/userService';

type MenuItem = { id: string; title: string; to: string; value?: string };

export const Profile: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { user, isLoggedIn, logout, updateUser } = useAuthStore();

  // Address Modal States
  const [showAddresses, setShowAddresses] = useState(false);
  const [addresses, setAddresses] = useState<any[]>(Array.isArray(user?.addresses) ? user.addresses : []);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [zip, setZip] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  // Payment Modal States
  const [showPayments, setShowPayments] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'card' | 'upi'>('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Menu items list
  const menuItems: MenuItem[] = [
    { id: 'orders', title: 'My Orders', to: constants.routes.ORDER_HISTORY },
    { id: 'addresses', title: 'Addresses', to: '#' },
    { id: 'payments', title: 'Payment Methods', to: '#' },
    { id: 'favourites', title: 'Favourites', to: constants.routes.WISHLIST },
    { id: 'wallet', title: 'Veg Dash Wallet', to: '#', value: '₹250' },
    { id: 'notifications', title: 'Notifications', to: constants.routes.NOTIFICATIONS },
    { id: 'faq', title: 'FAQ & Help', to: constants.routes.FAQ },
  ];

  // Fetch addresses on mount / modal open
  const loadAddresses = async () => {
    if (!isLoggedIn) return;
    setLoadingAddresses(true);
    try {
      const list = await userService.getAddresses();
      setAddresses(list || []);
      if (user) {
        updateUser({ ...user, addresses: list || [] });
      }
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load payment methods from AsyncStorage
  const loadPayments = async () => {
    try {
      const stored = await AsyncStorage.getItem('vegdash_payment_methods');
      if (stored) {
        setPayments(JSON.parse(stored));
      } else {
        // Default mock methods if empty
        const defaultPayments = [
          { id: 'pay_1', type: 'card', name: user?.name || 'User Name', brand: 'visa', number: '•••• •••• •••• 4242', expiry: '12/29' },
          { id: 'pay_2', type: 'upi', address: 'vegdasher@okaxis' }
        ];
        await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(defaultPayments));
        setPayments(defaultPayments);
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setAddresses(Array.isArray(user?.addresses) ? user.addresses : []);
      loadPayments();
    }
  }, [isLoggedIn, user]);

  const handleLogout = async () => {
    await logout();
    navigate(constants.routes.ONBOARDING, { replace: true });
  };

  // Address Actions
  const handleAddAddress = async () => {
    if (!street.trim() || !city.trim() || !stateName.trim() || !zip.trim()) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }
    setAddingAddress(true);
    try {
      const updatedList = await userService.addAddress({
        street,
        city,
        state: stateName,
        zip,
        isDefault: addresses.length === 0, // default if first
      });
      setAddresses(updatedList);
      if (user) {
        updateUser({ ...user, addresses: updatedList });
      }
      setStreet('');
      setCity('');
      setStateName('');
      setZip('');
      setShowAddAddress(false);
      Alert.alert('Success', 'Address added successfully');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not add address');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedList = await userService.deleteAddress(id);
            setAddresses(updatedList);
            if (user) {
              updateUser({ ...user, addresses: updatedList });
            }
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || err.message || 'Could not delete address');
          }
        }
      }
    ]);
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updatedList = await userService.setDefaultAddress(id);
      setAddresses(updatedList);
      if (user) {
        updateUser({ ...user, addresses: updatedList });
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not set default address');
    }
  };

  // Payment Actions
  const handleAddPayment = async () => {
    if (paymentType === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
      const newCard = {
        id: 'pay_' + Date.now(),
        type: 'card',
        name: cardName,
        brand: cardNumber.startsWith('5') ? 'mastercard' : 'visa',
        number: '•••• •••• •••• ' + cardNumber.slice(-4),
        expiry: cardExpiry
      };
      const updated = [...payments, newCard];
      await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(updated));
      setPayments(updated);
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setShowAddPayment(false);
      Alert.alert('Success', 'Card added successfully');
    } else {
      if (!upiId.trim() || !upiId.includes('@')) {
        Alert.alert('Error', 'Please enter a valid UPI ID (e.g. user@bank)');
        return;
      }
      const newUpi = {
        id: 'pay_' + Date.now(),
        type: 'upi',
        address: upiId
      };
      const updated = [...payments, newUpi];
      await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(updated));
      setPayments(updated);
      setUpiId('');
      setShowAddPayment(false);
      Alert.alert('Success', 'UPI ID added successfully');
    }
  };

  const handleDeletePayment = async (id: string) => {
    Alert.alert('Delete Payment Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = payments.filter(p => p.id !== id);
          await AsyncStorage.setItem('vegdash_payment_methods', JSON.stringify(updated));
          setPayments(updated);
        }
      }
    ]);
  };

  const renderChevron = () => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#7E8B97" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );

  return (
    <components.SafeAreaView>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={{ padding: 8 }}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {isLoggedIn ? (
            <Image
              source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#7E8B97" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><Circle cx={12} cy={7} r={4} />
              </Svg>
            </View>
          )}
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={styles.profileName}>{isLoggedIn && user ? user.name : 'Guest User'}</Text>
            {isLoggedIn && user ? (
              <Text style={styles.profileSub}>{user.phone}</Text>
            ) : (
              <TouchableOpacity onPress={() => navigate(constants.routes.SIGN_IN)} style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 14, color: '#0F5B35', fontWeight: '700', fontFamily: 'Outfit' }}>Log In / Sign Up ›</Text>
              </TouchableOpacity>
            )}
          </View>
          {isLoggedIn && (
            <TouchableOpacity onPress={() => navigate(constants.routes.EDIT_PROFILE)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.id === 'addresses') {
                  loadAddresses();
                  setShowAddresses(true);
                } else if (item.id === 'payments') {
                  loadPayments();
                  setShowPayments(true);
                } else if (item.id === 'wallet') {
                  Alert.alert('VegDash Wallet', 'Your current balance is ₹250. You can use it at checkout!');
                } else if (item.to !== '#') {
                  navigate(item.to);
                }
              }}
            >
              <Text style={styles.menuItemText}>{item.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                {renderChevron()}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Login / Logout button */}
        <View style={styles.actionSection}>
          {isLoggedIn ? (
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigate(constants.routes.SIGN_IN)}>
              <Text style={styles.loginBtnText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 1. Addresses Bottom Sheet Modal */}
      <Modal visible={showAddresses} animationType="slide" transparent onRequestClose={() => setShowAddresses(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Delivery Addresses</Text>
              <TouchableOpacity onPress={() => { setShowAddresses(false); setShowAddAddress(false); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingAddresses ? (
              <ActivityIndicator size="large" color="#0F5B35" style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
                {addresses.length === 0 ? (
                  <Text style={styles.emptyText}>No addresses saved yet.</Text>
                ) : (
                  addresses.map((addr) => (
                    <View key={addr._id} style={[styles.card, addr.isDefault && styles.cardActive]}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Text style={styles.cardTitle}>{addr.street}</Text>
                          {addr.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Default</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.cardSub}>{addr.city}, {addr.state} - {addr.zip}</Text>
                        
                        {!addr.isDefault && (
                          <TouchableOpacity style={{ marginTop: 8 }} onPress={() => handleSetDefaultAddress(addr._id)}>
                            <Text style={styles.actionLink}>Set as Default</Text>
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
              <View style={styles.formContainer}>
                <Text style={styles.formHeader}>Add New Address</Text>
                <TextInput style={styles.input} placeholder="Street Address" placeholderTextColor="#7E8B97" value={street} onChangeText={setStreet} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="City" placeholderTextColor="#7E8B97" value={city} onChangeText={setCity} />
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="State" placeholderTextColor="#7E8B97" value={stateName} onChangeText={setStateName} />
                </View>
                <TextInput style={styles.input} placeholder="ZIP / Postal Code" placeholderTextColor="#7E8B97" value={zip} onChangeText={setZip} keyboardType="numeric" />
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                  <TouchableOpacity style={[styles.btnSecondary, { flex: 1 }]} onPress={() => setShowAddAddress(false)}>
                    <Text style={styles.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={addingAddress ? undefined : handleAddAddress}>
                    {addingAddress ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.btnPrimaryText}>Add</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addNewBtn} onPress={() => setShowAddAddress(true)}>
                <Text style={styles.addNewBtnText}>+ Add New Address</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* 2. Payment Methods Bottom Sheet Modal */}
      <Modal visible={showPayments} animationType="slide" transparent onRequestClose={() => setShowPayments(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Payment Methods</Text>
              <TouchableOpacity onPress={() => { setShowPayments(false); setShowAddPayment(false); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={false}>
              {payments.length === 0 ? (
                <Text style={styles.emptyText}>No payment methods added yet.</Text>
              ) : (
                payments.map((pm) => (
                  <View key={pm.id} style={styles.card}>
                    {pm.type === 'card' ? (
                      <>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Text style={{ fontSize: 18 }}>💳</Text>
                            <Text style={styles.cardTitle}>{pm.brand.toUpperCase()} {pm.number}</Text>
                          </View>
                          <Text style={styles.cardSub}>Holder: {pm.name}  |  Exp: {pm.expiry}</Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <Text style={{ fontSize: 18 }}>📱</Text>
                            <Text style={styles.cardTitle}>UPI: {pm.address}</Text>
                          </View>
                        </View>
                      </>
                    )}
                    <TouchableOpacity onPress={() => handleDeletePayment(pm.id)} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            {showAddPayment ? (
              <View style={styles.formContainer}>
                <Text style={styles.formHeader}>Add Payment Method</Text>
                
                {/* Tabs */}
                <View style={styles.tabsRow}>
                  <TouchableOpacity style={[styles.tab, paymentType === 'card' && styles.tabActive]} onPress={() => setPaymentType('card')}>
                    <Text style={[styles.tabText, paymentType === 'card' && styles.tabTextActive]}>Credit/Debit Card</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.tab, paymentType === 'upi' && styles.tabActive]} onPress={() => setPaymentType('upi')}>
                    <Text style={[styles.tabText, paymentType === 'upi' && styles.tabTextActive]}>UPI ID</Text>
                  </TouchableOpacity>
                </View>

                {paymentType === 'card' ? (
                  <>
                    <TextInput style={styles.input} placeholder="Cardholder Name" placeholderTextColor="#7E8B97" value={cardName} onChangeText={setCardName} />
                    <TextInput style={styles.input} placeholder="Card Number" placeholderTextColor="#7E8B97" value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" maxLength={16} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TextInput style={[styles.input, { flex: 1 }]} placeholder="MM/YY" placeholderTextColor="#7E8B97" value={cardExpiry} onChangeText={setCardExpiry} maxLength={5} />
                      <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" placeholderTextColor="#7E8B97" value={cardCvv} onChangeText={setCardCvv} keyboardType="numeric" maxLength={3} secureTextEntry />
                    </View>
                  </>
                ) : (
                  <TextInput style={styles.input} placeholder="UPI ID (e.g. user@okhdfcbank)" placeholderTextColor="#7E8B97" value={upiId} onChangeText={setUpiId} autoCapitalize="none" />
                )}

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                  <TouchableOpacity style={[styles.btnSecondary, { flex: 1 }]} onPress={() => setShowAddPayment(false)}>
                    <Text style={styles.btnSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={handleAddPayment}>
                    <Text style={styles.btnPrimaryText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addNewBtn} onPress={() => setShowAddPayment(true)}>
                <Text style={styles.addNewBtnText}>+ Add Payment Method</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center' },
  profileName: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 4 },
  profileSub: { fontSize: 14, color: '#7E8B97', fontFamily: 'Outfit' },
  editBtn: { marginLeft: 'auto' as any, padding: 8 },
  editBtnText: { fontSize: 20 },
  menuSection: { marginTop: 8, backgroundColor: '#FFFFFF' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  menuItemText: { fontSize: 15, fontWeight: '600', color: '#1E2022', fontFamily: 'Outfit' },
  menuItemValue: { fontSize: 14, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  actionSection: { padding: 20, marginTop: 16 },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  logoutBtnText: { fontSize: 16, fontWeight: '700', color: '#FF2121', fontFamily: 'Outfit' },
  loginBtn: { backgroundColor: '#0F5B35', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Outfit' },
  
  // Modal Sheet Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  closeBtn: { fontSize: 18, color: '#7E8B97', fontWeight: '700', padding: 4 },
  emptyText: { textAlign: 'center', fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit', marginVertical: 20 },
  
  // Cards inside sheets
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, backgroundColor: '#FAFBFC' },
  cardActive: { borderColor: '#0F5B35', backgroundColor: 'rgba(15,91,53,0.02)' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  cardSub: { fontSize: 12, color: '#7E8B97', fontFamily: 'Outfit', marginTop: 2 },
  defaultBadge: { backgroundColor: 'rgba(15,91,53,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  defaultBadgeText: { fontSize: 9, color: '#0F5B35', fontWeight: '700', fontFamily: 'Outfit' },
  actionLink: { fontSize: 12, color: '#0F5B35', fontWeight: '700', fontFamily: 'Outfit' },
  
  // Buttons
  addNewBtn: { height: 44, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#0F5B35', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  addNewBtnText: { fontSize: 14, color: '#0F5B35', fontWeight: '700', fontFamily: 'Outfit' },
  
  // Form container
  formContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F5', paddingTop: 16, gap: 10 },
  formHeader: { fontSize: 14, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 6 },
  input: { height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#EEEEEE', paddingHorizontal: 14, fontSize: 13, color: '#1E2022', fontFamily: 'Outfit', backgroundColor: '#F9FAFB' },
  btnPrimary: { height: 44, backgroundColor: '#0F5B35', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnPrimaryText: { fontSize: 14, color: '#FFFFFF', fontWeight: '700', fontFamily: 'Outfit' },
  btnSecondary: { height: 44, backgroundColor: '#F3F4F5', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { fontSize: 14, color: '#1E2022', fontWeight: '700', fontFamily: 'Outfit' },
  
  // Tabs
  tabsRow: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  tab: { flex: 1, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  tabActive: { borderColor: '#0F5B35', backgroundColor: '#E8F9F1' },
  tabText: { fontSize: 12, color: '#7E8B97', fontWeight: '600', fontFamily: 'Outfit' },
  tabTextActive: { color: '#0F5B35', fontWeight: '700' }
});
