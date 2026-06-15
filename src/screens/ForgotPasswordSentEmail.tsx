import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';

export const ForgotPasswordSentEmail: React.FC = () => {
  const { navigate } = hooks.useRouter();

  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Email Sent</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent password recovery instructions to your email address. Please click the link or use the code to reset your password.
        </Text>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigate(constants.routes.CONFIRMATION_CODE)}
        >
          <Text style={styles.btnText}>Enter Verification Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={() => navigate(constants.routes.SIGN_IN)}
        >
          <Text style={styles.resendText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  btn: { backgroundColor: '#0F5B35', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 12 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
  resendBtn: { padding: 12 },
  resendText: { fontSize: 14, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
});
