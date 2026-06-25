import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, Alert, Platform, Animated } from 'react-native';

// Web polyfill for Alert.alert to make confirmation dialogs work on React Native Web
if (Platform.OS === 'web') {
  (Alert as any).alert = (title: string, message?: string, buttons?: any[]) => {
    if (buttons && buttons.length > 0) {
      const confirmMessage = message ? `${title}\n\n${message}` : title;
      const result = window.confirm(confirmMessage);
      if (result) {
        const positiveBtn = buttons.find(b => b.style !== 'cancel' && b.text !== 'No') || buttons[buttons.length - 1];
        if (positiveBtn && positiveBtn.onPress) {
          positiveBtn.onPress();
        }
      } else {
        const cancelBtn = buttons.find(b => b.style === 'cancel' || b.text === 'No');
        if (cancelBtn && cancelBtn.onPress) {
          cancelBtn.onPress();
        }
      }
    } else {
      window.alert(message ? `${title}: ${message}` : title);
    }
  };
}

import { screens } from '@/screens';
import { constants } from '@/constants';
import { components } from '@/components';
import { useAuthStore } from '@/stores/useAuthStore';

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator();

function AppLayout({ borderCol }: { borderCol: any }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#0A3B2E',
    }}>
      <Animated.View style={{ 
        flex: 1, 
        borderWidth: 8, 
        borderColor: borderCol, 
        borderRadius: Platform.OS === 'web' ? 0 : 38,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={constants.routes.HOME}
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
          >
            <Stack.Screen name={constants.routes.HOME} component={screens.Home} />
            <Stack.Screen name={constants.routes.ONBOARDING} component={screens.Onboarding} />
            <Stack.Screen name={constants.routes.SIGN_IN} component={screens.SignIn} />
            <Stack.Screen name={constants.routes.SIGN_UP} component={screens.SignUp} />
            <Stack.Screen name={constants.routes.SHOP} component={screens.Shop} />
            <Stack.Screen name={constants.routes.DISH} component={screens.Dish} />
            <Stack.Screen name={constants.routes.RESTAURANT_MENU} component={screens.RestaurantMenu} />
            <Stack.Screen name={constants.routes.ORDER} component={screens.Order} />
            <Stack.Screen name={constants.routes.CHECKOUT} component={screens.Checkout} />
            <Stack.Screen name={constants.routes.PROFILE} component={screens.Profile} />
            <Stack.Screen name={constants.routes.EDIT_PROFILE} component={screens.EditProfile} />
            <Stack.Screen name={constants.routes.ORDER_SUCCESSFUL} component={screens.OrderSuccessful} />
            <Stack.Screen name={constants.routes.ORDER_HISTORY} component={screens.OrderHistory} />
            <Stack.Screen name={constants.routes.MY_PROMOCODES} component={screens.MyPromocodes} />
            <Stack.Screen name={constants.routes.NOTIFICATIONS} component={screens.Notifications} />
            <Stack.Screen name={constants.routes.FAQ} component={screens.FAQ} />
            <Stack.Screen name={constants.routes.WISHLIST} component={screens.Wishlist} />
            <Stack.Screen name={constants.routes.WISHLIST_EMPTY} component={screens.WishlistEmpty} />
            <Stack.Screen name={constants.routes.ACCOUNT_CREATED} component={screens.AccountCreated} />
            <Stack.Screen name={constants.routes.FORGOT_PASSWORD} component={screens.ForgetPassword} />
            <Stack.Screen name={constants.routes.FORGOT_PASSWORD_SENT_EMAIL} component={screens.ForgotPasswordSentEmail} />
            <Stack.Screen name={constants.routes.CONFIRMATION_CODE} component={screens.ConfirmationCode} />
            <Stack.Screen name={constants.routes.NEW_PASSWORD} component={screens.NewPassword} />
            <Stack.Screen name={constants.routes.VERIFY_YOUR_PHONE_NUMBER} component={screens.VerifyYourPhoneNumber} />
          </Stack.Navigator>
          <components.BurgerContacts />
          <components.Toast />
        </NavigationContainer>
        <StatusBar style="dark" />
      </Animated.View>
    </View>
  );
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.55,
          duration: 1800,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [hydrated, pulseAnim]);

  const borderCol = pulseAnim.interpolate({
    inputRange: [0.55, 1],
    outputRange: ['rgba(199, 169, 107, 0.4)', 'rgba(199, 169, 107, 1)'],
  });

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#0F5B35" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppLayout borderCol={borderCol} />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
