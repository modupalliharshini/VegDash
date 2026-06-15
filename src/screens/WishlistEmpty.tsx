import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { hooks } from '@/hooks';
import { constants } from '@/constants';
import { components } from '@/components';

export const WishlistEmpty: React.FC = () => {
  const { navigate } = hooks.useRouter();

  return (
    <components.SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Text style={{ fontSize: 18, color: '#1E2022' }}>🗙</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Save your favorite vegetarian meals here so you can easily order them later.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigate(constants.routes.SHOP)}
        >
          <Text style={styles.btnText}>Browse Dishes</Text>
        </TouchableOpacity>
      </View>

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F5' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E2022', fontFamily: 'Outfit' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1E2022', marginBottom: 8, fontFamily: 'Outfit' },
  emptySubtitle: { fontSize: 14, color: '#7E8B97', marginBottom: 24, textAlign: 'center', fontFamily: 'Outfit', lineHeight: 20 },
  btn: { backgroundColor: '#0F5B35', borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', fontFamily: 'Outfit' },
});
