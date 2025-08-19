import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from '@expo-google-fonts/archivo';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  usePushNotifications();

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
        <Stack.Screen
         name="(auth)"
         options={{
          headerShown: false
         }} />
        <Stack.Screen
         name="(tabs)"
         options={{ headerShown: false
          }} />
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
          headerShown: false
           }} />
        <Stack.Screen
         name="messages/[id]"
          options={{ 
          headerShown: false 
          }} />
        <Stack.Screen
          name="booking/requests"
          options={{
            headerShown: false
          }} />
        <Stack.Screen
         name="profile/settings"
          options={{
            headerShown: false
          }} />
        <Stack.Screen
         name="notifications"
         options={{
           headerShown: false
         }} />
        <Stack.Screen
         name="+not-found"
         options={{
           headerShown: false
         }} />
        <Stack.Screen
         name="profile/[id]"
          options={{
           headerShown: false
         }} />
        <Stack.Screen
         name="profile/edit"
         options={{
           headerShown: false
         }} />
        <Stack.Screen
         name="rentals/[id]"
         options={{
           headerShown: false
         }} />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
