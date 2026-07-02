import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrders } from '../context/OrderContext';

type RootStackParamList = { RiderLogin: undefined; RiderHome: undefined; RiderMap: { deliveryId: string }; RiderWallet: undefined; RiderProfile: undefined; RiderMessages: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'RiderHome'> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#16A34A', amber: '#FBBF24', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248' };

export default function RiderHomeScreen({ navigation }: Props) {
  const { orders, assignRider, markPickedUp, markOnTheWay, markDelivered } = useOrders();
  const [codeInputs, setCodeInputs] = useState<Record<string, string>>({});

  const myDeliveries = orders.filter(
    (o) => (o.stage === 'Packed' && !o.rider) || (o.rider === 'rider001' && (o.stage === 'Picked Up' || o.stage === 'On The Way'))
  );

  const handlePickup = (id: string) => {
    assignRider(id, 'rider001');
    markPickedUp(id);
  };

  const handleConfirmDelivery = (id: string) => {
    const entered = codeInputs[id] || '';
    const result = markDelivered(id, entered);
    if (!result.success) {
      Alert.alert('Incorrect Code', result.message);
      return;
    }
    Alert.alert('Delivered! 🎉', 'The buyer and seller have been notified. Admin will release payment.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Rider Portal</Text>
          <Text style={styles.subtitle}>Your deliveries today</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.replace('RiderLogin')}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {myDeliveries.length === 0 ? (
          <Text style={styles.emptyText}>No deliveries right now. Check back soon!</Text>
        ) : (
          myDeliveries.map((d) => (
            <View key={d.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={styles.thumb}>
                  <Ionicons name="cube-outline" size={22} color={COLORS.subtext} />
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardItem}>{d.item}</Text>
                  <Text style={styles.cardRoute}>{d.seller} → {d.buyer}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: d.stage === 'Packed' ? 'rgba(251,191,36,0.15)' : 'rgba(34,197,94,0.15)' }]}>
                  <Text style={[styles.statusBadgeText, { color: d.stage === 'Packed' ? COLORS.amber : COLORS.primary }]}>
                    {d.stage === 'Packed' ? 'Packed' : d.stage}
                  </Text>
                </View>
              </View>

              <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('RiderMap', { deliveryId: d.id })}>
                <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                <Text style={styles.mapButtonText}>View Route</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.subtext} />
              </TouchableOpacity>

              {d.stage === 'Packed' ? (
                <TouchableOpacity style={styles.actionButton} onPress={() => handlePickup(d.id)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Confirm Pickup</Text>
                </TouchableOpacity>
              ) : d.stage === 'Picked Up' ? (
                <TouchableOpacity style={styles.actionButton} onPress={() => markOnTheWay(d.id)}>
                  <Ionicons name="bicycle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Mark On The Way</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.codeInputRow}>
                    <Ionicons name="lock-closed-outline" size={16} color={COLORS.subtext} style={{ marginLeft: 12 }} />
                    <TextInput
                      style={styles.codeInput}
                      placeholder="Enter buyer's pickup code"
                      placeholderTextColor={COLORS.subtext}
                      autoCapitalize="characters"
                      value={codeInputs[d.id] || ''}
                      onChangeText={(text) => setCodeInputs((prev) => ({ ...prev, [d.id]: text }))}
                    />
                  </View>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleConfirmDelivery(d.id)}>
                    <Ionicons name="checkmark-done-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Confirm Delivered</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={22} color={COLORS.subtext} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="bicycle" size={22} color={COLORS.primary} />
          <Text style={[styles.tabLabel, { color: COLORS.primary }]}>Deliveries</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('RiderWallet')}>
          <Ionicons name="wallet-outline" size={22} color={COLORS.subtext} />
          <Text style={styles.tabLabel}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('RiderMessages')}>
          <Ionicons name="chatbubble-outline" size={22} color={COLORS.subtext} />
          <Text style={styles.tabLabel}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('RiderProfile')}>
          <Ionicons name="person-outline" size={22} color={COLORS.subtext} />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  headerIcons: { flexDirection: 'row' },
  iconButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  emptyText: { textAlign: 'center', color: COLORS.subtext, marginTop: 60 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardTextWrap: { flex: 1 },
  cardItem: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardRoute: { fontSize: 11, color: COLORS.subtext },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  mapButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10 },
  mapButtonText: { color: COLORS.primary, fontSize: 13, fontWeight: '600', marginLeft: 6, flex: 1 },
  codeInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  codeInput: { flex: 1, paddingHorizontal: 10, paddingVertical: 11, fontSize: 13, color: COLORS.text, letterSpacing: 1 },
  actionButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginLeft: 6 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8, paddingBottom: 20, backgroundColor: COLORS.bg },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 10, color: COLORS.subtext, marginTop: 3, fontWeight: '600' },
});