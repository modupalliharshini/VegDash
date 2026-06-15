import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import logoImage from '../assets/images/logo.png';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';

export const SignIn: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const { form, onChangeText } = hooks.useFormField({ email: '', password: '' });
  const { login, loading } = useAuthStore();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(form.email);

  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    try {
      await login({ email: form.email, password: form.password });
      navigate(constants.routes.HOME, { replace: true });
    } catch (err: any) {
      useToastStore.getState().showToast(err.message || 'Check your credentials and try again.', 'error');
    }
  };


  return (
    <components.SafeAreaView>
      <components.Header title="Sign In" showGoBack />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <components.Input
          containerStyle={styles.inputMargin}
          placeholder="johndoe@mail.com"
          value={form.email}
          onChangeText={(val) => onChangeText('email', val)}
        />
        {form.email.length > 0 && !isEmailValid && (
          <Text style={styles.errorText}>Please enter a valid email address</Text>
        )}

        <components.Input
          containerStyle={styles.inputMargin}
          placeholder="**********"
          value={form.password}
          inputType="password"
          onChangeText={(val) => onChangeText('password', val)}
        />

        <View style={styles.row}>
          <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(!rememberMe)}>
            <components.Checkbox checked={rememberMe} />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigate(constants.routes.FORGOT_PASSWORD)}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <components.Button label="Sign in" onClick={handleSignIn} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigate(constants.routes.SIGN_UP)}>
            <Text style={styles.signupLink}>Sign up!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 180, height: 70 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#0F5B35', marginBottom: 8, fontFamily: 'Outfit', textTransform: 'capitalize' },
  subtitle: { textAlign: 'center', fontSize: 16, marginBottom: 28, color: '#7E8B97', fontFamily: 'Outfit' },
  inputMargin: { marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rememberText: { fontSize: 14, color: '#1E2022', marginLeft: 8, fontFamily: 'Outfit' },
  forgotText: { fontSize: 14, color: '#FE724E', fontFamily: 'Outfit' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 },
  footerText: { color: '#1E2022', fontFamily: 'Outfit' },
  signupLink: { color: '#0F5B35', fontWeight: '500', fontFamily: 'Outfit' },
  requirementsContainer: {
    backgroundColor: '#F4F9F6',
    borderWidth: 1,
    borderColor: '#E2EFE7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F5B35',
    marginBottom: 6,
    fontFamily: 'Outfit',
  },
  requirementRow: {
    marginVertical: 2,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Outfit',
  },
  metText: {
    color: '#10B981',
    fontWeight: '600',
  },
  unmetText: {
    color: '#7E8B97',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontFamily: 'Outfit',
    marginTop: -10,
    marginBottom: 15,
    paddingLeft: 5,
  },
});
