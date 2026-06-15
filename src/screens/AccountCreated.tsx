import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Path } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';

export const AccountCreated: React.FC = () => {
  const { navigate } = hooks.useRouter();

  const handleGetStarted = async () => {
    // Log user in automatically
    await AsyncStorage.setItem('isLoggedIn', 'true');
    navigate(constants.routes.HOME, { replace: true });
  };

  return (
    <components.SafeAreaView>
      <View style={styles.content}>
        {/* Success Check Ring */}
        <View style={styles.successRing}>
          <Svg width={60} height={60} viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <Path d="M22 4L12 14.01l-3-3" />
          </Svg>
        </View>

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          Your account has been successfully created. Welcome to Veg Dash - 100% Veg. 100% Good.
        </Text>

        <TouchableOpacity style={styles.btn} onPress={handleGetStarted}>
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: '#FFFFFF' },
  successRing: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(76,175,80,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center', lineHeight: 22, marginBottom: 35, paddingHorizontal: 10 },
  btn: { backgroundColor: '#0F5B35', borderRadius: 16, height: 52, alignItems: 'center', justifyContent: 'center', width: '100%' },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' },
});
