import "@/global.css";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">

      <Text className="py-20 font-sans-bold text-7xl">
        Welcome to Nativewind!
      </Text>

      <Text className="font-bold text-7xl">
        Welcome to Nativewind!
      </Text>

    </SafeAreaView>
  );
}