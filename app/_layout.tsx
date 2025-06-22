import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Import Archivo fonts
import {
  useFonts,
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo'; // Changed to Archivo import

import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';

// Initialize splash screen configuration before any React rendering
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {
    /* ignore errors */
  });
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    // Load Archivo fonts
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

  // Return null to prevent rendering until fonts are ready
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <DataProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="equipment/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Equipment Details',
              headerBackTitle: 'Back',
              headerTintColor: '#4D7C0F',
              headerStyle: { backgroundColor: '#F5F5F5' },
              headerTitleStyle: { fontFamily: 'Archivo-SemiBold' }, // Changed to Archivo-SemiBold
            }}
          />
          <Stack.Screen
            name="booking/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Request Booking',
              headerBackTitle: 'Back',
              headerTintColor: '#4D7C0F',
              headerStyle: { backgroundColor: '#F5F5F5' },
              headerTitleStyle: { fontFamily: 'Archivo-SemiBold' }, // Changed to Archivo-SemiBold
            }}
          />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </DataProvider>
    </AuthProvider>
  );
}
