import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';

export const SignUp: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', email: '', password: '', confirmPassword: '',
  });
  const { register, loading } = useAuthStore();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasMinLength = form.password.length >= 6;
  const hasCapital = /[A-Z]/.test(form.password);
  const hasSmall = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(form.password);
  const isPasswordValid = hasMinLength && hasCapital && hasSmall && hasNumber && hasSpecial;
  const isEmailValid = emailRegex.test(form.email);

  const onChangeText = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    if (!form.fullName || !form.phoneNumber || !form.email || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters and contain a capital letter, small letter, number, and special character.'
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service');
      return;
    }

    try {
      await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phoneNumber,
      });
      // Registration successful (token and user saved in store).
      // Now navigate to Verify Phone Number with flow param.
      navigate(constants.routes.VERIFY_YOUR_PHONE_NUMBER, {
        state: {
          phone: form.phoneNumber,
          flow: 'signup',
        }
      });
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'An error occurred during registration.');
    }
  };

  return (
    <components.SafeAreaView>
      <components.Header title="Sign Up" showGoBack />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome to Veg Dash</Text>
        <Text style={styles.subtitle}>Sign up to continue</Text>

        <components.Input containerStyle={styles.inputMargin} placeholder="Full Name" value={form.fullName} onChangeText={(v) => onChangeText('fullName', v)} />
        <components.Input containerStyle={styles.inputMargin} placeholder="Phone Number" value={form.phoneNumber} onChangeText={(v) => onChangeText('phoneNumber', v)} />
        
        <components.Input containerStyle={styles.inputMargin} placeholder="Email" value={form.email} onChangeText={(v) => onChangeText('email', v)} />
        {form.email.length > 0 && !isEmailValid && (
          <Text style={styles.errorText}>Please enter a valid email address</Text>
        )}

        <components.Input containerStyle={styles.inputMargin} placeholder="Password" value={form.password} inputType="password" onChangeText={(v) => onChangeText('password', v)} />
        {form.password.length > 0 && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <View style={styles.requirementRow}>
              <Text style={[styles.requirementText, hasMinLength ? styles.metText : styles.unmetText]}>
                {hasMinLength ? '✓' : '•'} At least 6 characters
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={[styles.requirementText, hasCapital ? styles.metText : styles.unmetText]}>
                {hasCapital ? '✓' : '•'} A capital letter (A-Z)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={[styles.requirementText, hasSmall ? styles.metText : styles.unmetText]}>
                {hasSmall ? '✓' : '•'} A small letter (a-z)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={[styles.requirementText, hasNumber ? styles.metText : styles.unmetText]}>
                {hasNumber ? '✓' : '•'} A number (0-9)
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <Text style={[styles.requirementText, hasSpecial ? styles.metText : styles.unmetText]}>
                {hasSpecial ? '✓' : '•'} A special character (e.g., !, @, #, $, %)
              </Text>
            </View>
          </View>
        )}

        <components.Input containerStyle={styles.inputMargin} placeholder="Confirm Password" value={form.confirmPassword} inputType="password" onChangeText={(v) => onChangeText('confirmPassword', v)} />

        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreeToTerms(!agreeToTerms)}>
          <components.Checkbox checked={agreeToTerms} />
          <Text style={styles.termsText}>You agree to our Terms of Service</Text>
        </TouchableOpacity>

        <components.Button label={loading ? 'Signing up...' : 'Sign Up'} onClick={loading ? undefined : handleSignUp} />


        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigate(constants.routes.SIGN_IN)}>
            <Text style={styles.signinLink}>Sign in!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingTop: 30, paddingBottom: 40 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: '#0F5B35', marginBottom: 8, fontFamily: 'Outfit' },
  subtitle: { textAlign: 'center', fontSize: 16, marginBottom: 28, color: '#7E8B97', fontFamily: 'Outfit' },
  inputMargin: { marginBottom: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  termsText: { marginLeft: 8, color: '#7E8B97', fontFamily: 'Outfit', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: '#1E2022', fontFamily: 'Outfit' },
  signinLink: { color: '#0F5B35', fontWeight: '500', fontFamily: 'Outfit' },
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
