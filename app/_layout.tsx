import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
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
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
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
          <Stack.Screen name="equipment/[id]" options={{ 
            headerShown: true, 
            headerTitle: 'Equipment Details',
            headerBackTitle: 'Back',
            headerTintColor: '#4D7C0F',
            headerStyle: { backgroundColor: '#F5F5F5' },
          }} />
          <Stack.Screen name="booking/[id]" options={{ 
            headerShown: true, 
            headerTitle: 'Request Booking',
            headerBackTitle: 'Back',
            headerTintColor: '#4D7C0F',
            headerStyle: { backgroundColor: '#F5F5F5' },
          }} />
          <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </DataProvider>
    </AuthProvider>
  );
}