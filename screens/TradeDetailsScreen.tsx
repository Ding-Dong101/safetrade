import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext';

type RootStackParamList = { TradeDetails: { tradeId: string } };
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TradeDetails'>;
  route: RouteProp<RootStackParamList, 'TradeDetails'>;
};

const COLORS = { bg: '#F7F9FC', card: '#FFFFFF', primary: '#3B82F6', primarySoft: '#EFF6FF', green: '#10B981', greenSoft: '#ECFDF5', text: '#1F2937', subtext: '#6B7280', border: '#E5E7EB' };

const STAGES = [
  { key: 'Paid', icon: '🔒', label: 'Payment Secured' },
  { key: 'Packed', icon: '📦', label: 'Packed Up' },
  { key: 'Picked Up', icon: '🚲', label: 'Picked Up' },
  { key: 'On The Way', icon: '🛵', label: 'On The Way' },
  { key: 'Delivered', icon: '🎉', label: 'Delivered' },
] as const;

export default function TradeDetailsScreen({ navigation, route }: Props) {
  const { tradeId } = route.params;
  const { orders } = useOrders();
  const order = orders.find((o) => o.id === tradeId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order not found</Text>
      </SafeAreaView>
    );
  }

  // 'Released' and 'Returned' both display as the final "Delivered" step visually
  const stageIndex = Math.max(0, STAGES.findIndex((s) => s.key === order.stage));
  const currentStage = STAGES[stageIndex] || STAGES[0];
  const isComplete = order.stage === 'Delivered' || order.stage === 'Released';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Your Order</Text>

        <View style={styles.trackerCard}>
          <View style={styles.stepRow}>
            {STAGES.map((stage, index) => {
              const isDone = index < stageIndex || isComplete;
              const isCurrent = index === stageIndex && !isComplete;
              const isLast = index === STAGES.length - 1;
              return (
                <React.Fragment key={stage.key}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepCircle, isDone && styles.stepCircleDone, isCurrent && styles.stepCircleCurrent]}>
                      <Text style={styles.stepIcon}>{stage.icon}</Text>
                    </View>
                  </View>
                  {!isLast && <View style={[styles.connector, isDone && styles.connectorDone]} />}
                </React.Fragment>
              );
            })}
          </View>
          <Text style={styles.currentStageLabel}>
            {isComplete ? '🎉 Delivered' : `${currentStage.icon} ${currentStage.label}`}
          </Text>
        </View>

        <View style={styles.codeBanner}>
          <Text style={styles.codeLabel}>🔑 Your Pickup Code — show this to your rider on delivery</Text>
          <Text style={styles.codeValue}>{order.pickupCode}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Item</Text><Text style={styles.infoValue}>{order.item}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Price</Text><Text style={styles.infoValue}>GHS {order.itemPrice.toLocaleString()}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Seller</Text><Text style={styles.infoValue}>{order.seller}</Text></View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>Order ID</Text><Text style={styles.infoValue}>#{order.id}</Text></View>
        </View>

        <View style={styles.infoNote}>
          <Text style={styles.infoNoteText}>
            Your order updates automatically as it moves through each stage. No action needed from you until the rider arrives — just have your pickup code ready.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { marginBottom: 12 },
  backButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  trackerCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepItem: { alignItems: 'center' },
  stepCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepCircleDone: { backgroundColor: COLORS.greenSoft, borderColor: COLORS.green },
  stepCircleCurrent: { backgroundColor: COLORS.primarySoft, borderColor: COLORS.primary },
  stepIcon: { fontSize: 16 },
  connector: { flex: 1, height: 3, backgroundColor: COLORS.border, borderRadius: 2 },
  connectorDone: { backgroundColor: COLORS.green },
  currentStageLabel: { textAlign: 'center', fontWeight: '700', color: COLORS.text, fontSize: 15 },
  codeBanner: { backgroundColor: COLORS.primarySoft, borderRadius: 14, padding: 16, marginBottom: 16, alignItems: 'center' },
  codeLabel: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  codeValue: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: 2 },
  infoCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.bg },
  infoLabel: { fontSize: 13, color: COLORS.subtext },
  infoValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  infoNote: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  infoNoteText: { fontSize: 12, color: COLORS.subtext, lineHeight: 18, textAlign: 'center' },
});