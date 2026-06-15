import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { authService } from '@/services/authService';

export const NewPassword: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const { showToast } = stores.useToastStore();
  const email = (params as any)?.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!password.trim() || password.length < 6) {
      showToast('Password must be at least 6 characters!', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        newPassword: password,
      });
      showToast('Password has been reset successfully. Please sign in.', 'success');
      navigate(constants.routes.SIGN_IN);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };


  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Create a secure, unique password to safeguard your account.
        </Text>

        <components.Input
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
          inputType="password"
          containerStyle={{ marginBottom: 15 }}
        />

        <components.Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          inputType="password"
          containerStyle={{ marginBottom: 25 }}
        />

        <TouchableOpacity style={styles.btn} onPress={loading ? undefined : handleSave}>
          <Text style={styles.btnText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
        </TouchableOpacity>
      </View>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#7E8B97', fontFamily: 'Outfit', lineHeight: 22, marginBottom: 30 },
  btn: { backgroundColor: '#0F5B35', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
});
