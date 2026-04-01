import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import XPBar from '@/components/XPBar';
import CatTeacher from '@/components/CatTeacher';

const LEVEL_NAMES = [
  '', 'Starter 🌱', 'Explorer 🗺️', 'Learner 📖', 'Scholar 🎓',
  'Explorer 🗺️', 'Champion 🏆', 'Master ⭐', 'Legend 🌟', 'Genius 💎', 'Professor 👑',
];

export default function ProfileScreen() {
  const store = useGameStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const levelName = LEVEL_NAMES[Math.min(store.level, LEVEL_NAMES.length - 1)];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#87CEEB', '#B3E5FC', '#E3F2FD']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <LinearGradient
        colors={['#AB47BC', '#7B1FA2']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatarWrap}>
          <CatTeacher size={90} showBubble={false} animate />
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Little Scholar</Text>
        <Text style={styles.userLevel}>Level {store.level} · {levelName}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>🔥 {store.streak} Streak</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>🪙 {store.coins} Coins</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>💬 {store.totalWordsLearned} Words</Text></View>
        </View>

        <View style={{ paddingHorizontal: 8, marginTop: 8 }}>
          <XPBar
            level={store.level}
            xpCurrent={store.xpInCurrentLevel}
            xpMax={store.XP_PER_LEVEL}
            progress={store.xpProgress}
            light
          />
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── STATS GRID ─── */}
        <Text style={styles.sectionTitle}>📊 My Stats</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'Challenges Done', val: store.challengesDoneToday, emoji: '📝', bg: '#E3F2FD' },
            { label: 'Story Scenes', val: store.storyScenesCompleted.length, emoji: '📖', bg: '#FCE4EC' },
            { label: 'Words Learned', val: store.totalWordsLearned, emoji: '💬', bg: '#E8F5E9' },
            { label: 'Day Streak', val: store.streak, emoji: '🔥', bg: '#FBE9E7' },
            { label: 'Total XP', val: store.xp, emoji: '⚡', bg: '#F3E5F5' },
            { label: 'Coins Earned', val: store.coins, emoji: '🪙', bg: '#FFF8E1' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <Text style={styles.statEmoji}>{stat.emoji}</Text>
              <Text style={styles.statVal}>{stat.val}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── CURRENT LEVEL CARD ─── */}
        <Text style={styles.sectionTitle}>🎯 Level Progress</Text>
        <View style={styles.levelCard}>
          <LinearGradient colors={['#AB47BC', '#7B1FA2']} style={styles.levelInner}>
            <View style={styles.levelLeft}>
              <Text style={styles.levelNum}>Level {store.level}</Text>
              <Text style={styles.levelName}>{levelName}</Text>
              <Text style={styles.levelXP}>{store.xpInCurrentLevel} / {store.XP_PER_LEVEL} XP to next level</Text>
            </View>
            <View style={styles.levelRight}>
              <Text style={styles.levelEmoji}>🏆</Text>
              <Text style={styles.levelNextLabel}>Next: Level {store.level + 1}</Text>
              <Text style={styles.levelNextName}>{LEVEL_NAMES[Math.min(store.level + 1, LEVEL_NAMES.length - 1)]}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ─── SETTINGS ─── */}
        <Text style={styles.sectionTitle}>⚙️ Settings</Text>
        {[
          { icon: '🔔', label: 'Daily Reminders', sub: 'Get notified at 6:00 PM', hasToggle: true },
          { icon: '🔊', label: 'Sound Effects', sub: 'Coins, correct answers & more', hasToggle: true },
          { icon: '🌍', label: 'Language', sub: 'Bengali (বাংলা)', hasToggle: false },
          { icon: '👑', label: 'Premium Plan', sub: 'Unlock all features', hasToggle: false },
          { icon: '📤', label: 'Share Progress', sub: 'Share with friends for bonus coins', hasToggle: false },
          { icon: '❓', label: 'Help & Support', sub: 'FAQs and contact us', hasToggle: false },
          { icon: '🔒', label: 'Privacy Policy', sub: 'Safe for kids 8+', hasToggle: false },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.settingRow} activeOpacity={0.75}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingIconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <Text style={styles.settingSub}>{item.sub}</Text>
            </View>
            {item.hasToggle ? (
              <View style={styles.toggle}>
                <View style={styles.toggleThumb} />
              </View>
            ) : (
              <Text style={styles.settingArrow}>›</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Premium banner */}
        <TouchableOpacity activeOpacity={0.9} style={{ borderRadius: Radii.xl, overflow: 'hidden', marginTop: 8 }}>
          <LinearGradient colors={['#FFC107', '#FF6F00']} style={styles.premiumBanner}>
            <Text style={styles.premiumEmoji}>👑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Go Premium!</Text>
              <Text style={styles.premiumSub}>Unlock all stories, games & more</Text>
            </View>
            <View style={styles.premiumPrice}>
              <Text style={styles.premiumPriceText}>$2.99/mo</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 110 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  avatarWrap: { position: 'relative', marginBottom: 10 },
  editBtn: { position: 'absolute', bottom: 0, right: -8, backgroundColor: Colors.white, borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
  editBtnText: { fontSize: 14 },
  userName: { fontFamily: Fonts.display, fontSize: 22, color: Colors.white, marginBottom: 4 },
  userLevel: { fontFamily: Fonts.bodyMed, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.full, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  badgeText: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.white },

  content: { padding: 16 },
  sectionTitle: { fontFamily: Fonts.display, fontSize: 18, color: Colors.textDark, marginBottom: 12, marginTop: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  statCard: { width: '30.5%', borderRadius: Radii.lg, padding: 12, alignItems: 'center', ...Shadow.card },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statVal: { fontFamily: Fonts.display, fontSize: 20, color: Colors.textDark, marginBottom: 2 },
  statLabel: { fontFamily: Fonts.bodyBold, fontSize: 9, color: Colors.textLight, textAlign: 'center' },

  levelCard: { borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card, marginBottom: 4 },
  levelInner: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: Radii.xl },
  levelLeft: { flex: 1 },
  levelNum: { fontFamily: Fonts.display, fontSize: 20, color: Colors.white },
  levelName: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8 },
  levelXP: { fontFamily: Fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  levelRight: { alignItems: 'center' },
  levelEmoji: { fontSize: 38, marginBottom: 4 },
  levelNextLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.75)' },
  levelNextName: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.white },

  settingRow: {
    backgroundColor: Colors.white, borderRadius: Radii.xl, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 10, ...Shadow.card,
  },
  settingIcon: { width: 42, height: 42, backgroundColor: Colors.bgLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingIconText: { fontSize: 20 },
  settingLabel: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.textDark, marginBottom: 2 },
  settingSub: { fontFamily: Fonts.bodyMed, fontSize: 11, color: Colors.textLight },
  settingArrow: { fontSize: 22, color: Colors.textLight, fontFamily: Fonts.bodyBold },
  toggle: { width: 44, height: 24, backgroundColor: Colors.green, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, backgroundColor: Colors.white, borderRadius: 10, alignSelf: 'flex-end' },

  premiumBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: Radii.xl },
  premiumEmoji: { fontSize: 36 },
  premiumTitle: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white, marginBottom: 2 },
  premiumSub: { fontFamily: Fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  premiumPrice: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radii.lg, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  premiumPriceText: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.white },
});
