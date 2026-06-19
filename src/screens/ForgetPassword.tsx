import { theme } from '@/theme/theme';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { authService } from '@/services/authService';
import { useToastStore } from '@/stores/useToastStore';

export const ForgetPassword: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const { showToast } = useToastStore.getState();

    if (!email.trim()) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.sendPasswordResetEmail(email);
      showToast(`Verification code sent to ${email}`, 'success');
      navigate(constants.routes.CONFIRMATION_CODE, {
        state: { email, flow: 'forgot_password' }
      });
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to send recovery email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address below to receive a verification code to reset password.
        </Text>

        <components.Input
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          containerStyle={{ marginBottom: 25 }}
        />

        <TouchableOpacity style={styles.btn} onPress={loading ? undefined : handleSend}>
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
