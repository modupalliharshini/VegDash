import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Path, Circle, Ellipse } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import logoImage from '../assets/images/logo.png';

const { width } = Dimensions.get('window');

export const Onboarding: React.FC = () => {
  const { navigate } = hooks.useRouter();

  return (
    <components.SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image source={logoImage} style={styles.logo} resizeMode="contain" />
        <Text style={styles.taglineSubText}>100% VEG. 100% GOOD.</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Svg width={width} height={230} viewBox="0 0 320 230" fill="none">
          {/* Skyline */}
          <Rect x={24} y={90} width={16} height={60} fill="#E2ECE7" />
          <Rect x={44} y={70} width={22} height={80} fill="#E8EFEA" />
          <Rect x={70} y={100} width={14} height={50} fill="#E2ECE7" />
          <Rect x={234} y={80} width={20} height={70} fill="#E8EFEA" />
          <Rect x={258} y={105} width={12} height={45} fill="#E2ECE7" />
          <Rect x={274} y={75} width={22} height={75} fill="#E8EFEA" />
          {/* Clouds */}
          <Path d="M50 50 C55 45, 65 45, 70 50 C75 48, 85 48, 88 53 C90 55, 90 60, 85 62 L50 62 Z" fill="#F0F4F2" opacity="0.85" />
          <Path d="M240 40 C245 35, 255 35, 260 40 C265 38, 275 38, 278 43 C280 45, 280 50, 275 52 L240 52 Z" fill="#F0F4F2" opacity="0.85" />
          {/* Green hill matching bottom color #0F5B35 */}
          <Path d="M-10 150 Q160 135 330 150 L330 230 L-10 230 Z" fill="#0F5B35" />
          {/* Scooter */}
          <Ellipse cx={160} cy={154} rx={55} ry={6} fill="rgba(0,0,0,0.15)" />
          <Circle cx={125} cy={138} r={15} fill="#1E2022" stroke="#FFFFFF" strokeWidth={2.5} />
          <Circle cx={125} cy={138} r={6} fill="#7E8B97" />
          <Circle cx={195} cy={138} r={15} fill="#1E2022" stroke="#FFFFFF" strokeWidth={2.5} />
          <Circle cx={195} cy={138} r={6} fill="#7E8B97" />
          <Path d="M125 134H195V126C195 118 187 114 179 114H141C133 114 125 118 125 126V134Z" fill="#0F5B35" />
          <Path d="M125 126C125 126 133 105 149 105H171C187 105 195 126 195 126H125Z" fill="#4CAF50" />
          {/* Delivery box */}
          <Rect x={110} y={90} width={32} height={32} rx={4} fill="#0F5B35" />
          <Path d="M126 98C123 100 123 103 126 106C129 104 131 104 129 100C127 98 126 98 126 98Z" fill="#8BC34A" />
          {/* Rider */}
          <Circle cx={160} cy={74} r={10} fill="#FFE082" />
          <Path d="M160 63C152 63 147 67 147 74H173C173 67 168 63 160 63Z" fill="#0F5B35" />
          <Path d="M148 84H172V110H148V84Z" fill="#0F5B35" />
        </Svg>
      </View>

      {/* Bottom card */}
      <View style={styles.detailsCard}>
        <View style={styles.taglineSection}>
          <Text style={styles.taglineText}>Good Food.</Text>
          <Text style={styles.taglineText}>Good Mood.</Text>
          <Text style={styles.taglineText}>Good Planet.</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigate(constants.routes.SIGN_IN)}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigate(constants.routes.SIGN_UP)}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logoSection: { alignItems: 'center', paddingTop: 40, paddingBottom: 15, backgroundColor: '#FFFFFF' },
  logo: { width: 320, height: 112 },
  taglineSubText: { fontFamily: 'Outfit', fontSize: 13, fontWeight: '900', color: '#0F5B35', marginTop: 4, letterSpacing: 0.6 },
  illustrationContainer: { height: 230, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  detailsCard: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: '#0F5B35',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -1,
  },
  taglineSection: { alignItems: 'center', marginTop: 10 },
  taglineText: { fontFamily: 'Outfit', fontSize: 24, fontWeight: '700', color: '#FFFFFF', lineHeight: 32 },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#083D21',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Outfit' },
  signupButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButtonText: { fontSize: 16, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
});
