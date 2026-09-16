import { useFonts } from 'expo-font';
import { Stack } from "expo-router";

export default function RootLayout() {
  const [ fontsLoaded ] = useFonts( {
      
  } );
  return <Stack screenOptions={{
    headerShown: false,
    contentStyle: {backgroundColor: '#ffffff'}
  }}/>;
}


