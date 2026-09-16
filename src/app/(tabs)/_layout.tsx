import { colors, components } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabBar = components.tabBar;

const TabIcon = ({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: ColorValue;
}) => (
  <View
    style={{
        width: 55,
        height: 55,
        borderRadius: 22,
        backgroundColor: focused ? colors.accent : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        top: 15,
    }}
  >
    <Ionicons name={name} size={22} color={focused ? '#FFFFFF' : color} />
  </View>
);

const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
            position: 'absolute',
            bottom: Math.max(insets.bottom, tabBar.horizontalInset),
            height: tabBar.height,
            marginHorizontal: tabBar.horizontalInset,
            borderRadius: tabBar.radius,
            backgroundColor: colors.foreground,
            borderTopWidth: 0,
            elevation: 0,
            },
            tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            },
            tabBarInactiveTintColor: colors.muted,
            animation: 'shift',
        
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="infinite-sharp" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscribe"
        options={{
          title: 'Subscribe',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'subway' : 'subway-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;