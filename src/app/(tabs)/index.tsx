import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, HOME_USER, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import dayjs from 'dayjs';
import { useState } from 'react';
import { FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "../../../lib/utils";

export default function App() {
  const [ expandedSubId, setExpandedSubId ] = useState<string | null>( null );
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
        <FlatList
          ListHeaderComponent={() => (
            <>
              <View className="home-header" >
                <View className="home-user" >
                  <Image source={images.avatar} className="home-avatar" />
                  <Text className="home-user-name"> { HOME_USER.name }</Text>
                </View>
                <Image source={icons.ai} className="home-add-icon" />
              </View>

              <View className="home-balance-card">
                <Text className="home-balance-label">Balance</Text>

                <View className="home-balance-row">
                  <Text className="home-balance-amount">
                    {formatCurrency( HOME_BALANCE.amount, "GHS" )}
                  </Text>
                  <Text className="home-balance-date">
                    {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                  </Text>
                </View>
              </View>

              <View className='mb-5'>
              <ListHeading title="Upcoming" />
              <FlatList
                  data={UPCOMING_SUBSCRIPTIONS}
                  renderItem={( { item } ) => (<UpcomingSubscriptionCard {...item} />)}
                  keyExtractor={( item ) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListEmptyComponent={<Text className="home-empty-state">No Upcoming renewal yet.</Text>}
              />
              </View>

              <ListHeading title="All Subscriptions" />
            </>
          )}
          keyExtractor={(item) => item.id}
          data={HOME_SUBSCRIPTIONS}
          renderItem={( { item } ) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubId === item.id}
              onPress={() => setExpandedSubId( ( currentId ) => (
              currentId=== item.id ? null : item.id
            ))} />
          )}
          extraData={expandedSubId}
          ItemSeparatorComponent={() => <View className='h-4' />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text className='home-empty-state'>No Subscriptions yet.</Text>}
          contentContainerClassName='pb-30 '
        />

    </SafeAreaView>
  );
}