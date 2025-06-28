import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons'; // Import FontAwesome5
import { StyleSheet, Platform, View } from 'react-native';

const MAIN_COLOR = '#4D7C0F';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BORDER_RADIUS = 8;
const LIGHT_GREEN_BACKGROUND = '#F0FDF4';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: MAIN_COLOR,
        tabBarInactiveTintColor: TEXT_SECONDARY_GREY,
        tabBarStyle: {
          borderTopWidth: 0, // Make it flat
          height: Platform.OS === 'ios' ? 70 : 65,
          paddingVertical: 10,
          paddingTop: 10,
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
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.activeTabIconContainer,
              ]}
            >
              <FontAwesome5
                name="store" // FontAwesome5 icon for store/marketplace
                color={focused ? MAIN_COLOR : color}
                size={22} // Slightly smaller size for FontAwesome5 for visual balance
                solid={focused} // Make it solid when active
              />
            </View>
          ),
          headerTitle: 'AgriLease Marketplace',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.activeTabIconContainer,
              ]}
            >
              <FontAwesome5
                name="compass" // FontAwesome5 icon for compass/explore
                color={focused ? MAIN_COLOR : color}
                size={22}
                solid={focused} // Make it solid when active
              />
            </View>
          ),
          headerTitle: 'Explore Equipment',
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          headerShown: false,
          title: 'List Item',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.activeTabIconContainer,
              ]}
            >
              <FontAwesome5
                name="plus-square" // FontAwesome5 icon for add/plus square
                color={focused ? MAIN_COLOR : color}
                size={22}
                solid={focused} // Make it solid when active
              />
            </View>
          ),
          headerTitle: 'List New Item',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.activeTabIconContainer,
              ]}
            >
              <FontAwesome5
                name="comment-alt" // FontAwesome5 icon for message
                color={focused ? MAIN_COLOR : color}
                size={22}
                solid={focused} // Make it solid when active
              />
            </View>
          ),
          headerTitle: 'My Messages',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconContainer,
                focused && styles.activeTabIconContainer,
              ]}
            >
              <FontAwesome5
                name="user-alt" // FontAwesome5 icon for user/account
                color={focused ? MAIN_COLOR : color}
                size={22}
                solid={focused} // Make it solid when active
              />
            </View>
          ),
          headerTitle: 'My Account',
          headerShown: false, // Ensure headers are hidden for a cleaner look
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 50, // Square width
    height: 50, // Square height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS, // Slightly rounded corners for the square
  },
  activeTabIconContainer: {
    backgroundColor: LIGHT_GREEN_BACKGROUND, // Fill color when active
  },
});
