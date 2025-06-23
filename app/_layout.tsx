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
import { DataProvider } from '@/context/DataContext';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function RootLayout() {
  useFrameworkReady();

  const [splashComplete, setSplashComplete] = useState(false);
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
      <DataProvider>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="equipment/[id]"
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
              headerTitle: 'Request Booking',
              headerTintColor: '#1F2937',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTitleStyle: {
                fontFamily: 'Archivo-SemiBold',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen
            name="messages/[id]"
            options={{
              headerShown: false,
              headerTitle: 'Messages',
              headerTintColor: '#1F2937',
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTitleStyle: {
                fontFamily: 'Archivo-SemiBold',
                fontSize: 18,
              },
            }}
          />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="dark" />
      </DataProvider>
    </AuthProvider>
  );
}
