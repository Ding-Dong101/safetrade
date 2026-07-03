import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = { ChatDetail: { name: string; lastMessage: string } };
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChatDetail'>;
  route: RouteProp<RootStackParamList, 'ChatDetail'>;
};

const COLORS = { bg: '#FFFFFF', surface: '#F5F6F8', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280', border: '#E5E7EB' };

type Message = { id: string; text: string; fromMe: boolean };

export default function ChatDetailScreen({ navigation, route }: Props) {
  const { name, lastMessage } = route.params;
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hi! Is this still available?', fromMe: true },
    { id: '2', text: lastMessage, fromMe: false },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), text: input, fromMe: true }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Ionicons name="person" size={18} color={COLORS.subtext} />
          </View>
          <Text style={styles.headerName}>{name}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.fromMe ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={[styles.bubbleText, item.fromMe && styles.bubbleTextMine]}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.subtext}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginRight: 8 },
  headerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  listContent: { padding: 16 },
  bubble: { maxWidth: '75%', borderRadius: 14, padding: 12, marginBottom: 10 },
  bubbleMine: { backgroundColor: COLORS.primary, alignSelf: 'flex-end' },
  bubbleTheirs: { backgroundColor: COLORS.surface, alignSelf: 'flex-start' },
  bubbleText: { fontSize: 13, color: COLORS.text },
  bubbleTextMine: { color: '#FFFFFF' },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, color: COLORS.text, marginRight: 10 },
  sendButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
});