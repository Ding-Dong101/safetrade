import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Login: undefined; Profile: undefined; Seller: undefined; Rider: undefined; Admin: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'> };

const COLORS = { bg: '#F7F9FC', card: '#FFFFFF', primary: '#3B82F6', primarySoft: '#EFF6FF', text: '#1F2937', subtext: '#6B7280', border: '#E5E7EB', red: '#EF4444', redSoft: '#FEF2F2' };

export default function ProfileScreen({ navigation }: Props) {
  const handleLogout = () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}><Text style={styles.avatarIcon}>😊</Text></View>
          <Text style={styles.name}>Martin Owusu</Text>
          <Text style={styles.detail}>🎓 UG5021423</Text>
          <Text style={styles.detail}>📧 martin.owusu@university.edu</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statNumber}>8</Text><Text style={styles.statLabel}>Listed</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>5</Text><Text style={styles.statLabel}>Completed</Text></View>
          <View style={styles.statBox}><Text style={styles.statNumber}>GHS 6,200</Text><Text style={styles.statLabel}>Earned</Text></View>
        </View>

        <Text style={styles.sectionLabel}>Switch View 🔄</Text>
        <TouchableOpacity style={styles.portalButton} onPress={() => navigation.navigate('Seller')}>
          <Text style={styles.portalEmoji}>🏪</Text>
          <Text style={styles.portalText}>Seller Portal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.portalButton} onPress={() => navigation.navigate('Rider')}>
          <Text style={styles.portalEmoji}>🚲</Text>
          <Text style={styles.portalText}>Rider Portal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.portalButton} onPress={() => navigation.navigate('Admin')}>
          <Text style={styles.portalEmoji}>🛠️</Text>
          <Text style={styles.portalText}>Admin MainTabs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 12 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarIcon: { fontSize: 40 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  detail: { fontSize: 13, color: COLORS.subtext },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.border },
  statNumber: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.subtext, textAlign: 'center' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  portalButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  portalEmoji: { fontSize: 22, marginRight: 12 },
  portalText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  editButton: { backgroundColor: COLORS.primarySoft, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 14, marginBottom: 10 },
  editButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },
  logoutButton: { backgroundColor: COLORS.redSoft, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  logoutButtonText: { color: COLORS.red, fontSize: 15, fontWeight: '700' },
});