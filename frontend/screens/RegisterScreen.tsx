import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Splash: undefined; Login: undefined; Register: undefined; MainTabs: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> };

const COLORS = { bg: '#F7F9FC', card: '#FFFFFF', primary: '#3B82F6', text: '#1F2937', subtext: '#6B7280', border: '#E5E7EB', red: '#EF4444' };

export default function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!fullName || !studentId || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError('');
    setLoading(true);

    try {
      const existingRaw = await AsyncStorage.getItem('safetrade_users');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];

      const alreadyExists = existing.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (alreadyExists) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      const newUser = { fullName, studentId, email, password };
      existing.push(newUser);
      await AsyncStorage.setItem('safetrade_users', JSON.stringify(existing));
      await AsyncStorage.setItem('safetrade_current_user', JSON.stringify(newUser));

      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong creating your account. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor={COLORS.subtext} value={fullName} onChangeText={setFullName} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Student ID</Text>
          <TextInput style={styles.input} placeholder="Enter your student ID" placeholderTextColor={COLORS.subtext} value={studentId} onChangeText={setStudentId} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="you@university.edu" placeholderTextColor={COLORS.subtext} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor={COLORS.subtext} secureTextEntry value={password} onChangeText={setPassword} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput style={styles.input} placeholder="Confirm your password" placeholderTextColor={COLORS.subtext} secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateAccount} disabled={loading}>
          <Text style={styles.createButtonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, marginBottom: 28, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: COLORS.text, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: COLORS.card, color: COLORS.text },
  errorText: { color: COLORS.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  createButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});