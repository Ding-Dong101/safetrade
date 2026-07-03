import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { RiderHome: undefined; RiderLogin: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, any> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#16A34A', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248', red: '#F87171' };

export default function RiderProfileScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={COLORS.subtext} />
          </View>
          <Text style={styles.name}>Kwame Asante</Text>
          <Text style={styles.detail}>Rider ID: rider001</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>4.8 (52 reviews)</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statNumber}>25</Text><Text style={styles.statLabel}>Deliveries</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>98%</Text><Text style={styles.statLabel}>On-Time</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>3mo</Text><Text style={styles.statLabel}>Active</Text></View>
        </View>

        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="star-outline" size={18} color={COLORS.text} />
          <Text style={styles.menuText}>Ratings & Reviews</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="document-text-outline" size={18} color={COLORS.text} />
          <Text style={styles.menuText}>Delivery History</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow}>
          <Ionicons name="settings-outline" size={18} color={COLORS.text} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('RiderLogin')}>
          <Ionicons name="log-out-outline" size={16} color={COLORS.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginLeft: 10 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  profileHeader: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  detail: { fontSize: 12, color: COLORS.subtext, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: COLORS.text, marginLeft: 4, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 10, color: COLORS.subtext, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { flex: 1, fontSize: 13, color: COLORS.text, marginLeft: 12, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, paddingVertical: 13, borderRadius: 12, backgroundColor: 'rgba(248,113,113,0.1)' },
  logoutText: { color: COLORS.red, fontSize: 13, fontWeight: '700', marginLeft: 6 },
});