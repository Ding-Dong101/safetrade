import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Login: undefined; EditProfile: undefined; Settings: undefined; Privacy: undefined; Help: undefined; InviteFriends: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, any> };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', primarySoft: '#EFF6FF', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB', red: '#DC2626', redSoft: '#FEF2F2', amber: '#F59E0B' };

export default function AccountScreen({ navigation }: Props) {
  const [profile, setProfile] = useState({ fullName: 'Martin Owusu', studentId: '21116882', email: 'martindave55555@gmail.com' });

  const loadProfile = async () => {
    const raw = await AsyncStorage.getItem('safetrade_current_user');
    if (raw) {
      const user = JSON.parse(raw);
      setProfile({
        fullName: user.fullName || 'Martin Owusu',
        studentId: user.studentId || '21116882',
        email: user.email || 'martindave55555@gmail.com',
      });
    }
  };

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const handleLogout = () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] });

  const MENU_ITEMS: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }[] = [
    { icon: 'create-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'settings-outline', label: 'Settings', onPress: () => navigation.navigate('Settings') },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', onPress: () => navigation.navigate('Privacy') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => navigation.navigate('Help') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Account</Text>
          <TouchableOpacity style={styles.settingsIconButton} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={COLORS.subtext} />
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.fullName}</Text>
                <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} style={{ marginLeft: 5 }} />
              </View>
              <Text style={styles.detail}>Student ID: {profile.studentId}</Text>
              <Text style={styles.detail}>{profile.email}</Text>
            </View>
          </View>
          <View style={styles.profileStatsRow}>
            <View style={styles.profileStat}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.primary} />
              <Text style={styles.profileStatNumber}>23</Text>
              <Text style={styles.profileStatLabel}>Items Sold</Text>
            </View>
            <View style={styles.profileStat}>
              <Ionicons name="bag-handle-outline" size={14} color={COLORS.primary} />
              <Text style={styles.profileStatNumber}>11</Text>
              <Text style={styles.profileStatLabel}>Items Bought</Text>
            </View>
            <View style={styles.profileStat}>
              <Ionicons name="star" size={14} color={COLORS.amber} />
              <Text style={styles.profileStatNumber}>4.9</Text>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuRow} onPress={item.onPress}>
            <Ionicons name={item.icon} size={20} color={COLORS.text} />
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.subtext} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.inviteRow} onPress={() => navigation.navigate('InviteFriends')}>
          <Ionicons name="gift-outline" size={20} color={COLORS.text} />
          <Text style={styles.menuText}>Invite Friends</Text>
          <View style={styles.inviteBadge}>
            <Text style={styles.inviteBadgeText}>Earn GHS 10</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  scrollContent: { paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  settingsIconButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  profileCard: { backgroundColor: COLORS.primary, borderRadius: 18, padding: 18, marginBottom: 20 },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  profileInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  detail: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  profileStatsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12 },
  profileStat: { flex: 1, alignItems: 'center' },
  profileStatNumber: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 4 },
  profileStatLabel: { fontSize: 9, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { flex: 1, fontSize: 14, color: COLORS.text, marginLeft: 12, fontWeight: '500' },
  inviteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  inviteBadge: { backgroundColor: COLORS.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  inviteBadgeText: { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.redSoft },
  logoutText: { color: COLORS.red, fontSize: 14, fontWeight: '700', marginLeft: 8 },
});