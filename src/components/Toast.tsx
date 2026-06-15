import React, { useEffect, useRef } from 'react';
import { Text, Animated, TouchableOpacity } from 'react-native';
import { useToastStore } from '@/stores/useToastStore';

export const Toast: React.FC = () => {
  const { message, visible, type, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!message && !visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 60, // Safely below notches and status bars
        left: 20,
        right: 20,
        backgroundColor: '#1E293B', // Sleek slate grey for high contrast
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 99999,
        elevation: 99999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        transform: [{ translateY }],
      }}
    >
      <Text style={{ fontSize: 16, marginRight: 8 }}>
        {type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✅'}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#FFFFFF',
          fontWeight: '700',
          fontFamily: 'Outfit',
          flex: 1,
        }}
      >
        {message}
      </Text>
      <TouchableOpacity onPress={hideToast} style={{ marginLeft: 10, padding: 4 }}>
        <Text style={{ fontSize: 14, color: '#94A3B8', fontWeight: 'bold' }}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
