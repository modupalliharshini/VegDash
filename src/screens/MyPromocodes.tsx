import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';
import { theme } from '@/theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Icons for benefits
const ClocheIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <Path d="M2 22h20M5 22a7 7 0 0 1 14 0" />
    <Circle cx={12} cy={4} r={2} />
  </Svg>
);

const GiftIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <Rect x={3} y={8} width={18} height={12} rx={2} />
    <Path d="M12 8V3M12 3a3 3 0 0 0-3 3M12 3a3 3 0 0 1 3 3" />
    <Line x1={3} y1={12} x2={21} y2={12} stroke={color} strokeWidth={2.2} />
  </Svg>
);

const Line = ({ x1, y1, x2, y2, stroke, strokeWidth }: any) => (
  <Path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={stroke} strokeWidth={strokeWidth} />
);

const PercentIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <Line x1={19} y1={5} x2={5} y2={19} stroke={color} strokeWidth={2.2} />
    <Circle cx={6.5} cy={6.5} r={2.5} />
    <Circle cx={17.5} cy={17.5} r={2.5} />
  </Svg>
);

const CakeIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <Path d="M18 20H6v-6h12v6zM12 14v-4M8 10h8M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
  </Svg>
);

const TicketIcon = ({ color }: { color: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2}>
    <Path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
  </Svg>
);

export const MyPromocodes: React.FC = () => {
  const { navigate } = hooks.useRouter();

  const benefits = [
    { name: 'Priority\nDelivery', icon: <ClocheIcon color={theme.colors.gold} /> },
    { name: 'Exclusive\nKitchens', icon: <GiftIcon color={theme.colors.gold} /> },
    { name: 'Member\nOffers', icon: <PercentIcon color={theme.colors.gold} /> },
    { name: 'Free Dessert\nFridays', icon: <CakeIcon color={theme.colors.gold} /> },
    { name: 'Monthly\nSurprises', icon: <GiftIcon color={theme.colors.gold} /> },
  ];

  return (
    <components.SafeAreaView style={styles.container}>
      {/* Title Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>VegDash Privileges</Text>
          <Text style={styles.headerSubtitle}>More than delivery, it's a lifestyle.</Text>
        </View>
        <TouchableOpacity style={styles.crownContainer}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill={theme.colors.gold} stroke={theme.colors.gold} strokeWidth={1}>
            <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
            <Path d="M3 20h18" stroke={theme.colors.gold} strokeWidth={2} />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* VEGDASH GOLD MEMBER Card */}
        <View style={styles.goldMemberCard}>
          <View style={styles.cardLeft}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill={theme.colors.gold}>
                <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
              </Svg>
              <Text style={styles.cardGoldTitle}>VEGDASH GOLD MEMBER</Text>
            </View>
            <Text style={styles.cardMemberSince}>Member since June 2026</Text>
            
            <TouchableOpacity style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>★  3200 Points  ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardRight}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=250' }}
              style={styles.cardFoodImage}
            />
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Benefits</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllBtn}>View All Benefits ›</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.benefitsScrollContainer}>
          {benefits.map((benefit, idx) => (
            <View key={idx} style={styles.benefitItem}>
              <View style={styles.benefitIconCircle}>
                {benefit.icon}
              </View>
              <Text style={styles.benefitText}>{benefit.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Free Dessert Fridays Promo Highlight */}
        <TouchableOpacity style={styles.dessertPromoCard} activeOpacity={0.9}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=250' }}
            style={styles.dessertImg}
          />
          <View style={styles.dessertContent}>
            <Text style={styles.dessertLabel}>MEMBER EXCLUSIVE</Text>
            <Text style={styles.dessertTitle}>Free Dessert Fridays</Text>
            <Text style={styles.dessertDesc}>A sweet treat, on us.</Text>
            
            <View style={styles.lovedRow}>
              <View style={styles.avatarOverlap}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80' }} style={styles.avatar} />
                <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80' }} style={[styles.avatar, { marginLeft: -8 }]} />
                <Image source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=80' }} style={[styles.avatar, { marginLeft: -8 }]} />
              </View>
              <Text style={styles.lovedText}>Loved by 2K+ members</Text>
            </View>
          </View>
          <View style={styles.dessertChevron}>
            <Text style={{ fontSize: 16, color: '#A7B8A3', fontWeight: '700' }}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Flat 99 Promo Banner */}
        <View style={styles.flat99Card}>
          <View style={styles.flat99IconBg}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.success} strokeWidth={2.2}>
              <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <Line x1={3} y1={6} x2={21} y2={6} stroke={theme.colors.success} strokeWidth={2.2} />
              <Path d="M16 10a4 4 0 0 1-8 0" />
            </Svg>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.flat99Sub}>Premium Delivery Experience</Text>
            <Text style={styles.flat99Title}>Always at Flat ₹99</Text>
            <Text style={styles.flat99Details}>No minimum order  •  Thermal packaging{"\nTrained partners  •  On-time delivery"}</Text>
          </View>
          <TouchableOpacity style={styles.flat99Btn}>
            <Text style={styles.flat99BtnText}>Know More</Text>
          </TouchableOpacity>
        </View>

        {/* Points & Rewards Summary */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginTop: 24, marginBottom: 16 }]}>Your Points & Rewards</Text>
        
        <View style={styles.rewardsRow}>
          <View style={styles.rewardCard}>
            <View style={[styles.rewardIconCircle, { backgroundColor: 'rgba(11, 77, 58, 0.1)' }]}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill={theme.colors.primaryGreen} stroke={theme.colors.primaryGreen}>
                <Polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2" />
              </Svg>
            </View>
            <Text style={styles.rewardNumber}>3200</Text>
            <Text style={styles.rewardLabel}>Available Points</Text>
          </View>

          <View style={styles.rewardCard}>
            <View style={[styles.rewardIconCircle, { backgroundColor: 'rgba(199, 169, 107, 0.15)' }]}>
              <GiftIcon color={theme.colors.gold} />
            </View>
            <Text style={styles.rewardNumber}>2</Text>
            <Text style={styles.rewardLabel}>Rewards Unlocked</Text>
          </View>

          <View style={styles.rewardCard}>
            <View style={[styles.rewardIconCircle, { backgroundColor: 'rgba(11, 77, 58, 0.1)' }]}>
              <TicketIcon color={theme.colors.primaryGreen} />
            </View>
            <Text style={styles.rewardNumber}>5</Text>
            <Text style={styles.rewardLabel}>Offers Available</Text>
          </View>
        </View>

        {/* View All Rewards Button */}
        <TouchableOpacity style={styles.viewRewardsOutlineBtn}>
          <Text style={styles.viewRewardsOutlineText}>View All Rewards  ›</Text>
        </TouchableOpacity>

      </ScrollView>

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.warmWhite,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.primaryGreen,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  crownContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0A3B2E10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 16,
  },
  
  // Gold membership card
  goldMemberCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    backgroundColor: '#0A3B2E', // Solid deep green base for background color fallback
    // In React Native Web / Mobile style background linear-gradient or custom SVG
    background: 'linear-gradient(90deg, #0A3B2E 0%, #0B4D3A 50%, #0F6A4D 100%)' as any,
    overflow: 'hidden',
    shadowColor: '#0A3B2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'center',
  },
  cardGoldTitle: {
    color: theme.colors.gold,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  cardMemberSince: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    marginTop: 6,
    fontFamily: 'Inter',
  },
  pointsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 18,
  },
  pointsBadgeText: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  cardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  cardFoodImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(199, 169, 107, 0.4)',
  },

  // Benefits
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'web' ? 'Playfair Display' : 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primaryText,
  },
  viewAllBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.gold,
    fontFamily: 'Inter',
  },
  benefitsScrollContainer: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 16,
  },
  benefitItem: {
    width: 80,
    alignItems: 'center',
  },
  benefitIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: theme.colors.warmWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  benefitText: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontFamily: 'Inter',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 13,
  },

  // Dessert promo
  dessertPromoCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  dessertImg: {
    width: 85,
    height: 85,
    borderRadius: 12,
  },
  dessertContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  dessertLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.gold,
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  dessertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryText,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  dessertDesc: {
    fontSize: 11,
    color: theme.colors.secondaryText,
    fontFamily: 'Inter',
    marginTop: 1,
  },
  lovedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  avatarOverlap: {
    flexDirection: 'row',
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  lovedText: {
    fontSize: 9,
    color: theme.colors.lightText,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  dessertChevron: {
    paddingHorizontal: 4,
  },

  // Flat 99 card
  flat99Card: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: theme.colors.warmWhite,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flat99IconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  flat99Sub: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.gold,
    letterSpacing: 0.5,
    fontFamily: 'Inter',
  },
  flat99Title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryText,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  flat99Details: {
    fontSize: 10,
    color: theme.colors.secondaryText,
    fontFamily: 'Inter',
    marginTop: 4,
    lineHeight: 14,
  },
  flat99Btn: {
    backgroundColor: theme.colors.primaryGreen,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  flat99BtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Inter',
  },

  // Rewards row
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 10,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 18,
    alignItems: 'center',
  },
  rewardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primaryText,
    fontFamily: 'Inter',
  },
  rewardLabel: {
    fontSize: 9,
    color: theme.colors.lightText,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Inter',
  },
  viewRewardsOutlineBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewRewardsOutlineText: {
    color: theme.colors.primaryText,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
} as any);
