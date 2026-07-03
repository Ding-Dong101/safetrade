import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { PRODUCTS, CATEGORIES, Product } from '../data/products';
import { useOrders } from '../context/OrderContext';

type TabParamList = { Home: undefined; Search: undefined; Sell: undefined; Orders: undefined; Messages: undefined; Account: undefined };
type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string; title: string; price: number; seller: string; placeholderColor: string };
  Notifications: undefined;
};
type Props = { navigation: CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Home'>, NativeStackNavigationProp<RootStackParamList>>; };

const COLORS = {
  bg: '#FFFFFF',
  surface: '#F5F6F8',
  primary: '#0F62FE',
  primaryDark: '#0A3FAE',
  amber: '#F59E0B',
  green: '#16A34A',
  text: '#1A1A1A',
  subtext: '#6B7280',
  border: '#E5E7EB',
};

export default function HomeScreen({ navigation }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const { getUnreadCount, orders } = useOrders();
  const unread = getUnreadCount('buyer');
  const totalInEscrow = orders
    .filter((o) => o.stage !== 'Released' && o.stage !== 'Returned' && o.stage !== 'Cart')
    .reduce((sum, o) => sum + o.itemPrice, 0);

  const mappedCategory = activeCategory === 'Hostel Items' ? 'Furniture' : activeCategory;
  const filteredProducts =
    activeCategory === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === mappedCategory);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', {
        productId: item.id,
        title: item.title,
        price: item.price,
        seller: item.seller,
        placeholderColor: item.placeholderColor,
      })}
    >
      <View style={[styles.imagePlaceholder, { backgroundColor: item.placeholderColor }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <View style={styles.conditionTag}>
          <Text style={styles.conditionTagText}>{item.condition}</Text>
        </View>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons name="heart-outline" size={16} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color={COLORS.amber} />
          <Text style={styles.ratingText}>{item.rating} ({item.reviews})</Text>
          <Text style={styles.locationDot}>·</Text>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.cardPrice}>GHS {item.price.toLocaleString()}</Text>
        {item.verified && (
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={11} color={COLORS.green} />
            <Text style={styles.verifiedText}>Verified Seller</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={COLORS.subtext} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greeting}>Good Afternoon, Tyler 👋</Text>
            <View style={styles.appNameRow}>
              <Text style={styles.appName}>Safe</Text>
              <Text style={[styles.appName, { color: COLORS.primary }]}>Trade</Text>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.subtitle}>Campus Marketplace</Text>
          </View>
         <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            {unread > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.locationBar}>
      
          <TouchableOpacity style={styles.locationLeft}>
            <Ionicons name="location-outline" size={14} color={COLORS.subtext} />
            <Text style={styles.locationBarText}>KNUST Campus</Text>
            <Ionicons name="chevron-down" size={12} color={COLORS.subtext} />
          </TouchableOpacity>
          <View style={styles.escrowBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.green} />
            <Text style={styles.escrowBadgeText}>Escrow Protection Active</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search' as never)}>
          <Ionicons name="search" size={18} color={COLORS.subtext} />
          <Text style={styles.searchPlaceholder}>Search for items, books, food...</Text>
          <Ionicons name="mic-outline" size={18} color={COLORS.subtext} style={{ marginHorizontal: 6 }} />
          <Ionicons name="camera-outline" size={18} color={COLORS.subtext} />
        </TouchableOpacity>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c.name}
          contentContainerStyle={styles.categoryRow}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => setActiveCategory(cat.name)}
            >
              <View style={[styles.categoryCircle, activeCategory === cat.name && styles.categoryCircleActive]}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={[styles.categoryLabel, activeCategory === cat.name && styles.categoryLabelActive]}>{cat.name}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.promoBanner}>
          <View style={styles.promoTextWrap}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>🎓 Student Deals</Text>
            </View>
            <Text style={styles.promoTitle}>Get up to 40% off{'\n'}verified products</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Browse Deals</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.promoEmoji}>🎧📚🎒</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🔥 Trending Today</Text>
          <Text style={styles.sectionLink}>See All</Text>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, marginBottom: 14, flexWrap: 'wrap' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTextWrap: { flex: 1 },
  greeting: { fontSize: 12, color: COLORS.subtext, marginBottom: 2 },
  appNameRow: { flexDirection: 'row', alignItems: 'center' },
  appName: { fontSize: 19, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 11, color: COLORS.subtext, marginTop: 1 },
  bellButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bellBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
escrowPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginTop: 8 },
  escrowPillLabel: { fontSize: 12, fontWeight: '700', color: COLORS.green },
  escrowPillSubLabel: { fontSize: 9, color: COLORS.subtext },
  locationBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16, borderRadius: 10, marginBottom: 14 },
  locationLeft: { flexDirection: 'row', alignItems: 'center' },
  locationBarText: { fontSize: 12, color: COLORS.text, fontWeight: '600', marginHorizontal: 4 },
  escrowBadge: { flexDirection: 'row', alignItems: 'center' },
  escrowBadgeText: { fontSize: 11, color: COLORS.green, fontWeight: '600', marginLeft: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginHorizontal: 16, marginBottom: 18 },
  searchPlaceholder: { flex: 1, marginLeft: 8, color: COLORS.subtext, fontSize: 13 },
  categoryRow: { paddingHorizontal: 16, marginBottom: 20 },
  categoryItem: { alignItems: 'center', marginRight: 16, width: 64 },
  categoryCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryCircleActive: { backgroundColor: COLORS.primary },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: { fontSize: 10, color: COLORS.subtext, fontWeight: '600', textAlign: 'center' },
  categoryLabelActive: { color: COLORS.primary },
  promoBanner: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 18, marginHorizontal: 16, padding: 18, marginBottom: 22, alignItems: 'center', overflow: 'hidden' },
  promoTextWrap: { flex: 1 },
  promoTag: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  promoTagText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  promoTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', lineHeight: 23, marginBottom: 12 },
  promoButton: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-start' },
  promoButtonText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  promoEmoji: { fontSize: 30, marginLeft: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  sectionLink: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: COLORS.bg, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  imagePlaceholder: { height: 110, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40 },
  conditionTag: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(22,163,74,0.9)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  conditionTagText: { fontSize: 9, color: '#FFFFFF', fontWeight: '700' },
  heartButton: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  ratingText: { fontSize: 10, color: COLORS.subtext, marginLeft: 3, fontWeight: '600' },
  locationDot: { fontSize: 10, color: COLORS.subtext, marginHorizontal: 3 },
  locationText: { fontSize: 10, color: COLORS.subtext },
  cardPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { fontSize: 10, color: COLORS.green, fontWeight: '600', marginLeft: 3 },
});