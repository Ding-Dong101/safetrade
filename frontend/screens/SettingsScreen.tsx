import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Settings: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'> };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SettingsScreen({ navigation }: Props) {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleTogglePush = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setPushEnabled(false);
        return;
      }
      setPushEnabled(true);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SafeTrade 🔔',
          body: 'Notifications are now turned on for your orders and trades.',
        },
        trigger: null,
      });
    } else {
      setPushEnabled(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowText}>Push Notifications</Text>
        <Switch value={pushEnabled} onValueChange={handleTogglePush} trackColor={{ true: COLORS.primary }} />
      </View>
      <View style={styles.row}>
        <Text style={styles.rowText}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: COLORS.primary }} />
      </View>
      <Text style={styles.note}>Dark Mode is coming in a future update.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 10 },
  rowText: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  note: { fontSize: 12, color: COLORS.subtext, textAlign: 'center', marginTop: 8 },
});