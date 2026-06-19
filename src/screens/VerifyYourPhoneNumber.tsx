import { theme } from '@/theme/theme';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { authService } from '@/services/authService';

export const VerifyYourPhoneNumber: React.FC = () => {
  const { navigate, params } = hooks.useRouter();
  const [phone, setPhone] = useState((params as any)?.phone || '');
  const [loading, setLoading] = useState(false);
  const flow = (params as any)?.flow || 'signup';

  useEffect(() => {
    if ((params as any)?.phone) {
      sendOTP((params as any)?.phone);
    }
  }, [(params as any)?.phone]);

  const sendOTP = async (phoneNumber: string) => {
    setLoading(true);
    try {
      await authService.sendOTP(phoneNumber);
      Alert.alert('OTP Sent', `Verification code sent to ${phoneNumber}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    // If the phone number is different or wasn't auto-sent, send it first
    if (phone !== (params as any)?.phone) {
      await sendOTP(phone);
    }
    navigate(constants.routes.CONFIRMATION_CODE, {
      state: { phone, flow }
    });
  };


  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Phone</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.subtitle}>
          Enter your phone number below so we can send a verification code to authenticate your device.
        </Text>

        <components.Input
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          containerStyle={{ marginBottom: 25 }}
        />

        <TouchableOpacity style={styles.btn} onPress={loading ? undefined : handleVerify}>
          <Text style={styles.btnText}>{loading ? 'Sending...' : 'Send Verification Code'}</Text>
        </TouchableOpacity>
      </View>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.warmWhite },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.primaryText, fontFamily: 'Outfit', marginBottom: 10 },
  subtitle: { fontSize: 14, color: theme.colors.lightText, fontFamily: 'Outfit', lineHeight: 22, marginBottom: 30 },
  btn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
});
