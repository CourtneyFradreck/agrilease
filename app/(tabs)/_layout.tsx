import { Tabs } from 'expo-router';
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';

const MAIN_COLOR = '#4D7C0F';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BORDER_RADIUS = 8;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MAIN_COLOR,
        tabBarInactiveTintColor: TEXT_SECONDARY_GREY,
        tabBarLabelStyle: {
          fontFamily: 'Archivo-Medium',
          fontSize: 11,
          paddingBottom: Platform.OS === 'ios' ? 0 : 2,
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: BORDER_GREY,
          height: Platform.OS === 'ios' ? 70 : 65,
          paddingVertical: 10,
          backgroundColor: CARD_BACKGROUND,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          elevation: 0,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        },
        headerStyle: {
          backgroundColor: BACKGROUND_LIGHT_GREY,
          borderBottomWidth: 0,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          fontFamily: 'Archivo-Bold',
          fontSize: 18,
          color: TEXT_PRIMARY_DARK,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Market',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="storefront-outline"
              color={color}
              size={24}
            />
          ),
          headerTitle: 'AgriLease Marketplace',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" color={color} size={24} />
          ),
          headerTitle: 'Explore Equipment',
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'List Item',
          tabBarIcon: ({ color }) => (
            <AntDesign name="pluscircleo" color={color} size={24} />
          ),
          headerTitle: 'List New Item',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="message-text-outline"
              color={color}
              size={24}
            />
          ),
          headerTitle: 'My Messages',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <Feather name="user" color={color} size={24} />
          ),
          headerTitle: 'My Account',
        }}
      />
    </Tabs>
  );
}
