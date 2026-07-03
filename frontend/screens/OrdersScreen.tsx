import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useOrders, Order, OrderStage } from '../context/OrderContext';

type TabParamList = { Home: undefined; Search: undefined; Sell: undefined; Orders: undefined; Account: undefined };
type RootStackParamList = { MainTabs: undefined; TradeDetails: { tradeId: string }; Cart: undefined };
type Props = { navigation: CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Orders'>, NativeStackNavigationProp<RootStackParamList>>; };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', amber: '#D97706', amberSoft: '#FEF3C7', green: '#16A34A', greenSoft: '#DCFCE7', red: '#DC2626', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

const TRACKER_STEPS: { key: string; label: string }[] = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function getTrackerIndex(stage: OrderStage): number {
  if (stage === 'Paid') return 0;
  if (stage === 'Packed') return 1;
  if (stage === 'Picked Up' || stage === 'On The Way') return 2;
  if (stage === 'Delivered' || stage === 'Released') return 3;
  return 0;
}

const STAGE_LABEL: Record<string, string> = {
  Paid: 'Processing', Packed: 'Packed', 'Picked Up': 'Shipped', 'On The Way': 'Shipped',
  Delivered: 'Delivered', Released: 'Delivered', Returned: 'Cancelled',
};
const STAGE_BADGE: Record<string, { bg: string; text: string }> = {
  Paid: { bg: COLORS.amberSoft, text: COLORS.amber }, Packed: { bg: COLORS.amberSoft, text: COLORS.amber },
  'Picked Up': { bg: '#EFF6FF', text: COLORS.primary }, 'On The Way': { bg: '#EFF6FF', text: COLORS.primary },
  Delivered: { bg: COLORS.greenSoft, text: COLORS.green }, Released: { bg: COLORS.greenSoft, text: COLORS.green },
  Returned: { bg: '#FEF2F2', text: COLORS.red },
};

export default function OrdersScreen({ navigation }: Props) {
  const { orders, markPacked } = useOrders();
  const [mode, setMode] = useState<'buying' | 'selling'>('buying');

  const myPurchases = orders.filter((o) => o.buyer === 'martin_o' && o.stage !== 'Cart');
  const myListings = orders.filter((o) => o.seller === 'ama_b' || o.seller === 'seller_sophie');

  const renderTracker = (stage: OrderStage) => {
    const idx = getTrackerIndex(stage);
    const isCancelled = stage === 'Returned';
    return (
      <View style={styles.trackerRow}>
        {TRACKER_STEPS.map((step, i) => (
          <React.Fragment key={step.key}>
            <View style={styles.trackerStep}>
              <View style={[styles.trackerDot, i <= idx && !isCancelled && styles.trackerDotDone]} />
              <Text style={[styles.trackerLabel, i <= idx && !isCancelled && styles.trackerLabelDone]}>{step.label}</Text>
            </View>
            {i < TRACKER_STEPS.length - 1 && <View style={[styles.trackerLine, i < idx && !isCancelled && styles.trackerLineDone]} />}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setMode('buying')}>
          <Text style={[styles.tabText, mode === 'buying' && styles.tabTextActive]}>Buying</Text>
          {mode === 'buying' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setMode('selling')}>
          <Text style={[styles.tabText, mode === 'selling' && styles.tabTextActive]}>Selling</Text>
          {mode === 'selling' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {mode === 'buying' ? (
        <FlatList
          data={myPurchases}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const badge = STAGE_BADGE[item.stage] || STAGE_BADGE.Paid;
            return (
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TradeDetails', { tradeId: item.id })}>
                <View style={styles.cardTopRow}>
                  <View style={styles.thumb}><Ionicons name="cube-outline" size={20} color={COLORS.subtext} /></View>
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardItem}>{item.item}</Text>
                    <Text style={styles.cardPrice}>GHS {item.itemPrice.toLocaleString()}</Text>
                    <Text style={styles.cardOrderId}>Order #ST{item.id.slice(-5)}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{STAGE_LABEL[item.stage]}</Text>
                  </View>
                </View>
                {renderTracker(item.stage)}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't bought anything yet</Text>}
        />
      ) : (
        <FlatList
          data={myListings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const sellerCut = item.itemPrice * (1 - item.platformFeePercent / 100);
            const badge = STAGE_BADGE[item.stage] || STAGE_BADGE.Paid;
            return (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.thumb}><Ionicons name="cube-outline" size={20} color={COLORS.subtext} /></View>
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.cardItem}>{item.item}</Text>
                    <Text style={styles.cardPrice}>GHS {item.itemPrice.toLocaleString()}</Text>
                    <Text style={styles.cardOrderId}>Buyer: {item.buyer}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{STAGE_LABEL[item.stage]}</Text>
                  </View>
                </View>
                <View style={styles.feeBreakdown}>
                  <Text style={styles.feeText}>You'll receive: <Text style={styles.feeAmount}>GHS {sellerCut.toFixed(2)}</Text> (after 15% fee)</Text>
                </View>
                {item.stage === 'Paid' && (
                  <TouchableOpacity style={styles.confirmButton} onPress={() => markPacked(item.id)}>
                    <Text style={styles.confirmButtonText}>Confirm Packed & Ready</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>You haven't listed anything yet</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  cartButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', marginBottom: 18, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabButton: { marginRight: 28, paddingBottom: 10 },
  tabText: { fontSize: 14, color: COLORS.subtext, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },
  tabUnderline: { height: 2, backgroundColor: COLORS.primary, marginTop: 6, borderRadius: 1 },
  listContent: { paddingBottom: 100 },
  card: { backgroundColor: COLORS.bg, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  thumb: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardTextWrap: { flex: 1 },
  cardItem: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardPrice: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginBottom: 2 },
  cardOrderId: { fontSize: 11, color: COLORS.subtext },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  trackerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  trackerStep: { alignItems: 'center', width: 60 },
  trackerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border, marginBottom: 4 },
  trackerDotDone: { backgroundColor: COLORS.primary },
  trackerLabel: { fontSize: 8, color: COLORS.subtext, textAlign: 'center' },
  trackerLabelDone: { color: COLORS.primary, fontWeight: '600' },
  trackerLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginTop: 4 },
  trackerLineDone: { backgroundColor: COLORS.primary },
  feeBreakdown: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 10, marginBottom: 10 },
  feeText: { fontSize: 11, color: COLORS.subtext },
  feeAmount: { color: COLORS.green, fontWeight: '700' },
  confirmButton: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.subtext, marginTop: 40 },
});