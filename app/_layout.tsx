import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

import {
  useFonts,
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';

import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // For Android
    shouldShowList: true, // For iOS
  }),
});

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received while foregrounded:', notification);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data.chatId) {
          router.push(`/messages/${data.chatId}`);
        } else if (data.bookingId) {
          router.push(`/booking/${data.bookingId}`);
        }
      }
    );

    return () => subscription.remove();
  }, [router]);

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Archivo-Regular': Archivo_400Regular,
    'Archivo-Medium': Archivo_500Medium,
    'Archivo-SemiBold': Archivo_600SemiBold,
    'Archivo-Bold': Archivo_700Bold,
  });

  useEffect(() => {
    const hideSplash = async () => {
      try {
        if (Platform.OS !== 'web' && (fontsLoaded || fontError)) {
          await SplashScreen.hideAsync();
        }
      } catch (e) {
        // Ignore errors
      }
    };

    hideSplash();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="listings/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="booking/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="messages/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="rentals/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}

