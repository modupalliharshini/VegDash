import { theme } from '@/theme/theme';
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Svg, { Line, Polyline } from 'react-native-svg';
import { hooks } from '@/hooks';
import { stores } from '@/stores';
import { constants } from '@/constants';
import { components } from '@/components';
import { items } from '@/items';
import { DishType } from '@/types';

export const Wishlist: React.FC = () => {
  const { navigate } = hooks.useRouter();
  const { list: wishlist } = stores.useWishlistStore();

  if (wishlist.length === 0) {
    return (
      <components.SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
              <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContent}>
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
  }

  return (
    <components.SafeAreaView>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate(-1)} style={styles.backBtn}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={theme.colors.primaryText} strokeWidth={2.5}>
            <Line x1={19} y1={12} x2={5} y2={12} /><Polyline points="12 19 5 12 12 5" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Grid List of Items */}
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: DishType }) => (
          <View style={styles.itemWrapper}>
            <items.WishlistItem 
              item={item} 
              isInWishlist={true} 
              toggleWishlist={() => stores.useWishlistStore.getState().removeFromWishlist(item)} 
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <components.BottomTabBar />
    </components.SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.colors.warmWhite },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.primaryText, fontFamily: 'Outfit' },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.primaryText, marginBottom: 8, fontFamily: 'Outfit' },
  emptySubtitle: { fontSize: 14, color: theme.colors.lightText, marginBottom: 24, textAlign: 'center', fontFamily: 'Outfit', lineHeight: 20 },
  btn: { backgroundColor: theme.colors.primaryGreen, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 14 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', fontFamily: 'Outfit' },
  listContent: { padding: 20, gap: 16 },
  itemWrapper: { width: '100%' },
});
