#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src/screens');

// Screens that need stub migration
const stubScreens = [
  { file: 'Shop.tsx', name: 'Shop', title: 'Search Restaurants' },
  { file: 'Dish.tsx', name: 'Dish', title: 'Menu' },
  { file: 'OrderHistory.tsx', name: 'OrderHistory', title: 'My Orders' },
  { file: 'MyPromocodes.tsx', name: 'MyPromocodes', title: 'Offers & Coupons' },
  { file: 'Notifications.tsx', name: 'Notifications', title: 'Notifications' },
  { file: 'EditProfile.tsx', name: 'EditProfile', title: 'Edit Profile' },
  { file: 'FAQ.tsx', name: 'FAQ', title: 'FAQ & Help' },
  { file: 'AccountCreated.tsx', name: 'AccountCreated', title: 'Account Created' },
  { file: 'ForgetPassword.tsx', name: 'ForgetPassword', title: 'Forgot Password' },
  { file: 'NewPassword.tsx', name: 'NewPassword', title: 'New Password' },
  { file: 'VerifyYourPhoneNumber.tsx', name: 'VerifyYourPhoneNumber', title: 'Verify Phone' },
  { file: 'ConfirmationCode.tsx', name: 'ConfirmationCode', title: 'Verification Code' },
  { file: 'ForgotPasswordSentEmail.tsx', name: 'ForgotPasswordSentEmail', title: 'Email Sent' },
  { file: 'OrderSuccessful.tsx', name: 'OrderSuccessful', title: 'Order Successful' },
  { file: 'Wishlist.tsx', name: 'Wishlist', title: 'My Wishlist' },
  { file: 'WishlistEmpty.tsx', name: 'WishlistEmpty', title: 'Wishlist' },
];

const template = (name, title) => `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { components } from '@/components';
import { constants } from '@/constants';

export const ${name}: React.FC = () => {
  const { navigate } = hooks.useRouter();

  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>${title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.subtitle}>This screen is being migrated to React Native.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigate(constants.routes.HOME)}>
          <Text style={styles.btnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  comingSoon: { fontSize: 22, fontWeight: '700', color: '#0F5B35', marginBottom: 10, fontFamily: 'Outfit' },
  subtitle: { fontSize: 14, color: '#7E8B97', marginBottom: 24, textAlign: 'center', fontFamily: 'Outfit' },
  btn: { backgroundColor: '#0F5B35', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', fontFamily: 'Outfit' },
});
`;

let created = 0;
for (const screen of stubScreens) {
  const filePath = path.join(screensDir, screen.file);
  fs.writeFileSync(filePath, template(screen.name, screen.title));
  created++;
}

console.log(`Created ${created} stub screens`);
