import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { TYPING_WORDS } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';

const TIME_LIMIT = 30;

export default function TypingScreen() {
  const store = useGameStore();
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [correctCount, setCorrectCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const timeAnim = useRef(new Animated.Value(1)).current;
  const wordAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const currentWord = TYPING_WORDS[wordIdx % TYPING_WORDS.length];

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && started) {
      finishGame();
    }
    if (timeLeft <= 10) {
      Animated.timing(timeAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    }
  }, [timeLeft]);

  const startGame = () => {
    setStarted(true);
    setWordIdx(0);
    setInput('');
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(TIME_LIMIT);
    inputRef.current?.focus();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
  };

  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
    const coins = Math.min(correctCount * 5, 50);
    store.addCoins(coins);
    store.addXP(20);
    setTimeout(() => setShowModal(true), 500);
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (text.trim().toLowerCase() === currentWord.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Animate word out
      Animated.sequence([
        Animated.spring(wordAnim, { toValue: 1.15, useNativeDriver: true, tension: 200 }),
        Animated.timing(wordAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        setWordIdx(w => w + 1);
        setInput('');
        setCorrectCount(c => c + 1);
        setScore(s => s + 10);
        Animated.timing(wordAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      });
    }
  };

  const getLetterStyle = (letter: string, index: number) => {
    if (index >= input.length) return styles.letterDefault;
    if (input[index]?.toLowerCase() === letter.toLowerCase()) return styles.letterCorrect;
    return styles.letterWrong;
  };

  const timerColor = timeLeft > 15 ? Colors.green : timeLeft > 8 ? Colors.gold : Colors.coral;

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#FF7043', '#BF360C']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⌨️ Typing Race</Text>
          {started && !finished && (
            <View style={[styles.timerPill, { backgroundColor: timerColor }]}>
              <Text style={styles.timerText}>⏱ {timeLeft}s</Text>
            </View>
          )}
        </View>

        {!started ? (
          /* ─── Start screen ─── */
          <View style={styles.startScreen}>
            <Text style={styles.startEmoji}>⌨️</Text>
            <Text style={styles.startTitle}>Ready to race?</Text>
            <Text style={styles.startSub}>Type each word correctly as fast as you can!</Text>
            <View style={styles.rulesBox}>
              {['⏱ You have 30 seconds', '✅ Type the word correctly to score', '🪙 +5 coins per word', '⚡ Get a bonus for speed!'].map((r, i) => (
                <Text key={i} style={styles.ruleText}>{r}</Text>
              ))}
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={startGame} activeOpacity={0.85}>
              <LinearGradient colors={['#FFC107', '#FF8F00']} style={styles.startBtnInner}>
                <Text style={styles.startBtnText}>🚀 Start!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : finished ? (
          /* ─── Finished screen ─── */
          <View style={styles.finishScreen}>
            <Text style={styles.finishEmoji}>🏁</Text>
            <Text style={styles.finishTitle}>Time's up!</Text>
            <View style={styles.resultGrid}>
              <View style={styles.resultCard}><Text style={styles.resultVal}>{correctCount}</Text><Text style={styles.resultLabel}>Words</Text></View>
              <View style={styles.resultCard}><Text style={styles.resultVal}>{Math.round((correctCount / TIME_LIMIT) * 60)}</Text><Text style={styles.resultLabel}>WPM</Text></View>
              <View style={styles.resultCard}><Text style={styles.resultVal}>{Math.min(correctCount * 5, 50)}</Text><Text style={styles.resultLabel}>🪙 Coins</Text></View>
            </View>
          </View>
        ) : (
          /* ─── Game screen ─── */
          <View style={styles.gameWrap}>
            {/* Score */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreChip}><Text style={styles.scoreVal}>{score} pts</Text></View>
              <View style={styles.scoreChip}><Text style={styles.scoreVal}>{correctCount} words</Text></View>
            </View>

            {/* Word to type */}
            <View style={styles.wordCard}>
              <Text style={styles.wordLabel}>Type this word:</Text>
              <Animated.View style={{ transform: [{ scale: wordAnim }] }}>
                <View style={styles.wordLetters}>
                  {currentWord.split('').map((letter, i) => (
                    <Text key={i} style={[styles.letter, getLetterStyle(letter, i)]}>{letter}</Text>
                  ))}
                </View>
              </Animated.View>
            </View>

            {/* Timer bar */}
            <View style={styles.timeBarWrap}>
              <View style={[styles.timeBar, { width: `${(timeLeft / TIME_LIMIT) * 100}%`, backgroundColor: timerColor }]} />
            </View>

            {/* Input */}
            <View style={styles.inputWrap}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={input}
                onChangeText={handleInputChange}
                placeholder="Type here..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Upcoming words */}
            <Text style={styles.upcomingLabel}>Coming up:</Text>
            <View style={styles.upcomingRow}>
              {TYPING_WORDS.slice(wordIdx + 1, wordIdx + 4).map((w, i) => (
                <View key={i} style={styles.upcomingWord}>
                  <Text style={styles.upcomingWordText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </SafeAreaView>

      <RewardModal
        visible={showModal}
        emoji="⌨️"
        title={correctCount >= 5 ? 'Speed Demon!' : 'Good Try!'}
        subtitle={`You typed ${correctCount} words in ${TIME_LIMIT} seconds!`}
        coins={Math.min(correctCount * 5, 50)}
        xp={20}
        onClose={() => { setShowModal(false); router.back(); }}
        buttonText="🏠 Back to Games"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  backBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: Colors.white, fontFamily: Fonts.display },
  headerTitle: { flex: 1, fontFamily: Fonts.display, fontSize: 20, color: Colors.white },
  timerPill: { borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 },
  timerText: { fontFamily: Fonts.bodyBlack, fontSize: 14, color: Colors.white },

  startScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  startEmoji: { fontSize: 70, marginBottom: 16 },
  startTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.white, marginBottom: 8 },
  startSub: { fontFamily: Fonts.bodyMed, fontSize: 14, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 24 },
  rulesBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radii.xl, padding: 18, width: '100%', gap: 8, marginBottom: 28 },
  ruleText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.white },
  startBtn: { width: '70%', borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.pop },
  startBtnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: Radii.xl },
  startBtnText: { fontFamily: Fonts.display, fontSize: 22, color: Colors.white },

  finishScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  finishEmoji: { fontSize: 70, marginBottom: 16 },
  finishTitle: { fontFamily: Fonts.display, fontSize: 28, color: Colors.white, marginBottom: 24 },
  resultGrid: { flexDirection: 'row', gap: 12 },
  resultCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.xl, padding: 16, alignItems: 'center' },
  resultVal: { fontFamily: Fonts.display, fontSize: 28, color: Colors.white },
  resultLabel: { fontFamily: Fonts.bodyBold, fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  gameWrap: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  scoreRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  scoreChip: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 7 },
  scoreVal: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.white },

  wordCard: { backgroundColor: Colors.white, borderRadius: Radii.xxl, padding: 28, alignItems: 'center', ...Shadow.pop, marginBottom: 16 },
  wordLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.textLight, marginBottom: 12 },
  wordLetters: { flexDirection: 'row', gap: 4 },
  letter: { fontFamily: Fonts.display, fontSize: 34, width: 34, textAlign: 'center' },
  letterDefault: { color: Colors.textDark },
  letterCorrect: { color: Colors.green },
  letterWrong: { color: Colors.coral },

  timeBarWrap: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 },
  timeBar: { height: '100%', borderRadius: 99 },

  inputWrap: { marginBottom: 20 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.xl,
    padding: 16, fontFamily: Fonts.display, fontSize: 22,
    color: Colors.white, textAlign: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)',
  },

  upcomingLabel: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  upcomingRow: { flexDirection: 'row', gap: 8 },
  upcomingWord: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  upcomingWordText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: 'rgba(255,255,255,0.7)' },
});
