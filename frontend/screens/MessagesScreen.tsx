import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type TabParamList = { Messages: undefined };
type RootStackParamList = { ChatDetail: { name: string; lastMessage: string } };
type Props = { navigation: CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Messages'>, NativeStackNavigationProp<RootStackParamList>>; };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB', green: '#16A34A' };

type Conversation = { id: string; name: string; lastMessage: string; time: string; unread: boolean; itemContext: string };

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'Ama Boateng', lastMessage: 'Sure, I can have it ready by 3pm today!', time: '5m ago', unread: true, itemContext: 'MacBook Pro 14"' },
  { id: '2', name: 'Kojo Asante', lastMessage: 'Is the textbook still available?', time: '1h ago', unread: true, itemContext: 'Calculus Textbook' },
  { id: '3', name: 'Sophie Mensah', lastMessage: 'Thanks for the quick delivery 🙏', time: 'Yesterday', unread: false, itemContext: 'Vintage Guitar' },
  { id: '4', name: 'Rider - Kwame', lastMessage: 'I am 5 minutes away from your hostel', time: 'Yesterday', unread: false, itemContext: 'Delivery Update' },
];

export default function MessagesScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ChatDetail', { name: item.name, lastMessage: item.lastMessage })}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={COLORS.subtext} />
            </View>
            <View style={styles.rowInfo}>
              <View style={styles.rowTopLine}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowTime}>{item.time}</Text>
              </View>
              <Text style={styles.rowContext}>Re: {item.itemContext}</Text>
              <Text style={[styles.rowMessage, item.unread && styles.rowMessageUnread]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 16 },
  listContent: { paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowInfo: { flex: 1 },
  rowTopLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  rowName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  rowTime: { fontSize: 11, color: COLORS.subtext },
  rowContext: { fontSize: 11, color: COLORS.primary, marginBottom: 2 },
  rowMessage: { fontSize: 12, color: COLORS.subtext },
  rowMessageUnread: { color: COLORS.text, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 8 },
});