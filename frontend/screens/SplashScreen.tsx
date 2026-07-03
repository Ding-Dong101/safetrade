import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Animated, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = { Splash: undefined; Login: undefined; RiderLogin: undefined; AdminLogin: undefined };
type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'> };

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  bg: '#0046E4',
  card: 'rgba(255, 255, 255, 0.12)',
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  white: '#FFFFFF',
  studentBlue: '#0046E4',
  subtext: 'rgba(255, 255, 255, 0.75)',
  accentBlue: '#38BDF8',
};

export default function SplashScreen({ navigation }: Props) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 2500, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 2500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        ])
      ])
    ).start();
  }, [floatAnim, pulseAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        bounces={false} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Top Header Badges */}
        <View style={styles.topRow}>
          <View style={styles.topBadge}>
            <Ionicons name="star" size={11} color={COLORS.white} />
            <Text style={styles.topBadgeText}>Trusted by 10K+ Students</Text>
          </View>
          <View style={styles.topBadge}>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.white} />
            <Text style={styles.topBadgeText}>100% Secure</Text>
          </View>
        </View>

        {/* Center Graphics Area */}
        <View style={styles.centerArea}>
          <Ionicons name="cube" size={24} color="rgba(255,255,255,0.08)" style={styles.iconTopLeft} />
          <Ionicons name="bag" size={24} color="rgba(255,255,255,0.08)" style={styles.iconTopRight} />
          <Ionicons name="shield" size={24} color="rgba(255,255,255,0.08)" style={styles.iconMidLeft} />
          <Ionicons name="school" size={24} color="rgba(255,255,255,0.08)" style={styles.iconMidRight} />

          <Animated.View style={[styles.bubbleOuter, { transform: [{ translateY: floatAnim }, { scale: pulseAnim }] }]}>
            <View style={styles.bubbleInner}>
              <MaterialCommunityIcons name="handshake" size={54} color="#FFD700" />
            </View>
          </Animated.View>
        </View>

        {/* App Branding Header */}
        <View style={styles.titleWrap}>
          <View style={styles.appNameRow}>
            <Text style={styles.appName}>SafeTrade</Text>
            {/* FIXED: Swapped to Octicons pack so "verified" works perfectly with no errors */}
            <Octicons name="verified" size={18} color={COLORS.accentBlue} style={styles.verifiedIcon} />
          </View>
          <Text style={styles.tagline}>Buy & sell safely on campus</Text>
        </View>

        {/* Feature Capsule */}
        <View style={styles.featureCapsule}>
          <Ionicons name="lock-closed" size={12} color={COLORS.white} style={{ marginRight: 5 }} />
          <Text style={styles.featureCapsuleText}>Secure  •  Simple  •  Student First</Text>
        </View>

        {/* Navigation Action Buttons Group */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.studentButton} onPress={() => navigation.navigate('Login')}>
            <Ionicons name="person-outline" size={18} color={COLORS.studentBlue} />
            <Text style={styles.studentButtonText}>Continue as Student</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.riderButton} onPress={() => navigation.navigate('RiderLogin')}>
            <Ionicons name="bicycle-outline" size={18} color={COLORS.white} />
            <Text style={styles.riderButtonText}>Rider Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminButton} onPress={() => navigation.navigate('AdminLogin')}>
            <Ionicons name="shield-outline" size={16} color={COLORS.white} />
            <Text style={styles.adminButtonText}>Admin Login</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Safety Text */}
        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark" size={13} color={COLORS.accentBlue} />
          <Text style={styles.footerText}>Your safety is our priority</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { flexGrow: 1, paddingHorizontal: 22, justifyContent: 'space-between', paddingBottom: 16, minHeight: SCREEN_HEIGHT - 60 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  topBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  topBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '600', marginLeft: 4 },
  centerArea: { alignItems: 'center', justifyContent: 'center', height: 170, position: 'relative', marginTop: 15 },
  iconTopLeft: { position: 'absolute', top: 5, left: 15, transform: [{ rotate: '-15deg' }] },
  iconTopRight: { position: 'absolute', top: 10, right: 15, transform: [{ rotate: '15deg' }] },
  iconMidLeft: { position: 'absolute', bottom: 10, left: 15, transform: [{ rotate: '-10deg' }] },
  iconMidRight: { position: 'absolute', bottom: 15, right: 15, transform: [{ rotate: '10deg' }] },
  bubbleOuter: { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255, 255, 255, 0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  bubbleInner: { width: 106, height: 106, borderRadius: 53, backgroundColor: 'rgba(255, 255, 255, 0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  titleWrap: { alignItems: 'center', marginTop: 10 },
  appNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  appName: { fontSize: 32, fontWeight: '800', color: COLORS.white, letterSpacing: 0.3 },
  verifiedIcon: { marginLeft: 6, marginTop: 4 },
  tagline: { fontSize: 14, color: COLORS.subtext, marginTop: 4, fontWeight: '500' },
  featureCapsule: { flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.15)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'center', marginTop: 12, alignItems: 'center' },
  featureCapsuleText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, fontWeight: '500' },
  buttonContainer: { marginTop: 20, width: '100%', gap: 10 },
  studentButton: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  studentButtonText: { color: COLORS.studentBlue, fontSize: 14, fontWeight: '700', marginLeft: 6 },
  riderButton: { flexDirection: 'row', backgroundColor: '#1E60FF', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  riderButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginLeft: 6 },
  adminButton: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  adminButtonText: { color: COLORS.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4, marginTop: 15 },
  footerText: { fontSize: 12, color: COLORS.subtext, marginLeft: 5, fontWeight: '500' },
});