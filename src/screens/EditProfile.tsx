import { theme } from '@/theme/theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/authService';

export const EditProfile: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { showToast } = stores.useToastStore();
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Format first address street as the display address string
  const defaultAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];
  const [address, setAddress] = useState(defaultAddress?.street || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty!');
      return;
    }

    setLoading(true);
    try {
      const addressObj = {
        street: address || 'Main Street',
        city: defaultAddress?.city || 'Gachibowli',
        state: defaultAddress?.state || 'Telangana',
        zip: defaultAddress?.zip || '500032',
        isDefault: true,
      };

      const updated = await authService.updateProfile({
        name,
        email,
        addresses: JSON.stringify([addressObj]) as any,
      });

      updateUser(updated);
      showToast('Profile updated successfully!');
      navigate(-1);
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || err.message || 'Could not update profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Avatar Display */}
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePicBtn}>
            <Text style={styles.changePicText}>Change Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Input fields section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <components.Input
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number (Non-editable)</Text>
            <components.Input
              placeholder="Enter phone number"
              value={phone}
              onChangeText={setPhone}
              containerStyle={{ opacity: 0.6 }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <components.Input
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Default Delivery Address</Text>
            <components.Input
              placeholder="Enter delivery address"
              value={address}
              onChangeText={setAddress}
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={loading ? undefined : handleSave}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.warmWhite },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10, borderWidth: 2, borderColor: theme.colors.primaryGreen },
  changePicBtn: { padding: 4 },
  changePicText: { fontSize: 13, fontWeight: '700', color: theme.colors.primaryGreen, fontFamily: 'Outfit' },
  formSection: { gap: 18, marginBottom: 30 },
  inputGroup: { flexDirection: 'column', gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.lightText, fontFamily: 'Outfit' },
  saveBtn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Outfit' },
});
