import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';

export default function RootLayout() {
  const [ fontsLoaded ] = useFonts( {
    'sans-regular': require( '@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Regular.ttf' ),
    'sans-bold': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require( '@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Light.ttf' ),
    'sans-italic' : require('@/assets/fonts/Plus_Jakarta_Sans/static/PlusJakartaSans-Italic.ttf')
  } );
  
  useEffect( () => { 
    if ( fontsLoaded ) {
      SplashScreen.hideAsync();
    }
  }, [ fontsLoaded ] );
  
  if ( !fontsLoaded ) return null;

  return <Stack screenOptions={{
    headerShown: false,
    contentStyle: {backgroundColor: '#ffffff'}
  }}/>;
}


