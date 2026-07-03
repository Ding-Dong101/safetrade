import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', primarySoft: '#EFF6FF', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB', red: '#DC2626' };

const CATEGORY_OPTIONS = ['Electronics', 'Books', 'Furniture', 'Food', 'Fashion', 'Other'];
const CONDITION_OPTIONS = ['New', 'Like New', 'Used', 'Fair'];

export default function SellScreen() {
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [condition, setCondition] = useState('Used');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState('');

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload an item picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.length > 0) setPhotoUri(result.assets[0].uri);
  };

  const handleSubmit = () => {
    if (!itemName || !price || !description || !category || !photoUri) {
      setError('Please fill in every field and add a photo.');
      return;
    }
    setError('');
    Alert.alert('Listed!', 'Your item is now live on the marketplace.');
    setItemName(''); setPrice(''); setDescription(''); setCategory(''); setPhotoUri(null); setCondition('Used');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>List an Item</Text>
          <Text style={styles.subtitle}>Fill in the details below to list your item for sale</Text>

          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={30} color={COLORS.primary} />
                <Text style={styles.uploadText}>Add Photos</Text>
                <Text style={styles.uploadSubtext}>Tap to upload images</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput style={styles.input} placeholder="e.g. iPhone 13" placeholderTextColor={COLORS.subtext} value={itemName} onChangeText={setItemName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price (GHS)</Text>
            <TextInput style={styles.input} placeholder="e.g. 2500" placeholderTextColor={COLORS.subtext} keyboardType="numeric" value={price} onChangeText={setPrice} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
              <Text style={category ? styles.dropdownTextFilled : styles.dropdownText}>{category || 'Select a category'}</Text>
              <Ionicons name={showCategoryPicker ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.subtext} />
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.dropdownMenu}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt} style={styles.dropdownItem} onPress={() => { setCategory(opt); setShowCategoryPicker(false); }}>
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Condition</Text>
            <View style={styles.conditionRow}>
              {CONDITION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.conditionPill, condition === opt && styles.conditionPillActive]}
                  onPress={() => setCondition(opt)}
                >
                  <Text style={[styles.conditionPillText, condition === opt && styles.conditionPillTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the item's condition and details..."
              placeholderTextColor={COLORS.subtext}
              multiline
              numberOfLines={4}
              maxLength={500}
              value={description}
              onChangeText={setDescription}
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>List Item</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.subtext, marginBottom: 20 },
  uploadBox: { height: 150, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, borderStyle: 'dashed', backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden' },
  uploadText: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginTop: 8 },
  uploadSubtext: { color: COLORS.subtext, fontSize: 11, marginTop: 2 },
  previewImage: { width: '100%', height: '100%' },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, color: COLORS.text, marginBottom: 8, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: COLORS.bg, color: COLORS.text },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  charCount: { fontSize: 10, color: COLORS.subtext, textAlign: 'right', marginTop: 4 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: COLORS.bg },
  dropdownText: { fontSize: 14, color: COLORS.subtext },
  dropdownTextFilled: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  dropdownMenu: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { fontSize: 13, color: COLORS.text },
  conditionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  conditionPill: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, marginBottom: 8 },
  conditionPillActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySoft },
  conditionPillText: { fontSize: 12, color: COLORS.subtext, fontWeight: '600' },
  conditionPillTextActive: { color: COLORS.primary },
  errorText: { color: COLORS.red, fontSize: 13, marginBottom: 12, textAlign: 'center' },
  submitButton: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});