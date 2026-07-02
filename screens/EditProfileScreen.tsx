import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { EditProfile: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'> };

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

export default function EditProfileScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const raw = await AsyncStorage.getItem('safetrade_current_user');
      if (raw) {
        const user = JSON.parse(raw);
        setFullName(user.fullName || '');
        setStudentId(user.studentId || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    const raw = await AsyncStorage.getItem('safetrade_current_user');
    const currentUser = raw ? JSON.parse(raw) : {};
    const updatedUser = { ...currentUser, fullName, studentId, email, phone };

    await AsyncStorage.setItem('safetrade_current_user', JSON.stringify(updatedUser));

    const usersRaw = await AsyncStorage.getItem('safetrade_users');
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      const updatedUsers = users.map((u: any) =>
        u.email === currentUser.email ? updatedUser : u
      );
      await AsyncStorage.setItem('safetrade_users', JSON.stringify(updatedUsers));
    }

    Alert.alert('Saved', 'Your profile has been updated.');
    navigation.goBack();
  };

  if (loading) return <SafeAreaView style={styles.container} />;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Student ID</Text>
        <TextInput style={styles.input} value={studentId} onChangeText={setStudentId} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="055 000 0000" placeholderTextColor={COLORS.subtext} keyboardType="phone-pad" />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginLeft: 8 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: COLORS.text, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: COLORS.surface, color: COLORS.text },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});