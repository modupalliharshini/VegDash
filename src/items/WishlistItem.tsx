import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';

// Updated styles using theme colors and boxShadow (web) / elevation (native)
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
    backgroundColor: theme.colors.pureWhite,
    elevation: 3,
    // boxShadow for web compatibility (rgba with 25% opacity)
    boxShadow: `0px 0px 25px ${theme.colors.sageGreen}40`,
  },
  name: {
    fontSize: 14,
    color: theme.colors.primaryText,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'capitalize',
    flex: 1,
    fontFamily: 'Outfit',
  },
  ratingText: {
    fontSize: 12,
    color: theme.colors.secondaryText,
  },
  ingredients: {
    fontSize: 12,
    color: theme.colors.secondaryText,
    marginTop: 4,
  },
});

export const WishlistItem: React.FC<{ item: any; isInWishlist: boolean; toggleWishlist: () => void }> = ({ item, isInWishlist, toggleWishlist }) => (
  <TouchableOpacity style={styles.container} onPress={toggleWishlist}>
    <Text style={styles.name}>{item.name}</Text>
    {/* Additional UI (rating, ingredients) can be added here */}
  </TouchableOpacity>
);
