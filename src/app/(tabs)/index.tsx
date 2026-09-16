import "@/global.css";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function App() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text className="font-bold text-blue-500 text-xl">
        Welcome to Nativewind!
      </Text>
    </SafeAreaView>
  );
}