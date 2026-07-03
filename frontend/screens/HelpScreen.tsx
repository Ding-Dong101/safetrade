import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Help: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Help'> };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

const SUPPORT_PHONE = '0550388484';

export default function HelpScreen({ navigation }: Props) {
  const handleCall = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <Text style={styles.subtitle}>Need help with an order, payment, or your account?</Text>

      <TouchableOpacity style={styles.callCard} onPress={handleCall}>
        <View style={styles.callIconCircle}>
          <Ionicons name="call" size={22} color={COLORS.primary} />
        </View>
        <View style={styles.callTextWrap}>
          <Text style={styles.callTitle}>Call Support</Text>
          <Text style={styles.callNumber}>055 038 8484</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.subtext} />
      </TouchableOpacity>

      <View style={styles.faqSection}>
        <Text style={styles.faqHeading}>Frequently Asked</Text>
        <Text style={styles.faqItem}>• How does escrow protect my payment?</Text>
        <Text style={styles.faqItem}>• What if my item doesn't arrive?</Text>
        <Text style={styles.faqItem}>• How do I become a rider?</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  subtitle: { fontSize: 13, color: COLORS.subtext, marginBottom: 20 },
  callCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 24 },
  callIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  callTextWrap: { flex: 1 },
  callTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  callNumber: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  faqSection: { marginTop: 8 },
  faqHeading: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  faqItem: { fontSize: 13, color: COLORS.subtext, marginBottom: 10, lineHeight: 20 },
});