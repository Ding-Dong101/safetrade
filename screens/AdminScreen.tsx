import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Admin: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Admin'> };

const COLORS = { bg: '#F7F9FC', card: '#FFFFFF', primary: '#3B82F6', primarySoft: '#EFF6FF', green: '#10B981', greenSoft: '#ECFDF5', amber: '#F59E0B', amberSoft: '#FFFBEB', text: '#1F2937', subtext: '#6B7280', border: '#E5E7EB' };

const ALL_TRADES = [
  { id: '1', item: 'MacBook Pro 14"', buyer: 'martin_o', seller: 'ama_b', status: 'Funded', amount: 1850 },
  { id: '2', item: 'Vintage Guitar', buyer: 'kojo_a', seller: 'seller_sophie', status: 'In Transit', amount: 4200 },
  { id: '3', item: 'Domain Sale', buyer: 'martin_o', seller: 'ama_b', status: 'Released', amount: 12000 },
];

export default function AdminScreen({ navigation }: Props) {
  const totalUsers = 124;
  const totalTrades = ALL_TRADES.length;
  const totalVolume = ALL_TRADES.reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard 🛠️</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statNumber}>{totalUsers}</Text><Text style={styles.statLabel}>👥 Users</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>{totalTrades}</Text><Text style={styles.statLabel}>📦 Trades</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>GHS {totalVolume.toLocaleString()}</Text><Text style={styles.statLabel}>💰 Volume</Text></View>
        </View>

        <Text style={styles.sectionTitle}>All Transactions</Text>
        {ALL_TRADES.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.cardItem}>{t.item}</Text>
            <Text style={styles.cardSub}>{t.buyer} → {t.seller}</Text>
            <View style={styles.cardBottomRow}>
              <Text style={styles.cardAmount}>GHS {t.amount.toLocaleString()}</Text>
              <Text style={styles.cardStatus}>{t.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 6 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  statBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.border },
  statNumber: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.subtext, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  cardItem: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardSub: { fontSize: 12, color: COLORS.subtext, marginBottom: 8 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardAmount: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardStatus: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});