import { theme } from '@/theme/theme';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { authService } from '@/services/authService';
import { useToastStore } from '@/stores/useToastStore';

export const SignUp: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

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
    const { showToast } = useToastStore.getState();

    if (!form.fullName || !form.phoneNumber || !form.email || !form.password || !form.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (!isEmailValid) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (!isPasswordValid) {
      showToast(
        'Password must be at least 6 characters and contain a capital letter, small letter, number, and special character.',
        'error'
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (!agreeToTerms) {
      showToast('Please agree to the Terms of Service', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Initiate SignUp (send confirmation email)
      await authService.signUpInit({
        name: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phoneNumber,
      });

      // 2. Show confirmation email sent popup
      showToast(`Confirmation email sent to ${form.email}`, 'success');

      // 3. Navigate to confirmation code screen with registration state
      navigate(constants.routes.CONFIRMATION_CODE, {
        state: {
          email: form.email,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          password: form.password,
          flow: 'signup',
        }
      });
    } catch (err: any) {
      showToast(err.message || 'An error occurred during registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <components.SafeAreaView style={{ flex: 1 }}>
      <components.Header title="Sign Up" showGoBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
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
      </KeyboardAvoidingView>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 30, paddingBottom: 120 },
  title: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: theme.colors.primaryGreen, marginBottom: 8, fontFamily: 'Outfit' },
  subtitle: { textAlign: 'center', fontSize: 16, marginBottom: 28, color: theme.colors.lightText, fontFamily: 'Outfit' },
  inputMargin: { marginBottom: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  termsText: { marginLeft: 8, color: theme.colors.lightText, fontFamily: 'Outfit', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: theme.colors.primaryText, fontFamily: 'Outfit' },
  signinLink: { color: theme.colors.primaryGreen, fontWeight: '500', fontFamily: 'Outfit' },
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
    color: theme.colors.primaryGreen,
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
    color: theme.colors.lightText,
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
