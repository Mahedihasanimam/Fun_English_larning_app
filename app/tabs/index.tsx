import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import CatTeacher from '@/components/CatTeacher';
import XPBar from '@/components/XPBar';
import PressableCard from '@/components/PressableCard';
import { MINI_GAMES, ACHIEVEMENTS } from '@/constants/gameData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

export default function HomeScreen() {
  const store = useGameStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 600, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Sky gradient background */}
      <LinearGradient colors={['#87CEEB', '#B3E5FC', '#E3F2FD']} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* ─── HEADER ─── */}
        <LinearGradient
          colors={['#FF7043', '#FF8A65', '#FFB74D']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Top pills */}
          <View style={styles.headerTop}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>🪙 {store.coins}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>🔥 {store.streak} Day</Text>
            </View>
          </View>

          {/* Cat character */}
          <View style={styles.catWrap}>
            <CatTeacher size={110} showBubble animate />
          </View>

          <Text style={styles.appTitle}>✨ Fun English Academy</Text>
          <Text style={styles.appSub}>Learn English through fun adventures!</Text>

          <XPBar
            level={store.level}
            xpCurrent={store.xpInCurrentLevel}
            xpMax={store.XP_PER_LEVEL}
            progress={store.xpProgress}
            light
          />
        </LinearGradient>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ─── DAILY CHALLENGE ─── */}
          <SectionHeader title="📅 Today's Challenge" right={`${3 - store.challengesDoneToday} left`} />
          <PressableCard onPress={() => router.push('/challenge')} style={styles.dailyCard}>
            <LinearGradient
              colors={['#26C6DA', '#00ACC1']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.dailyInner}
            >
              <View style={styles.dailyIconWrap}><Text style={styles.dailyIcon}>📝</Text></View>
              <View style={styles.dailyText}>
                <Text style={styles.dailyTag}>🔥 Day {store.streak} Streak</Text>
                <Text style={styles.dailyTitle}>Fill in the Blank!</Text>
                <Text style={styles.dailySub}>Grammar · 3 questions · ~2 min</Text>
              </View>
              <View style={styles.dailyArrow}><Text style={{ fontSize: 18 }}>▶</Text></View>
            </LinearGradient>
          </PressableCard>

          {/* ─── LUCKY WHEEL ─── */}
          <PressableCard onPress={() => router.push('/rewards')} style={styles.wheelCard}>
            <LinearGradient
              colors={['#FFC107', '#FF8F00']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.wheelInner}
            >
              <Text style={styles.wheelEmoji}>🎡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wheelTitle}>Lucky Spin!</Text>
                <Text style={styles.wheelSub}>Win coins, hints & surprises</Text>
              </View>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>{store.hasSpunWheel ? 'Used' : '1 FREE'}</Text>
              </View>
            </LinearGradient>
          </PressableCard>

          {/* ─── STORY MODE ─── */}
          <SectionHeader title="📚 Story Mode" right="All chapters →" onRight={() => router.push('/tabs/story')} />
          <PressableCard onPress={() => router.push('/story')} style={styles.storyCard}>
            <LinearGradient
              colors={['#EC407A', '#D81B60']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.storyInner}
            >
              <View style={styles.storyImg}><Text style={{ fontSize: 38 }}>🏫</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.storyChip}>📍 Chapter {store.storyScenesCompleted.length + 1} · Beginner</Text>
                <Text style={styles.storyTitle}>Mia's Big Adventure</Text>
                <View style={styles.storyProgressRow}>
                  <View style={styles.storyBarWrap}>
                    <View style={[styles.storyBar, { width: `${(store.storyScenesCompleted.length / 6) * 100}%` }]} />
                  </View>
                  <Text style={styles.storyPct}>{Math.round((store.storyScenesCompleted.length / 6) * 100)}%</Text>
                </View>
              </View>
            </LinearGradient>
          </PressableCard>

          {/* ─── MINI GAMES ─── */}
          <SectionHeader title="🎮 Mini-Games" right="See all →" onRight={() => router.push('/tabs/games')} />
          <View style={styles.gamesGrid}>
            {MINI_GAMES.map((game) => {
              const locked = store.level < game.unlockLevel;
              return (
                <PressableCard
                  key={game.id}
                  onPress={() => !locked && router.push(`/games/${game.type}`)}
                  style={[styles.gameCard, { width: CARD_WIDTH }]}
                >
                  <LinearGradient
                    colors={[game.color, game.shadowColor]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.gameInner}
                  >
                    <Text style={styles.gameEmoji}>{game.emoji}</Text>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameSub}>{game.description}</Text>
                    {locked && (
                      <View style={styles.lockBadge}>
                        <Text style={styles.lockText}>🔒 Lv {game.unlockLevel}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </PressableCard>
              );
            })}
          </View>

          {/* ─── ACHIEVEMENTS ─── */}
          <SectionHeader title="🏅 Achievements" right="View all →" onRight={() => router.push('/tabs/rewards')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achScroll}>
            {ACHIEVEMENTS.slice(0, 5).map((ach) => (
              <View key={ach.id} style={[styles.achCard, { backgroundColor: ach.bg }]}>
                <Text style={styles.achEmoji}>{ach.emoji}</Text>
                <Text style={styles.achName}>{ach.title}</Text>
                <Text style={styles.achSub}>{ach.unlocked ? 'Earned!' : `${ach.current}/${ach.target}`}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function SectionHeader({ title, right, onRight }: { title: string; right?: string; onRight?: () => void }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {right && (
        <TouchableOpacity onPress={onRight}>
          <Text style={styles.sectionRight}>{right}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  header: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radii.full, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
  },
  pillText: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.white },
  catWrap: { alignItems: 'center', marginBottom: 4 },
  appTitle: { fontFamily: Fonts.display, fontSize: 24, color: Colors.white, textAlign: 'center', marginBottom: 2, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  appSub: { fontFamily: Fonts.bodyMed, fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 12 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 16 },
  sectionTitle: { fontFamily: Fonts.display, fontSize: 18, color: Colors.textDark },
  sectionRight: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.coral },

  // Daily challenge
  dailyCard: { marginBottom: 12, borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card },
  dailyInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: Radii.xl },
  dailyIconWrap: { width: 58, height: 58, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  dailyIcon: { fontSize: 28 },
  dailyText: { flex: 1 },
  dailyTag: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  dailyTitle: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white, marginBottom: 2 },
  dailySub: { fontFamily: Fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  dailyArrow: { width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },

  // Wheel
  wheelCard: { marginBottom: 4, borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card },
  wheelInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: Radii.xl },
  wheelEmoji: { fontSize: 42 },
  wheelTitle: { fontFamily: Fonts.display, fontSize: 17, color: Colors.white, marginBottom: 2 },
  wheelSub: { fontFamily: Fonts.bodyBold, fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  freeBadge: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  freeBadgeText: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.white },

  // Story
  storyCard: { marginBottom: 4, borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card },
  storyInner: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 18, borderRadius: Radii.xl },
  storyImg: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  storyChip: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 5 },
  storyTitle: { fontFamily: Fonts.display, fontSize: 16, color: Colors.white, marginBottom: 8 },
  storyProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storyBarWrap: { flex: 1, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, height: 7, overflow: 'hidden' },
  storyBar: { height: '100%', backgroundColor: Colors.gold, borderRadius: 99 },
  storyPct: { fontFamily: Fonts.bodyBlack, fontSize: 10, color: 'rgba(255,255,255,0.9)' },

  // Games
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  gameCard: { borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card },
  gameInner: { padding: 16, borderRadius: Radii.xl, minHeight: 130 },
  gameEmoji: { fontSize: 34, marginBottom: 8 },
  gameName: { fontFamily: Fonts.display, fontSize: 14, color: Colors.white, marginBottom: 3, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  gameSub: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  lockBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  lockText: { fontFamily: Fonts.bodyBlack, fontSize: 9, color: 'rgba(255,255,255,0.9)' },

  // Achievements
  achScroll: { marginBottom: 4 },
  achCard: { width: 90, borderRadius: Radii.lg, padding: 12, alignItems: 'center', marginRight: 10, ...Shadow.card },
  achEmoji: { fontSize: 28, marginBottom: 6 },
  achName: { fontFamily: Fonts.bodyBlack, fontSize: 10, color: Colors.textDark, textAlign: 'center', lineHeight: 13, marginBottom: 3 },
  achSub: { fontFamily: Fonts.bodyMed, fontSize: 9, color: Colors.textLight, textAlign: 'center' },
});
