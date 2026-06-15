import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { authService } from '@/services/authService';

export const ForgetPassword: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your registered phone number');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOTP(phone);
      Alert.alert('OTP Sent', `Verification code sent to ${phone}`);
      navigate(constants.routes.CONFIRMATION_CODE, {
        state: { phone, flow: 'forgot_password' }
      });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to send verification code');
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
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered phone number below to receive verification code to reset password.
        </Text>

        <components.Input
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          containerStyle={{ marginBottom: 25 }}
        />

        <TouchableOpacity style={styles.btn} onPress={loading ? undefined : handleSend}>
          <Text style={styles.btnText}>{loading ? 'Sending...' : 'Send Reset Code'}</Text>
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
