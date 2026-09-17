import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider } from 'posthog-react-native';
import { useEffect } from 'react';

void SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '';

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in the environment');
}

if (!posthogApiKey) {
  throw new Error('Missing EXPO_PUBLIC_POSTHOG_API_KEY in the environment');
}

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={posthogApiKey}
      options={{ host: 'https://us.i.posthog.com' }}
    >
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <AppLoadingGate />
      </ClerkProvider>
    </PostHogProvider>
  );
}

function AppLoadingGate() {
  const [fontsLoaded, fontError] = useFonts({
    'sans-regular': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Light.ttf'),
    'sans-italic': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Italic.ttf'),
  });
  const { isLoaded: authLoaded } = useAuth({ treatPendingAsSignedOut: false });
  const fontsReady = fontsLoaded || fontError;

  useEffect(() => {
    if (fontsReady && authLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [authLoaded, fontsReady]);

  if (!fontsReady || !authLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
