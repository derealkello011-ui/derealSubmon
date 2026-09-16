
import { colors, components } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabBar = components.tabBar;

const TabsLayout = () => {
    const insets = useSafeAreaInsets();
  return (
      <Tabs screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
              position: 'absolute',
              bottom: Math.max( insets.bottom, tabBar.horizontalInset ),
              height: tabBar.height,
              marginHorizontal: tabBar.horizontalInset,
              borderRadius: tabBar.radius,
              backgroundColor: colors.foreground,
              borderTopColor: colors.border,
              borderTopWidth: 0,
              elevation: 0,
              alignContent: 'center',
              alignSelf: 'center',
              alignItems: 'center'
          },
          tabBarItemStyle: {
              paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
          },
          tabBarIconStyle: {
              width: tabBar.iconFrame,
              height: tabBar.iconFrame,
              alignItems: 'center',
          },
          tabBarActiveBackgroundColor: colors.accent,
          tabBarActiveTintColor: colors.muted,
          
      }}>
          <Tabs.Screen name='index' options={{
              title: "Home",
              tabBarIcon: ({color, size}) => <Ionicons color={color} size={size} name='home' />
        }} />
          <Tabs.Screen name='insights' options={{
              title: "Insights",
              tabBarIcon: ({color, size}) => <Ionicons color={color} size={size} name='infinite-sharp' />

          }} />
          <Tabs.Screen name='subscribe' options={{
              title: "Subscribe",
              tabBarIcon: ({color, size}) => <Ionicons color={color} size={size} name='subway' />
          }} />
          <Tabs.Screen name='settings' options={{
              title: "Settings",
              tabBarIcon: ({color, size}) => <Ionicons color={color} size={size} name='settings' />
            }} />
          <Tabs.Screen name='subscriptions/[id]' options={{
              href: null
            }} />
    </Tabs>
  )
}

export default TabsLayout