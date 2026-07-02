import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext';

type RootStackParamList = {
  ProductDetail: { productId: string; title: string; price: number; seller: string; placeholderColor: string };
  Cart: undefined;
  TradeDetails: { tradeId: string };
};
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
  route: RouteProp<RootStackParamList, 'ProductDetail'>;
};

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB', green: '#16A34A' };

const DELIVERY_FEE = 25;

export default function ProductDetailScreen({ navigation, route }: Props) {
  const { title, price, seller, placeholderColor, productId } = route.params;
  const { createOrder, markPaid, addToCart } = useOrders();
 
  const [addedToCart, setAddedToCart] = useState(false);

  const total = price + DELIVERY_FEE;

  const handleAddToCart = () => {
    addToCart({ id: productId, title, price, seller, placeholderColor });
    setAddedToCart(true);
    Alert.alert('Added to Cart', `${title} has been added to your cart.`);
  };

  const handleBuyNow = () => {
    const orderId = createOrder(title, price, DELIVERY_FEE, seller);
    markPaid(orderId);
    Alert.alert('Payment Successful 🎉', `GHS ${total.toLocaleString()} paid. Track your order in My Orders.`);
    navigation.navigate('TradeDetails', { tradeId: orderId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.imagePlaceholder, { backgroundColor: placeholderColor }]}>
        <Ionicons name="image-outline" size={48} color={COLORS.subtext} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.seller}>Sold by {seller}</Text>
        <Text style={styles.price}>GHS {price.toLocaleString()}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Item Price</Text>
          <Text style={styles.summaryValue}>GHS {price.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>GHS {DELIVERY_FEE}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>GHS {total.toLocaleString()}</Text>
        </View>

        <View style={styles.escrowNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.green} />
          <Text style={styles.escrowNoteText}>Your payment is held safely until you confirm delivery</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>{addedToCart ? 'Added ✓' : 'Add to Cart'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  imagePlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, borderRadius: 16 },
  content: { paddingHorizontal: 16, paddingTop: 16, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  seller: { fontSize: 13, color: COLORS.subtext, marginBottom: 10 },
  price: { fontSize: 24, fontWeight: '700', color: COLORS.primary, marginBottom: 16 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.subtext },
  summaryValue: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  totalRow: { marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
  totalValue: { fontSize: 15, color: COLORS.text, fontWeight: '700' },
  escrowNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12, marginTop: 16 },
  escrowNoteText: { fontSize: 12, color: COLORS.green, marginLeft: 8, flex: 1 },
  footer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  cartButton: { flex: 1, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginRight: 10 },
  cartButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  buyButton: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});