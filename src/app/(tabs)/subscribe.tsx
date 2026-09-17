import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import { HOME_SUBSCRIPTIONS } from '@/constants/data';
import '@/global.css';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SubscribeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return HOME_SUBSCRIPTIONS;
    }

    return HOME_SUBSCRIPTIONS.filter((subscription) =>
      [
        subscription.name,
        subscription.plan,
        subscription.category,
        subscription.status,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-background px-5">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubId === item.id}
            onPress={() =>
              setExpandedSubId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="pb-30"
        ListHeaderComponent={
          <View>
            <ListHeading title="Subscriptions" />
            <View className="mb-5 flex-row items-center rounded-2xl border border-border bg-card px-4">
              <Ionicons name="search-outline" size={22} color="#081126" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions"
                placeholderTextColor="rgba(0, 0, 0, 0.45)"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                className="ml-3 flex-1 py-4 text-base font-sans-medium text-primary"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  accessibilityLabel="Clear subscription search"
                  hitSlop={8}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close-circle" size={20} color="#081126" />
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text className="home-empty-state">
            No subscriptions match your search.
          </Text>
        }
        extraData={expandedSubId}
      />
    </SafeAreaView>
  );
};

export default SubscribeScreen;