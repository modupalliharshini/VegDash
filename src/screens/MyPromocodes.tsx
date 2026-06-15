import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { PromocodeType } from '@/types';

export const MyPromocodes: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { data: promocodes, isLoading, isError } = hooks.useGetPromocodes();
  const { setPromoCode, setDiscount } = stores.useCartStore();
  const { showToast } = stores.useToastStore();

  const handleApplyPromo = (code: string, discount: number) => {
    setPromoCode(code);
    setDiscount(discount);
    showToast(`Code ${code} applied successfully!`);
    
    // Auto-redirect to Cart/Order page so user sees applied discount
    navigate(constants.routes.ORDER);
  };

  const renderPromoItem = ({ item }: { item: PromocodeType }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.logo }} style={styles.logo} />
        <View style={styles.details}>
          <Text style={styles.partnerName}>{item.name}</Text>
          <Text style={styles.promoDesc}>{item.discount}% discount on your order</Text>
          <Text style={styles.expiry}>Expires: {item.expiresAt}</Text>
          <View style={styles.codeRow}>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => handleApplyPromo(item.code, item.discount)}
            >
              <Text style={styles.applyText}>APPLY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#1E2022" strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers & Coupons</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main List */}
      {isLoading ? (
        <View style={styles.center}>
          <components.Loader />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <components.Error message="Failed to fetch offers. Please check connection." />
        </View>
      ) : !promocodes || promocodes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 40, marginBottom: 15 }}>🏷️</Text>
          <Text style={styles.emptyText}>No Active Coupons</Text>
          <Text style={styles.emptySub}>Check back later for exciting offers and discount coupons!</Text>
        </View>
      ) : (
        <FlatList
          data={promocodes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPromoItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#7E8B97', fontFamily: 'Outfit', textAlign: 'center', lineHeight: 18 },
  listContainer: { padding: 20, gap: 16 },
  card: { flexDirection: 'row', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 16 },
  logo: { width: 60, height: 60, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  details: { flex: 1, flexDirection: 'column' },
  partnerName: { fontSize: 16, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit', marginBottom: 3 },
  promoDesc: { fontSize: 13, color: '#0F5B35', fontWeight: '600', fontFamily: 'Outfit', marginBottom: 2 },
  expiry: { fontSize: 11, color: '#7E8B97', fontFamily: 'Outfit', marginBottom: 10 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  codeContainer: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#0F5B35', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(15,91,53,0.02)' },
  codeText: { fontSize: 12, fontWeight: '800', color: '#0F5B35', letterSpacing: 1, fontFamily: 'Outfit' },
  applyBtn: { backgroundColor: '#0F5B35', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  applyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', fontFamily: 'Outfit' },
});
