import "@/global.css";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
 
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header" >
        <Text>Home</Text>
      </View>

    </SafeAreaView>
  );
}