import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import SplashScreen from '@/components/SplashScreen';

export default function RootLayout() {  
  useFrameworkReady();

  const [splashComplete, setSplashComplete] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded || !splashComplete) {
    return <SplashScreen onComplete={() => setSplashComplete(true)} />;
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