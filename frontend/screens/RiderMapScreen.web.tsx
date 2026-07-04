import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = { RiderMap: { deliveryId: string } };
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderMap'>;
  route: RouteProp<RootStackParamList, 'RiderMap'>;
};

const COLORS = { bg: '#0B1220', primary: '#16A34A', text: '#FFFFFF', subtext: '#8A93A3' };

// Simulated campus coordinates — replace with real backend GPS data later
const SELLER_LOCATION = { latitude: 6.6745, longitude: -1.5716 };
const BUYER_LOCATION = { latitude: 6.6885, longitude: -1.5635 };

export default function RiderMapScreen({ navigation, route }: Props) {
  const [riderPosition, setRiderPosition] = useState(SELLER_LOCATION);
  const progressRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      progressRef.current += 0.02;
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        clearInterval(interval);
      }
      const lat = SELLER_LOCATION.latitude + (BUYER_LOCATION.latitude - SELLER_LOCATION.latitude) * progressRef.current;
      const lng = SELLER_LOCATION.longitude + (BUYER_LOCATION.longitude - SELLER_LOCATION.longitude) * progressRef.current;
      setRiderPosition({ latitude: lat, longitude: lng });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Route</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={{color: 'white', textAlign: 'center'}}>Map is not supported on Web</Text>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>📍 Simulated location — live GPS will connect once backend is ready</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  note: { padding: 16, backgroundColor: '#151E30' },
  noteText: { color: COLORS.subtext, fontSize: 12, textAlign: 'center' },
});