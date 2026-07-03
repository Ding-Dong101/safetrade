import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { RiderLogin: undefined; RiderHome: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'RiderLogin'> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#16A34A', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248', red: '#F87171' };

// Placeholder credentials — backend will issue real rider accounts later
const RIDER_CREDENTIALS = { id: 'rider001', pin: '1234' };

export default function RiderLoginScreen({ navigation }: Props) {
  const [riderId, setRiderId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (riderId === RIDER_CREDENTIALS.id && pin === RIDER_CREDENTIALS.pin) {
      setError('');
      navigation.replace('RiderHome');
    } else {
      setError('Incorrect Rider ID or PIN.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.iconCircle}>
        <Ionicons name="bicycle" size={32} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>Rider Login</Text>
      <Text style={styles.subtitle}>For SafeTrade delivery riders only</Text>

      <TextInput
        style={styles.input}
        placeholder="Rider ID"
        placeholderTextColor={COLORS.subtext}
        autoCapitalize="none"
        value={riderId}
        onChangeText={setRiderId}
      />
      <TextInput
        style={styles.input}
        placeholder="PIN"
        placeholderTextColor={COLORS.subtext}
        secureTextEntry
        keyboardType="numeric"
        value={pin}
        onChangeText={setPin}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24, justifyContent: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: COLORS.subtext, textAlign: 'center', marginBottom: 28 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, backgroundColor: COLORS.surface, color: COLORS.text, marginBottom: 14 },
  errorText: { color: COLORS.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});