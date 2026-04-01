import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { STORY_SCENES } from '@/constants/gameData';
import PressableCard from '@/components/PressableCard';

const DIFF_COLORS: Record<string, [string, string]> = {
  beginner: ['#66BB6A', '#2E7D32'],
  intermediate: ['#42A5F5', '#1565C0'],
  advanced: ['#AB47BC', '#6A1B9A'],
};

const DIFF_LABELS: Record<string, string> = {
  beginner: '🌱 Beginner',
  intermediate: '🔥 Intermediate',
  advanced: '⚡ Advanced',
};

export default function StoryTabScreen() {
  const store = useGameStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const isSceneUnlocked = (sceneId: number) => {
    if (sceneId === 1) return true;
    return store.storyScenesCompleted.includes(sceneId - 1);
  };

  const completedCount = store.storyScenesCompleted.length;
  const unlockedCount = STORY_SCENES.filter((scene) => isSceneUnlocked(scene.id)).length;
  const progressPct = Math.round((completedCount / STORY_SCENES.length) * 100);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#87CEEB', '#B3E5FC', '#E3F2FD']} style={StyleSheet.absoluteFill} />

      {/* Hero */}
      <LinearGradient
        colors={['#EC407A', '#D81B60']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroOrbA} />
        <View style={styles.heroOrbB} />

        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroEyebrow}>Adventure Track</Text>
            <Text style={styles.heroTitle}>Story Mode</Text>
            <Text style={styles.heroSub}>Play chapters, pick words, unlock scenes</Text>
          </View>

          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeValue}>{completedCount}/{STORY_SCENES.length}</Text>
            <Text style={styles.heroBadgeLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.heroProgressWrap}>
          <View style={styles.heroProgressTrack}>
            <View style={[styles.heroProgressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.heroProgressText}>{progressPct}% complete</Text>
        </View>
      </LinearGradient>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📖</Text>
          <View>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⭐</Text>
          <View>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔒</Text>
          <View>
            <Text style={styles.statValue}>{Math.max(STORY_SCENES.length - unlockedCount, 0)}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mia&apos;s Big Adventure</Text>
        <Text style={styles.sectionSub}>Follow the path from chapter 1 to final scene</Text>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {STORY_SCENES.map((scene, idx) => {
          const unlocked = isSceneUnlocked(scene.id);
          const completed = store.storyScenesCompleted.includes(scene.id);
          const colors = DIFF_COLORS[scene.difficulty];

          return (
            <View key={scene.id} style={styles.sceneRow}>
              {/* Connector line */}
              {idx < STORY_SCENES.length - 1 && (
                <View style={[styles.connector, completed && styles.connectorDone]} />
              )}

              {/* Chapter number bubble */}
              <View style={[styles.chapterNum, completed && styles.chapterNumDone, !unlocked && styles.chapterNumLocked]}>
                <Text style={styles.chapterNumText}>{completed ? '✓' : !unlocked ? '🔒' : String(scene.chapter)}</Text>
              </View>

              <View style={styles.sceneCardWrap}>
                <PressableCard
                  onPress={() => unlocked && router.push({ pathname: '/story', params: { sceneId: scene.id } })}
                  style={unlocked ? styles.sceneCard : { ...styles.sceneCard, ...styles.sceneCardLocked }}
                >
                  <LinearGradient
                    colors={unlocked ? colors : ['#CFD8DC', '#B0BEC5']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.sceneInner}
                  >
                    <Text style={styles.sceneEmoji}>{scene.bgEmoji}</Text>
                    <View style={styles.sceneContent}>
                      <Text style={styles.diffBadge}>{DIFF_LABELS[scene.difficulty]}</Text>
                      <Text style={styles.sceneSetting}>Chapter {scene.chapter} • {scene.setting}</Text>
                      <Text style={styles.sceneNarrator} numberOfLines={2}>{scene.narrator}</Text>
                      <Text style={styles.sceneCta}>{unlocked ? 'Tap to play chapter' : 'Finish previous chapter to unlock'}</Text>
                    </View>
                    {completed && <Text style={styles.completedStar}>⭐</Text>}
                  </LinearGradient>
                </PressableCard>
              </View>
            </View>
          );
        })}

        {/* Premium teaser */}
        <View style={styles.premiumCard}>
          <LinearGradient colors={['#FFC107', '#FF8F00']} style={styles.premiumInner}>
            <Text style={styles.premiumEmoji}>👑</Text>
            <Text style={styles.premiumTitle}>More stories coming!</Text>
            <Text style={styles.premiumSub}>Unlock Premium for unlimited chapters</Text>
            <TouchableOpacity style={styles.premiumBtn}>
              <Text style={styles.premiumBtnText}>Get Premium ✨</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 110 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    marginHorizontal: 14,
    marginTop: 46,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    ...Shadow.pop,
  },
  heroOrbA: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -34,
    right: -28,
  },
  heroOrbB: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: -30,
    left: -20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroEyebrow: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' },
  heroTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.white, lineHeight: 32 },
  heroSub: { fontFamily: Fonts.bodyMed, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 64,
  },
  heroBadgeValue: { fontFamily: Fonts.display, fontSize: 16, color: Colors.white },
  heroBadgeLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.9)' },
  heroProgressWrap: { gap: 6 },
  heroProgressTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.28)', borderRadius: 99, overflow: 'hidden' },
  heroProgressFill: { height: '100%', backgroundColor: Colors.white, borderRadius: 99 },
  heroProgressText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: 'rgba(255,255,255,0.92)' },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 14,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 12,
    ...Shadow.card,
  },
  statEmoji: { fontSize: 20 },
  statValue: { fontFamily: Fonts.display, fontSize: 16, color: Colors.textDark, lineHeight: 18 },
  statLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.textLight },

  sectionHeader: {
    marginTop: 14,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: { fontFamily: Fonts.display, fontSize: 20, color: Colors.textDark },
  sectionSub: { fontFamily: Fonts.bodyMed, fontSize: 12, color: Colors.textLight },

  list: { paddingHorizontal: 16, paddingTop: 12 },

  sceneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, position: 'relative' },
  connector: { position: 'absolute', left: 18, top: 44, width: 2, bottom: -16, backgroundColor: Colors.border, zIndex: 0 },
  connectorDone: { backgroundColor: Colors.pink },
  chapterNum: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
    zIndex: 1, marginTop: 16, flexShrink: 0,
    ...Shadow.card,
  },
  chapterNumDone: { backgroundColor: Colors.pink },
  chapterNumLocked: { backgroundColor: '#B0BEC5' },
  chapterNumText: { fontFamily: Fonts.bodyBlack, fontSize: 14, color: Colors.white },

  sceneCardWrap: { flex: 1, alignSelf: 'stretch' },
  sceneCard: { width: '100%', borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card },
  sceneCardLocked: { opacity: 0.7 },
  sceneInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radii.xl, minHeight: 108 },
  sceneContent: { flex: 1, justifyContent: 'center' },
  sceneEmoji: { fontSize: 34 },
  diffBadge: { fontFamily: Fonts.bodyBlack, fontSize: 9, color: 'rgba(255,255,255,0.9)', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  sceneSetting: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.white, marginBottom: 3 },
  sceneNarrator: { fontFamily: Fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.85)', lineHeight: 15, marginBottom: 4 },
  sceneCta: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.95)' },
  completedStar: { fontSize: 20 },

  premiumCard: { borderRadius: Radii.xl, overflow: 'hidden', marginTop: 8, ...Shadow.pop },
  premiumInner: { padding: 24, alignItems: 'center', borderRadius: Radii.xl },
  premiumEmoji: { fontSize: 42, marginBottom: 10 },
  premiumTitle: { fontFamily: Fonts.display, fontSize: 20, color: Colors.white, marginBottom: 6 },
  premiumSub: { fontFamily: Fonts.bodyMed, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 18, textAlign: 'center' },
  premiumBtn: { backgroundColor: Colors.white, borderRadius: Radii.lg, paddingHorizontal: 28, paddingVertical: 12 },
  premiumBtnText: { fontFamily: Fonts.display, fontSize: 16, color: Colors.goldDark },
});
