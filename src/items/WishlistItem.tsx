import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {hooks} from '@/hooks';
import {stores} from '@/stores';
import {DishType} from '@/types';
import {constants} from '@/constants';
import {components} from '@/components';

type Props = {
  dish: DishType;
};

// Inline wishlist heart icon (replaces wishlist-add.svg?react import)
const WishlistHeartIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1.5}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const WishlistItem: React.FC<Props> = ({dish}) => {
  const {navigate} = hooks.useRouter();

  const {list: wishlist, removeFromWishlist} = stores.useWishlistStore();
  const isInWishlist = wishlist.some((item) => item.id === dish?.id);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          navigate(constants.routes.DISH, {state: {dishId: dish.id}});
        }}
      >
        <Image
          source={{ uri: dish.image }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {dish.name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              removeFromWishlist(dish);
            }}
          >
            <WishlistHeartIcon
              color={isInWishlist ? constants.colors.RED_COLOR : '#BDBDBD'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.ratingRow}>
          <components.Rating rating={3} />
          <Text style={styles.ratingText}>({dish.rating})</Text>
        </View>
        <Text
          style={styles.ingredients}
          numberOfLines={1}
        >
          {dish.ingredients?.join(', ') || 'No ingredients'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
    flexDirection: 'row',
    borderRadius: 10,
    padding: 6,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 20,
    width: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#D3D1D8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  details: {
    flexDirection: 'column',
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    color: '#1E2022',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'capitalize',
    flex: 1,
    fontFamily: 'Outfit',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#7E8B97',
  },
  ingredients: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
