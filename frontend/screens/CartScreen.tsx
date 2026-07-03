import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrders } from '../context/OrderContext';

type RootStackParamList = { Cart: undefined; TradeDetails: { tradeId: string } };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Cart'> };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

const DELIVERY_FEE_PER_ITEM = 25;

export default function CartScreen({ navigation }: Props) {
  const { cart, removeFromCart, clearCart, createOrder, markPaid } = useOrders();

  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
  const deliveryFee = cart.length > 0 ? DELIVERY_FEE_PER_ITEM * cart.length : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    let lastOrderId = '';
    cart.forEach((item) => {
      const orderId = createOrder(item.title, item.price, DELIVERY_FEE_PER_ITEM, item.seller);
      markPaid(orderId);
      lastOrderId = orderId;
    });
    clearCart();
    Alert.alert('Payment Successful 🎉', `GHS ${total.toLocaleString()} paid for ${cart.length} item(s).`);
    navigation.navigate('TradeDetails', { tradeId: lastOrderId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Cart</Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.thumb, { backgroundColor: item.placeholderColor }]} />
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowPrice}>GHS {item.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
              <Ionicons name="trash-outline" size={20} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty</Text>}
      />

      {cart.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>GHS {subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>GHS {deliveryFee}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>GHS {total.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Ionicons name="card-outline" size={18} color="#FFFFFF" />
            <Text style={styles.checkoutText}>Pay & Secure in Escrow</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  listContent: { paddingBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  thumb: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  rowPrice: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.subtext, marginTop: 60 },
  summary: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16, paddingBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.subtext },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  totalRow: { marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
  totalValue: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
  checkoutButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  checkoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
});