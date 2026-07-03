import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { ForgotPassword: undefined; Login: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'> };

const COLORS = { bg: '#F7F9FC', card: '#FFFFFF', primary: '#3B82F6', text: '#1F2937', subtext: '#6B7280', border: '#E5E7EB', red: '#EF4444' };

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleCheckEmail = async () => {
    if (!email) { setError('Please enter your email.'); return; }
    const existingRaw = await AsyncStorage.getItem('safetrade_users');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const found = existing.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) { setError('No account found with that email.'); return; }
    setError('');
    setStep('reset');
  };

  const handleResetPassword = async () => {
    if (!newPassword) { setError('Please enter a new password.'); return; }
    const existingRaw = await AsyncStorage.getItem('safetrade_users');
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    const updated = existing.map((u: any) =>
      u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u
    );
    await AsyncStorage.setItem('safetrade_users', JSON.stringify(updated));
    Alert.alert('Success', 'Your password has been reset. Please log in.');
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Reset Password</Text>

      {step === 'email' ? (
        <>
          <Text style={styles.subtitle}>Enter the email linked to your account</Text>
          <TextInput style={styles.input} placeholder="you@university.edu" placeholderTextColor={COLORS.subtext} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleCheckEmail}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Enter a new password for {email}</Text>
          <TextInput style={styles.input} placeholder="New password" placeholderTextColor={COLORS.subtext} secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 24 },
  backButtonText: { color: COLORS.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.subtext, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: COLORS.card, color: COLORS.text, marginBottom: 16 },
  errorText: { color: COLORS.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});