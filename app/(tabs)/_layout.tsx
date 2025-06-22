import { Tabs } from 'expo-router';
import {
  Entypo,
  FontAwesome,
  AntDesign,
  Feather,
  Ionicons, // Ensure Ionicons is imported for the new tab icon
} from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4D7C0F', // Your main green color
        tabBarInactiveTintColor: '#6B7280', // Consistent inactive grey
        tabBarLabelStyle: {
          fontFamily: 'Archivo-Medium', // Changed to Archivo-Medium
          fontSize: 12,
          paddingBottom: 2, // Slight adjustment for spacing
        },
        tabBarStyle: {
          borderTopWidth: 0, // Removed default border
          height: 75, // Increased height for a more substantial look
          paddingVertical: 10, // Explicit vertical padding
          backgroundColor: '#FFFFFF', // Clean white background for the tab bar
          // Enhanced subtle shadow for an elevated effect
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 }, // More pronounced shadow from top
          shadowOpacity: 0.1, // Increased opacity for visibility
          shadowRadius: 8, // Increased radius for softer shadow
          elevation: 8, // Android shadow matching iOS
          borderTopLeftRadius: 20, // Rounded top corners
          borderTopRightRadius: 20, // Rounded top corners
          position: 'absolute', // Ensures shadow is visible on top of content
          left: 0,
          right: 0,
          bottom: 0, // Pin to bottom
        },
        headerStyle: {
          backgroundColor: '#F9FAFB', // Consistent with your app's main background color
          borderBottomWidth: 0, // Remove any header border if present
          shadowOpacity: 0, // Remove header shadow on iOS
          elevation: 0, // Remove header shadow on Android
        },
        headerTitleStyle: {
          fontFamily: 'Archivo-Bold', // Changed to Archivo-Bold
          fontSize: 18,
          color: '#1F2937', // Darker text for consistency with your app's primary text
        },
      }}
    >
      <Tabs.Screen
        name="index" // Corresponds to Dashboard.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
          headerTitle: 'AgriLease Dashboard',
          headerShown: false, // Keep this false as your Dashboard handles its own header
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
          headerTitle: 'Discover Equipment',
          headerShown: false, // Discover screen also has its own custom header
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add Listing',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="pluscircle" color={color} size={size} />
          ),
          headerTitle: 'Add New Listing',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" color={color} size={size} />
          ),
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
