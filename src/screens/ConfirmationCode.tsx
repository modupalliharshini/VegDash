import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/useAuthStore';

export const ConfirmationCode: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const phone = (params as any)?.phone || '';
  const flow = (params as any)?.flow || 'signup';
  const { setPhoneVerified } = useAuthStore();

  const handleVerify = async () => {
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter a 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      if (flow === 'signup') {
        await authService.verifyOTP(phone, code);
        setPhoneVerified(true);
        navigate(constants.routes.ACCOUNT_CREATED);
      } else {
        // forgot password flow: verify it by going to NewPassword and resetting there
        navigate(constants.routes.NEW_PASSWORD, {
          state: { phone, code }
        });
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.response?.data?.message || err.message || 'Invalid verification code');
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
        <Text style={styles.headerTitle}>Verification Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit verification code to your phone number. Please enter it below to confirm.
        </Text>

        <components.Input
          placeholder="Enter 6-digit code"
          value={code}
          onChangeText={(val) => setCode(val.replace(/[^0-9]/g, '').slice(0, 6))}
          containerStyle={{ marginBottom: 25 }}
        />

        <TouchableOpacity style={styles.btn} onPress={loading ? undefined : handleVerify}>
          <Text style={styles.btnText}>{loading ? 'Verifying...' : 'Verify Code'}</Text>
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
