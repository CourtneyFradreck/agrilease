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

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function RootLayout() {
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
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
