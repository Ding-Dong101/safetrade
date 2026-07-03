import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { AdminLogin: undefined; AdminDashboard: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'AdminLogin'> };

const COLORS = { bg: '#0B1220', surface: '#151E30', primary: '#0F62FE', text: '#FFFFFF', subtext: '#8A93A3', border: '#283248', red: '#F87171' };

const ADMIN_PIN = '482913'; // placeholder PIN for now — backend will issue real credentials

export default function AdminLoginScreen({ navigation }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (pin !== ADMIN_PIN) {
      setError('Incorrect PIN.');
      return;
    }
    setError('');
    navigation.replace('AdminDashboard');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Admin Access</Text>
      <Text style={styles.subtitle}>Restricted to SafeTrade staff only</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter staff PIN"
        placeholderTextColor={COLORS.subtext}
        secureTextEntry
        keyboardType="numeric"
        value={pin}
        onChangeText={setPin}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Enter</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: COLORS.subtext, textAlign: 'center', marginBottom: 28 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, backgroundColor: COLORS.surface, color: COLORS.text, textAlign: 'center', letterSpacing: 4, marginBottom: 16 },
  errorText: { color: COLORS.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});