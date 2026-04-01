import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { WORD_HUNT_GRID, WORD_HUNT_WORDS } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';

interface Cell { row: number; col: number; }

export default function WordHuntScreen() {
  const store = useGameStore();
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<Cell[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastFound, setLastFound] = useState('');

  const bounceAnims = useRef(
    WORD_HUNT_WORDS.map(() => new Animated.Value(1))
  ).current;

  const checkSelection = (cells: Cell[]) => {
    const word = cells.map(c => WORD_HUNT_GRID[c.row][c.col]).join('');
    const reversed = word.split('').reverse().join('');
    const match = WORD_HUNT_WORDS.find(w => w === word || w === reversed);
    if (match && !foundWords.includes(match)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const idx = WORD_HUNT_WORDS.indexOf(match);
      Animated.sequence([
        Animated.spring(bounceAnims[idx], { toValue: 1.3, useNativeDriver: true, tension: 200 }),
        Animated.spring(bounceAnims[idx], { toValue: 1, useNativeDriver: true, tension: 200 }),
      ]).start();
      const newFound = [...foundWords, match];
      setFoundWords(newFound);
      setLastFound(match);
      if (newFound.length === WORD_HUNT_WORDS.length) {
        store.addCoins(30);
        store.addXP(20);
        setTimeout(() => setShowModal(true), 500);
      }
    }
  };

  const isSelected = (r: number, c: number) => selected.some(s => s.row === r && s.col === c);
  const isCellFound = (r: number, c: number) => {
    for (const word of foundWords) {
      const cells = findWordCells(word);
      if (cells.some(s => s.row === r && s.col === c)) return true;
    }
    return false;
  };

  const findWordCells = (word: string): Cell[] => {
    const rows = WORD_HUNT_GRID.length;
    const cols = WORD_HUNT_GRID[0].length;
    const dirs = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[-1,-1],[1,-1],[-1,1]];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        for (const [dr, dc] of dirs) {
          const cells: Cell[] = [];
          let match = true;
          for (let i = 0; i < word.length; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || WORD_HUNT_GRID[nr][nc] !== word[i]) {
              match = false; break;
            }
            cells.push({ row: nr, col: nc });
          }
          if (match) return cells;
        }
      }
    }
    return [];
  };

  const handleCellPress = (r: number, c: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cell = { row: r, col: c };
    if (selected.length === 0) {
      setSelected([cell]);
    } else {
      const newSel = [...selected, cell];
      setSelected(newSel);
      checkSelection(newSel);
      if (newSel.length >= 8) setSelected([]);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#AB47BC', '#7B1FA2']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔍 Word Hunt</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{foundWords.length}/{WORD_HUNT_WORDS.length}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>Tap letters to spell the words below!</Text>

        {/* Clear button */}
        <TouchableOpacity onPress={() => setSelected([])} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear ✕</Text>
        </TouchableOpacity>

        {/* Grid */}
        <View style={styles.gridWrap}>
          <View style={styles.grid}>
            {WORD_HUNT_GRID.map((row, r) => (
              <View key={r} style={styles.row}>
                {row.map((letter, c) => {
                  const sel = isSelected(r, c);
                  const found = isCellFound(r, c);
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.cell, sel && styles.cellSelected, found && styles.cellFound]}
                      onPress={() => handleCellPress(r, c)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cellText, (sel || found) && styles.cellTextActive]}>
                        {letter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Current selection */}
        {selected.length > 0 && (
          <View style={styles.currentWord}>
            <Text style={styles.currentWordText}>
              {selected.map(c => WORD_HUNT_GRID[c.row][c.col]).join('')}
            </Text>
          </View>
        )}

        {/* Word list */}
        <ScrollView contentContainerStyle={styles.wordList} showsVerticalScrollIndicator={false}>
          {WORD_HUNT_WORDS.map((word, i) => {
            const done = foundWords.includes(word);
            return (
              <Animated.View
                key={word}
                style={[styles.wordChip, done && styles.wordChipDone, { transform: [{ scale: bounceAnims[i] }] }]}
              >
                <Text style={[styles.wordChipText, done && styles.wordChipTextDone]}>
                  {done ? `✓ ${word}` : word}
                </Text>
              </Animated.View>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <RewardModal
        visible={showModal}
        emoji="🔍"
        title="All Found!"
        subtitle="You found all the hidden words!"
        coins={30}
        xp={20}
        onClose={() => { setShowModal(false); router.back(); }}
        buttonText="🏠 Back to Games"
      />
    </View>
  );
}

const CELL_SIZE = 46;

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: Colors.white, fontFamily: Fonts.display },
  headerTitle: { flex: 1, fontFamily: Fonts.display, fontSize: 22, color: Colors.white },
  scorePill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 },
  scoreText: { fontFamily: Fonts.bodyBlack, fontSize: 14, color: Colors.white },
  instruction: { fontFamily: Fonts.bodyMed, fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', paddingHorizontal: 16, marginBottom: 4 },
  clearBtn: { alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 5, marginBottom: 8 },
  clearText: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: Colors.white },

  gridWrap: { alignItems: 'center', marginBottom: 10 },
  grid: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: Radii.xl, padding: 10, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  row: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  cell: { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  cellSelected: { backgroundColor: Colors.gold, borderColor: Colors.goldDark },
  cellFound: { backgroundColor: Colors.green, borderColor: Colors.greenDark },
  cellText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
  cellTextActive: { color: Colors.white },

  currentWord: { alignSelf: 'center', backgroundColor: Colors.white, borderRadius: 99, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 8, ...Shadow.card },
  currentWordText: { fontFamily: Fonts.display, fontSize: 20, color: Colors.purpleDark },

  wordList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 20, justifyContent: 'center' },
  wordChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  wordChipDone: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wordChipText: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.white },
  wordChipTextDone: { color: Colors.greenDark },
});
