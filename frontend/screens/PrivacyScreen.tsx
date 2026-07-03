import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Privacy: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Privacy'> };

const COLORS = { bg: '#FFFFFF', text: '#1A1A1A', subtext: '#6B7280' };

export default function PrivacyScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.paragraph}>
          SafeTrade collects only the information needed to facilitate trades between students:
          your name, student ID, email, and transaction history.
        </Text>
        <Text style={styles.paragraph}>
          Your payment information is held securely in escrow until a trade is confirmed complete
          by both buyer and seller. We do not share your personal data with third parties outside
          of what's required to process a delivery.
        </Text>
        <Text style={styles.paragraph}>
          This is a student project prototype — full production privacy practices will be
          documented as the backend is completed.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  scrollContent: { paddingBottom: 30 },
  paragraph: { fontSize: 14, color: COLORS.subtext, lineHeight: 22, marginBottom: 16 },
});