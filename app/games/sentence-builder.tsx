import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { SENTENCE_QUESTIONS } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';

export default function SentenceBuilderScreen() {
  const store = useGameStore();
  const [qIdx, setQIdx] = useState(0);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const question = SENTENCE_QUESTIONS[qIdx];

  useEffect(() => {
    // Shuffle word bank
    const shuffled = [...question.words].sort(() => Math.random() - 0.5);
    setWordBank(shuffled);
    setAnswer([]);
    setChecked(false);
    setCorrect(false);
    successAnim.setValue(0);
  }, [qIdx]);

  const addWord = (word: string, idx: number) => {
    if (checked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAnswer(prev => [...prev, word]);
    setWordBank(prev => prev.filter((_, i) => i !== idx));
  };

  const removeWord = (word: string, idx: number) => {
    if (checked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setWordBank(prev => [...prev, word]);
    setAnswer(prev => prev.filter((_, i) => i !== idx));
  };

  const checkAnswer = () => {
    const built = answer.join(' ');
    const isCorrect = built === question.correct;
    setChecked(true);
    setCorrect(isCorrect);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
      setScore(s => s + 20);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (qIdx + 1 >= SENTENCE_QUESTIONS.length) {
      store.addCoins(score);
      store.addXP(30);
      setShowModal(true);
    } else {
      setQIdx(q => q + 1);
    }
  };

  const resetQuestion = () => {
    const shuffled = [...question.words].sort(() => Math.random() - 0.5);
    setWordBank(shuffled);
    setAnswer([]);
    setChecked(false);
    setCorrect(false);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#66BB6A', '#2E7D32']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🧩 Sentence Builder</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{qIdx + 1}/{SENTENCE_QUESTIONS.length}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>Tap words to build the sentence!</Text>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {SENTENCE_QUESTIONS.map((_, i) => (
            <View key={i} style={[styles.dot, i <= qIdx && styles.dotActive, i < qIdx && styles.dotDone]} />
          ))}
        </View>

        {/* Answer area */}
        <Animated.View style={[styles.answerWrap, { transform: [{ translateX: shakeAnim }] }]}>
          <View style={[styles.answerBox, checked && (correct ? styles.answerCorrect : styles.answerWrong)]}>
            {answer.length === 0 ? (
              <Text style={styles.answerPlaceholder}>Tap words to build your sentence...</Text>
            ) : (
              <View style={styles.answerWords}>
                {answer.map((w, i) => (
                  <TouchableOpacity key={i} style={styles.answerWord} onPress={() => removeWord(w, i)}>
                    <Text style={styles.answerWordText}>{w}</Text>
                    {!checked && <Text style={styles.answerRemove}>×</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        {/* Correct answer reveal */}
        {checked && !correct && (
          <View style={styles.correctReveal}>
            <Text style={styles.correctRevealLabel}>✅ Correct sentence:</Text>
            <Text style={styles.correctRevealText}>{question.correct}</Text>
          </View>
        )}

        {/* Hint */}
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>💡 {question.hint}</Text>
        </View>

        {/* Word bank */}
        <View style={styles.wordBankWrap}>
          <Text style={styles.wordBankLabel}>Word Bank:</Text>
          <View style={styles.wordBank}>
            {wordBank.map((word, i) => (
              <TouchableOpacity
                key={`${word}-${i}`}
                style={styles.bankWord}
                onPress={() => addWord(word, i)}
                activeOpacity={0.75}
                disabled={checked}
              >
                <Text style={styles.bankWordText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Success animation */}
        {checked && correct && (
          <Animated.View style={[styles.successBanner, {
            transform: [{ scale: successAnim }],
            opacity: successAnim,
          }]}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successText}>Perfect! +20 Coins!</Text>
          </Animated.View>
        )}

        {/* Buttons */}
        <View style={styles.btnRow}>
          {!checked ? (
            <>
              <TouchableOpacity style={styles.resetBtn} onPress={resetQuestion}>
                <Text style={styles.resetBtnText}>🔄 Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.checkBtn, answer.length === 0 && styles.checkBtnDisabled]}
                onPress={checkAnswer}
                disabled={answer.length === 0}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#FFC107', '#FF8F00']} style={styles.checkBtnInner}>
                  <Text style={styles.checkBtnText}>✅ Check!</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={['#FF7043', '#E64A19']} style={styles.checkBtnInner}>
                <Text style={styles.checkBtnText}>
                  {qIdx + 1 >= SENTENCE_QUESTIONS.length ? '🏁 Finish!' : '➡️ Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <RewardModal
        visible={showModal}
        emoji="🧩"
        title="Sentences Built!"
        subtitle="You completed all sentence challenges!"
        coins={score}
        xp={30}
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
  scorePill: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 },
  scoreText: { fontFamily: Fonts.bodyBlack, fontSize: 14, color: Colors.white },
  instruction: { fontFamily: Fonts.bodyMed, fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 10 },
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.gold },
  dotDone: { backgroundColor: Colors.white },

  answerWrap: { paddingHorizontal: 16, marginBottom: 10 },
  answerBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radii.xl, minHeight: 80, padding: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed' },
  answerCorrect: { backgroundColor: 'rgba(102,187,106,0.3)', borderColor: Colors.green, borderStyle: 'solid' },
  answerWrong: { backgroundColor: 'rgba(239,83,80,0.2)', borderColor: '#EF5350', borderStyle: 'solid' },
  answerPlaceholder: { fontFamily: Fonts.bodyMed, fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 20 },
  answerWords: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  answerWord: { backgroundColor: Colors.white, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5, ...Shadow.card },
  answerWordText: { fontFamily: Fonts.bodyBlack, fontSize: 14, color: Colors.greenDark },
  answerRemove: { fontSize: 14, color: Colors.textLight },

  correctReveal: { marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Radii.lg, padding: 12, marginBottom: 8 },
  correctRevealLabel: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.textLight, marginBottom: 4 },
  correctRevealText: { fontFamily: Fonts.display, fontSize: 15, color: Colors.greenDark },

  hintBox: { marginHorizontal: 16, backgroundColor: 'rgba(255,248,225,0.85)', borderRadius: Radii.lg, padding: 10, marginBottom: 16 },
  hintText: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.goldDark },

  wordBankWrap: { paddingHorizontal: 16, flex: 1 },
  wordBankLabel: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  wordBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bankWord: { backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, ...Shadow.card },
  bankWordText: { fontFamily: Fonts.bodyBlack, fontSize: 15, color: Colors.purpleDark },

  successBanner: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderRadius: 99, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 12, ...Shadow.pop },
  successEmoji: { fontSize: 22 },
  successText: { fontFamily: Fonts.display, fontSize: 16, color: Colors.goldDark },

  btnRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  resetBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radii.xl, paddingVertical: 15, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  resetBtnText: { fontFamily: Fonts.display, fontSize: 16, color: Colors.white },
  checkBtn: { flex: 2, borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.pop },
  checkBtnDisabled: { opacity: 0.5 },
  nextBtn: { flex: 1, borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.pop },
  checkBtnInner: { paddingVertical: 15, alignItems: 'center', borderRadius: Radii.xl },
  checkBtnText: { fontFamily: Fonts.display, fontSize: 17, color: Colors.white },
});
