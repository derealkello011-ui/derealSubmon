import "@/global.css";
import { Link } from "expo-router";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">

      <Text className="py-20 font-sans-bold text-6xl">
        Welcome to Nativewind!
      </Text>

      <Text className="font-bold text-6xl">
        Welcome to Nativewind!
      </Text>

      <Link href='/onboarding'
        className="bg-primary mt-4 p-4 rounded font-semibold text-white"
      >Go to onboarding</Link>

    </SafeAreaView>
  );
}