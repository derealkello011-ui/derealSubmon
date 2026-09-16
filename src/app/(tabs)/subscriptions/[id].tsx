import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

const SubscriptionDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }> ();
  return (
    <View className='flex-1 justify-center items-center'>
          <Text className='justify-center items-start font-semibold text-xl'>SubscriptionDetails : {id}</Text>
          <Link href='/' >Go Home</Link>
    </View>
  )
}

export default SubscriptionDetails