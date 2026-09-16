import { StatusBar, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const signInScreen = () => {
  return (
    <SafeAreaView>
      <Text>signIn Screen</Text>
      <StatusBar />
    </SafeAreaView>
  )
}

export default signInScreen