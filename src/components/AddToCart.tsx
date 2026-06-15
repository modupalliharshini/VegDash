import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { stores } from '@/stores';
import { DishType } from '@/types';
import { constants } from '@/constants';
import { hooks } from '@/hooks';

type Props = { dish: DishType; vertical?: boolean };

export const AddToCart: React.FC<Props> = ({ dish, vertical }) => {
  const { navigate } = hooks.useRouter();
  const { showToast } = stores.useToastStore();
  const { addToCart, removeFromCart, list: cart } = stores.useCartStore();
  const inCart = cart.find((item) => item.id === dish?.id);

  if (inCart) {
    return (
      <View style={vertical ? styles.column : styles.row}>
        <View style={[styles.qtyContainer, vertical && styles.qtyContainerVertical]}>
          <TouchableOpacity onPress={() => removeFromCart(dish)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyText}>{inCart.quantity}</Text>
          <TouchableOpacity onPress={() => addToCart(dish)} style={styles.qtyBtn}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.goBtn, vertical && styles.goBtnVertical]}
          onPress={() => navigate(constants.routes.ORDER)}
        >
          <Text style={styles.goBtnText} numberOfLines={1}>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={() => {
        addToCart(dish);
        showToast(`${dish.name} added to cart`);
      }}
    >
      <Text style={styles.btnText}>Add to Cart</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { backgroundColor: '#E8F9F1', height: 32, borderRadius: 8, width: '100%', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 12, color: constants.colors.SEA_GREEN_COLOR, fontWeight: '700', fontFamily: 'Outfit' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 },
  column: { flexDirection: 'column', alignItems: 'center', width: '100%', gap: 4 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F8', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', flex: 1.1, justifyContent: 'space-between', paddingHorizontal: 6, height: 32 },
  qtyContainerVertical: { width: '100%', flex: 0 },
  qtyBtn: { padding: 4 },
  qtyBtnText: { fontSize: 14, fontWeight: 'bold', color: '#0F5B35' },
  qtyText: { fontSize: 12, fontWeight: '700', color: '#0F5B35', fontFamily: 'Outfit' },
  goBtn: { backgroundColor: '#0F5B35', borderRadius: 8, height: 32, flex: 1.3, alignItems: 'center', justifyContent: 'center' },
  goBtnVertical: { width: '100%', flex: 0, height: 26, borderRadius: 6 },
  goBtnText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700', fontFamily: 'Outfit' },
});
