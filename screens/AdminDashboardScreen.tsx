import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOrders } from '../context/OrderContext';

type RootStackParamList = { AdminLogin: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, any> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#0F62FE', green: '#22C55E', amber: '#FBBF24', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248' };

const STAGE_STYLE: Record<string, { bg: string; text: string }> = {
  Cart: { bg: 'rgba(251,191,36,0.15)', text: COLORS.amber },
  Paid: { bg: 'rgba(251,191,36,0.15)', text: COLORS.amber },
  Packed: { bg: 'rgba(251,191,36,0.15)', text: COLORS.amber },
  'Picked Up': { bg: 'rgba(15,98,254,0.15)', text: COLORS.primary },
  'On The Way': { bg: 'rgba(15,98,254,0.15)', text: COLORS.primary },
  Delivered: { bg: 'rgba(34,197,94,0.15)', text: COLORS.green },
  Released: { bg: 'rgba(34,197,94,0.15)', text: COLORS.green },
  Returned: { bg: 'rgba(248,113,113,0.15)', text: '#F87171' },
};

type Rider = { id: string; name: string; status: 'Pending Review' | 'Approved'; ghanaCardUri: string | null; licenseUri: string | null };

const MOCK_USERS = [
  { id: '1', name: 'Martin Owusu', role: 'Buyer/Seller', email: 'martin.owusu@university.edu' },
  { id: '2', name: 'Ama Boateng', role: 'Buyer/Seller', email: 'ama.b@university.edu' },
  { id: '3', name: 'Kojo Asante', role: 'Buyer/Seller', email: 'kojo.a@university.edu' },
  { id: '4', name: 'Sophie Mensah', role: 'Buyer/Seller', email: 'seller.sophie@university.edu' },
];

export default function AdminDashboardScreen({ navigation }: Props) {
  const { orders, releasePayment } = useOrders();
  const [tab, setTab] = useState<'orders' | 'riders' | 'users'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [riders, setRiders] = useState<Rider[]>([
    { id: 'rider001', name: 'Kwame Asante', status: 'Approved', ghanaCardUri: null, licenseUri: null },
  ]);

  const [showAddRider, setShowAddRider] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [ghanaCardUri, setGhanaCardUri] = useState<string | null>(null);
  const [licenseUri, setLicenseUri] = useState<string | null>(null);

  const pickDocument = async (setUri: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload this document.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.length > 0) setUri(result.assets[0].uri);
  };

  const generateCredentials = () => {
    const id = `rider${String(riders.length + 1).padStart(3, '0')}`;
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    return { id, pin };
  };

  const handleApproveRider = () => {
    if (!newRiderName || !ghanaCardUri || !licenseUri) {
      Alert.alert('Missing Info', "Please enter the rider's name and upload both documents.");
      return;
    }
    const { id, pin } = generateCredentials();
    setRiders((prev) => [...prev, { id, name: newRiderName, status: 'Approved', ghanaCardUri, licenseUri }]);
    Alert.alert(
      'Rider Approved ✅',
      `${newRiderName} has been verified.\n\nRider ID: ${id}\nPIN: ${pin}\n\nShare these credentials with the rider so they can log in.`
    );
    setNewRiderName('');
    setGhanaCardUri(null);
    setLicenseUri(null);
    setShowAddRider(false);
  };

  const handleReleasePayment = (orderId: string) => {
    releasePayment(orderId);
    Alert.alert('Payment Released', 'Funds have been released to the seller.');
  };

  const totalVolume = orders.reduce((sum, o) => sum + o.itemPrice, 0);
  const totalRevenue = orders
    .filter((o) => o.stage === 'Released')
    .reduce((sum, o) => sum + o.itemPrice * (o.platformFeePercent / 100), 0);

  const filteredOrders = orders.filter((o) =>
    o.item.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.buyer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.seller.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.replace('AdminLogin')}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}><Text style={styles.statNumber}>{orders.length}</Text><Text style={styles.statLabel}>Orders</Text></View>
        <View style={styles.statBox}><Text style={styles.statNumber}>{riders.length}</Text><Text style={styles.statLabel}>Riders</Text></View>
        <View style={styles.statBox}><Text style={styles.statNumber}>GHS {totalVolume.toLocaleString()}</Text><Text style={styles.statLabel}>Volume</Text></View>
      </View>

      <View style={styles.revenueCard}>
        <View style={styles.revenueTopRow}>
          <View>
            <Text style={styles.revenueLabel}>Platform Revenue Earned</Text>
            <Text style={styles.revenueAmount}>GHS {totalRevenue.toFixed(2)}</Text>
            <Text style={styles.revenueTrend}>↑ 15% this week</Text>
          </View>
          <View style={styles.fakeChart}>
            {[14, 22, 18, 30, 24, 34, 28].map((h, i) => (
              <View key={i} style={[styles.chartBar, { height: h }]} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabButton, tab === 'orders' && styles.tabButtonActive]} onPress={() => setTab('orders')}>
          <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, tab === 'riders' && styles.tabButtonActive]} onPress={() => setTab('riders')}>
          <Text style={[styles.tabText, tab === 'riders' && styles.tabTextActive]}>Riders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, tab === 'users' && styles.tabButtonActive]} onPress={() => setTab('users')}>
          <Text style={[styles.tabText, tab === 'users' && styles.tabTextActive]}>Users</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {tab === 'orders' ? (
          <>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by item, buyer, or seller..."
              placeholderTextColor={COLORS.subtext}
              value={orderSearch}
              onChangeText={setOrderSearch}
            />
            {filteredOrders.map((o) => {
              const s = STAGE_STYLE[o.stage] || STAGE_STYLE.Paid;
              return (
                <View key={o.id} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardItem}>{o.item}</Text>
                    <View style={[styles.badge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.badgeText, { color: s.text }]}>{o.stage}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSub}>Buyer: {o.buyer} · Seller: {o.seller}</Text>
                  <Text style={styles.cardSub}>Rider: {o.rider || 'Not assigned yet'}</Text>
                  <Text style={styles.cardAmount}>GHS {o.itemPrice.toLocaleString()}</Text>

                  {o.stage === 'Delivered' ? (
                    <TouchableOpacity style={styles.releaseButton} onPress={() => handleReleasePayment(o.id)}>
                      <Ionicons name="cash-outline" size={15} color="#0B1220" />
                      <Text style={styles.releaseButtonText}>Release Payment to Seller</Text>
                    </TouchableOpacity>
                  ) : o.stage === 'Released' ? (
                    <View style={styles.completeNote}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
                      <Text style={styles.completeNoteText}>Payment released to seller</Text>
                    </View>
                  ) : (
                    <View style={styles.liveNote}>
                      <Ionicons name="radio-outline" size={13} color={COLORS.primary} />
                      <Text style={styles.liveNoteText}>Live — updates automatically from buyer, seller & rider</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : tab === 'riders' ? (
          <>
            {!showAddRider ? (
              <TouchableOpacity style={styles.addRiderButton} onPress={() => setShowAddRider(true)}>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.addRiderButtonText}>Add New Rider</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addRiderForm}>
                <Text style={styles.formTitle}>New Rider Verification</Text>

                <TextInput
                  style={styles.formInput}
                  placeholder="Full name"
                  placeholderTextColor={COLORS.subtext}
                  value={newRiderName}
                  onChangeText={setNewRiderName}
                />

                <TouchableOpacity style={styles.docUpload} onPress={() => pickDocument(setGhanaCardUri)}>
                  {ghanaCardUri ? (
                    <Image source={{ uri: ghanaCardUri }} style={styles.docPreview} />
                  ) : (
                    <>
                      <Ionicons name="card-outline" size={22} color={COLORS.subtext} />
                      <Text style={styles.docUploadText}>Upload Ghana Card</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.docUpload} onPress={() => pickDocument(setLicenseUri)}>
                  {licenseUri ? (
                    <Image source={{ uri: licenseUri }} style={styles.docPreview} />
                  ) : (
                    <>
                      <Ionicons name="document-text-outline" size={22} color={COLORS.subtext} />
                      <Text style={styles.docUploadText}>Upload Driver's License</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.formButtonRow}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddRider(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveButton} onPress={handleApproveRider}>
                    <Text style={styles.approveButtonText}>Verify & Generate ID</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {riders.map((r) => (
              <View key={r.id} style={styles.riderCard}>
                <Ionicons name="bicycle-outline" size={20} color={COLORS.text} />
                <View style={styles.riderInfo}>
                  <Text style={styles.riderName}>{r.name}</Text>
                  <Text style={styles.riderStatus}>ID: {r.id} · {r.status}</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            {MOCK_USERS.map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={18} color={COLORS.subtext} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
                <Text style={styles.userRole}>{u.role}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.border },
  statNumber: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  statLabel: { fontSize: 10, color: COLORS.subtext },
  revenueCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  revenueLabel: { fontSize: 11, color: COLORS.subtext },
  revenueAmount: { fontSize: 16, fontWeight: '700', color: COLORS.green, marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 10, padding: 4, marginHorizontal: 20, marginBottom: 14 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: COLORS.bg },
  tabText: { fontSize: 13, color: COLORS.subtext, fontWeight: '600' },
  tabTextActive: { color: COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  searchInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, backgroundColor: COLORS.surface, color: COLORS.text, marginBottom: 14 },
  card: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  cardItem: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  cardSub: { fontSize: 11, color: COLORS.subtext, marginBottom: 2 },
  cardAmount: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 6, marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  liveNote: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveNoteText: { fontSize: 10, color: COLORS.primary, marginLeft: 5 },
  completeNote: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  completeNoteText: { fontSize: 10, color: COLORS.green, marginLeft: 5 },
  addRiderButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  addRiderButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  addRiderForm: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  formTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  formInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: COLORS.bg, color: COLORS.text, marginBottom: 12 },
  docUpload: { height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  docUploadText: { color: COLORS.subtext, fontSize: 12, marginTop: 6 },
  docPreview: { width: '100%', height: '100%' },
  formButtonRow: { flexDirection: 'row', marginTop: 4 },
  cancelButton: { flex: 1, paddingVertical: 13, alignItems: 'center', marginRight: 8 },
  cancelButtonText: { color: COLORS.subtext, fontSize: 13, fontWeight: '600' },
  approveButton: { flex: 2, backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  approveButtonText: { color: '#0B1220', fontSize: 13, fontWeight: '700' },
  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  riderInfo: { flex: 1, marginLeft: 12 },
  riderName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  riderStatus: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  releaseButton: { flexDirection: 'row', backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  releaseButtonText: { color: '#0B1220', fontSize: 12, fontWeight: '700', marginLeft: 6 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  userEmail: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  userRole: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  revenueTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  revenueTrend: { fontSize: 11, color: COLORS.green, fontWeight: '600', marginTop: 4 },
  fakeChart: { flexDirection: 'row', alignItems: 'flex-end', height: 40 },
  chartBar: { width: 6, backgroundColor: COLORS.green, borderRadius: 3, marginLeft: 4, opacity: 0.8 },
});