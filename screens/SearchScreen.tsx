import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { PRODUCTS, CATEGORIES } from '../data/products';

type TabParamList = { Home: undefined; Search: undefined; Sell: undefined; Orders: undefined; Account: undefined };
type RootStackParamList = { ProductDetail: { productId: string; title: string; price: number; seller: string; placeholderColor: string } };
type Props = { navigation: CompositeNavigationProp<BottomTabNavigationProp<TabParamList, 'Search'>, NativeStackNavigationProp<RootStackParamList>>; };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', amber: '#F59E0B', green: '#16A34A', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

const POPULAR_SEARCHES = ['iPhone 13', 'MacBook Pro', 'AirPods Pro', 'Textbooks', 'Mini Fridge'];
const RECENTLY_VIEWED = PRODUCTS.slice(0, 3);

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const mappedCategory = activeCategory === 'Hostel Items' ? 'Furniture' : activeCategory;
  const filtered = PRODUCTS.filter((i) => {
    const matchesQuery = i.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'All' || i.category === mappedCategory;
    return matchesQuery && matchesCategory;
  });

  const goToProduct = (item: typeof PRODUCTS[0]) => {
    navigation.navigate('ProductDetail', {
      productId: item.id, title: item.title, price: item.price, seller: item.seller, placeholderColor: item.placeholderColor,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Search</Text>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.subtext} />
        <TextInput
          style={styles.input}
          placeholder="Search for items, books, food..."
          placeholderTextColor={COLORS.subtext}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        <Ionicons name="mic-outline" size={18} color={COLORS.subtext} style={{ marginHorizontal: 4 }} />
        <Ionicons name="options-outline" size={18} color={COLORS.subtext} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c.name}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.categoryChip, activeCategory === cat.name && styles.categoryChipActive]}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
            <Text style={[styles.categoryChipText, activeCategory === cat.name && styles.categoryChipTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        )}
      />

      {query.length === 0 ? (
        <FlatList
          data={[]}
          keyExtractor={() => 'x'}
          renderItem={null}
          ListHeaderComponent={
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
                <Text style={styles.sectionLink}>See All</Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={RECENTLY_VIEWED}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.recentRow}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.recentCard} onPress={() => goToProduct(item)}>
                    <View style={[styles.recentThumb, { backgroundColor: item.placeholderColor }]}>
                      <Text style={styles.recentEmoji}>{item.emoji}</Text>
                      <TouchableOpacity style={styles.recentHeart}>
                        <Ionicons name="heart-outline" size={13} color={COLORS.text} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.recentPrice}>GHS {item.price.toLocaleString()}</Text>
                  </TouchableOpacity>
                )}
              />

              <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Popular Searches</Text>
              {POPULAR_SEARCHES.map((term) => (
                <TouchableOpacity key={term} style={styles.popularRow} onPress={() => setQuery(term)}>
                  <Text style={styles.popularText}>{term}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.subtext} />
                </TouchableOpacity>
              ))}
            </>
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => goToProduct(item)}>
              <View style={[styles.thumb, { backgroundColor: item.placeholderColor }]}>
                <Text style={styles.rowEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowPrice}>GHS {item.price.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No results for "{query}"</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 16 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
  input: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.text },
  categoryRow: { paddingBottom: 20 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.surface, marginRight: 8 },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipEmoji: { fontSize: 14, marginRight: 5 },
  categoryChipText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  categoryChipTextActive: { color: '#FFFFFF' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sectionLink: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  recentRow: { paddingBottom: 4 },
  recentCard: { width: 110, marginRight: 12 },
  recentThumb: { height: 90, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  recentEmoji: { fontSize: 30 },
  recentHeart: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  recentTitle: { fontSize: 11, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  recentPrice: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  popularRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  popularText: { fontSize: 13, color: COLORS.text },
  listContent: { paddingBottom: 100 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  thumb: { width: 48, height: 48, borderRadius: 10, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  rowEmoji: { fontSize: 22 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  rowPrice: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: COLORS.subtext, marginTop: 40 },
});