import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrders } from '../context/OrderContext';

type RootStackParamList = { Notifications: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'> };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

export default function NotificationsScreen({ navigation }: Props) {
  const { notifications } = useOrders();
  const myNotifs = notifications.filter((n) => n.recipient === 'buyer');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {myNotifs.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet</Text>
        ) : (
          myNotifs.map((n) => (
            <View key={n.id} style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardText}>{n.text}</Text>
                <Text style={styles.cardTime}>{n.time}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  emptyText: { textAlign: 'center', color: COLORS.subtext, marginTop: 60 },
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTextWrap: { flex: 1 },
  cardText: { fontSize: 13, color: COLORS.text, marginBottom: 4, lineHeight: 18 },
  cardTime: { fontSize: 11, color: COLORS.subtext },
});