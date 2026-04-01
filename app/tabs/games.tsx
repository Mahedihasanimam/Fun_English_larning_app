import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { MINI_GAMES } from '@/constants/gameData';
import PressableCard from '@/components/PressableCard';

const GAME_ROUTES: Record<string, string> = {
  'word-hunt': '/games/word-hunt',
  'sentence-builder': '/games/sentence-builder',
  'typing': '/games/typing',
  'flashcard': '/games/flashcards',
};

export default function GamesTabScreen() {
  const store = useGameStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = MINI_GAMES.map(() => useRef(new Animated.Value(40)).current);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    slideAnims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: 0, delay: 100 + i * 80, useNativeDriver: true,
        tension: 80, friction: 10,
      }).start();
    });
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#87CEEB', '#B3E5FC', '#E3F2FD']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <LinearGradient
        colors={['#66BB6A', '#43A047']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🎮 Mini-Games</Text>
        <Text style={styles.headerSub}>Play & earn coins!</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statVal}>{store.miniGamesUnlocked.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statVal}>{MINI_GAMES.length - store.miniGamesUnlocked.length}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statVal}>Lv {store.level}</Text>
            <Text style={styles.statLabel}>Your Level</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1, opacity: 1 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listLabel}>Choose a game to play:</Text>

        {MINI_GAMES.map((game, idx) => {
          const locked = store.level < game.unlockLevel;
          const route = GAME_ROUTES[game.type];

          return (
            <Animated.View
              key={game.id}
              style={{ transform: [{ translateY: slideAnims[idx] }], opacity: fadeAnim }}
            >
              <PressableCard
                onPress={() => !locked && router.push(route as any)}
                style={[styles.gameCard, locked && styles.gameCardLocked]}
              >
                <LinearGradient
                  colors={locked ? ['#CFD8DC', '#B0BEC5'] : [game.color, game.shadowColor]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.gameInner}
                >
                  {/* Left icon */}
                  <View style={styles.gameIconWrap}>
                    <Text style={styles.gameEmoji}>{game.emoji}</Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameDesc}>{game.description}</Text>

                    <View style={styles.tagRow}>
                      {locked ? (
                        <View style={styles.lockTag}>
                          <Text style={styles.lockTagText}>🔒 Unlock at Level {game.unlockLevel}</Text>
                        </View>
                      ) : (
                        <>
                          <View style={styles.tag}><Text style={styles.tagText}>+20 🪙</Text></View>
                          <View style={styles.tag}><Text style={styles.tagText}>+15 ⚡ XP</Text></View>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Arrow or lock */}
                  <View style={styles.gameArrow}>
                    <Text style={styles.gameArrowText}>{locked ? '🔒' : '▶'}</Text>
                  </View>
                </LinearGradient>
              </PressableCard>
            </Animated.View>
          );
        })}

        {/* Daily game tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Daily Tip</Text>
            <Text style={styles.tipText}>
              Play Word Hunt every day to build your vocabulary fast! Unlock Sentence Builder at Level 2.
            </Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerTitle: { fontFamily: Fonts.display, fontSize: 26, color: Colors.white, marginBottom: 4 },
  headerSub: { fontFamily: Fonts.bodyMed, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.lg, padding: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  statVal: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
  statLabel: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  list: { padding: 16 },
  listLabel: { fontFamily: Fonts.display, fontSize: 16, color: Colors.textDark, marginBottom: 14, marginTop: 4 },

  gameCard: { marginBottom: 14, borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.card },
  gameCardLocked: { opacity: 0.75 },
  gameInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: Radii.xl },
  gameIconWrap: {
    width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', flexShrink: 0,
  },
  gameEmoji: { fontSize: 32 },
  gameName: { fontFamily: Fonts.display, fontSize: 16, color: Colors.white, marginBottom: 3 },
  gameDesc: { fontFamily: Fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontFamily: Fonts.bodyBlack, fontSize: 10, color: Colors.white },
  lockTag: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
  lockTagText: { fontFamily: Fonts.bodyBlack, fontSize: 10, color: 'rgba(255,255,255,0.85)' },
  gameArrow: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  gameArrowText: { fontSize: 16, color: Colors.white },

  tipCard: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.xl, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1.5, borderColor: Colors.gold,
  },
  tipEmoji: { fontSize: 26 },
  tipTitle: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.goldDark, marginBottom: 4 },
  tipText: { fontFamily: Fonts.bodyMed, fontSize: 12, color: Colors.textMid, lineHeight: 18 },
});
