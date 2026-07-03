import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { InviteFriends: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, any> };

const COLORS = { bg: '#FFFFFF', primary: '#0F62FE', text: '#1A1A1A', subtext: '#6B7280' };

export default function InviteFriendsScreen({ navigation }: Props) {
  const handleShare = () => {
    Share.share({ message: 'Join me on SafeTrade — buy and sell safely on campus! 🎓' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Invite Friends</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎁</Text>
        <Text style={styles.heading}>Earn GHS 10 per friend</Text>
        <Text style={styles.body}>Invite friends to SafeTrade. When they make their first trade, you both earn GHS 10!</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share Invite Link</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginLeft: 10 },
  content: { alignItems: 'center', paddingTop: 40 },
  emoji: { fontSize: 56, marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  body: { fontSize: 13, color: COLORS.subtext, textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 20 },
  shareButton: { flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  shareButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginLeft: 8 },
});