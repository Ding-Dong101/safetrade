import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { RiderHome: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, any> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#16A34A', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248' };

const CONVOS = [
  { id: '1', name: 'Ama Boateng (Seller)', message: 'The package is ready for pickup', time: '10m ago' },
  { id: '2', name: 'Martin Owusu (Buyer)', message: 'How far are you from my hostel?', time: '1h ago' },
  { id: '3', name: 'SafeTrade Admin', message: 'Great job on your last 5 deliveries!', time: 'Yesterday' },
];

export default function RiderMessagesScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={CONVOS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color={COLORS.subtext} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMessage}>{item.message}</Text>
            </View>
            <Text style={styles.rowTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginLeft: 10 },
  listContent: { paddingHorizontal: 20, paddingTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  rowMessage: { fontSize: 11, color: COLORS.subtext },
  rowTime: { fontSize: 10, color: COLORS.subtext },
});