import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { RiderHome: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, any> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#16A34A', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248' };

const HISTORY = [
  { id: '1', label: 'Delivery #ST123456', amount: 25, date: 'Today, 2:30 PM' },
  { id: '2', label: 'Delivery #ST123451', amount: 30, date: 'Today, 11:15 AM' },
  { id: '3', label: 'Delivery #ST123448', amount: 25, date: 'Yesterday, 4:50 PM' },
];

export default function RiderWalletScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>GHS 150.00</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>25</Text>
              <Text style={styles.statLabel}>Completed Deliveries</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>4.8 ⭐</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Earnings History</Text>
        {HISTORY.map((h) => (
          <View key={h.id} style={styles.historyRow}>
            <View style={styles.historyIcon}>
              <Ionicons name="cash-outline" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.historyTextWrap}>
              <Text style={styles.historyLabel}>{h.label}</Text>
              <Text style={styles.historyDate}>{h.date}</Text>
            </View>
            <Text style={styles.historyAmount}>+GHS {h.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginLeft: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  balanceCard: { backgroundColor: COLORS.surface, borderRadius: 18, padding: 20, marginVertical: 16, borderWidth: 1, borderColor: COLORS.border },
  balanceLabel: { fontSize: 12, color: COLORS.subtext, marginBottom: 6 },
  balanceAmount: { fontSize: 30, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statBox: { marginRight: 28 },
  statNumber: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  withdrawButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  withdrawButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  historyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  historyTextWrap: { flex: 1 },
  historyLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  historyDate: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
});