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
import { FLASHCARDS } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';

export default function FlashcardsScreen() {
  const store = useGameStore();
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const card = FLASHCARDS[cardIdx];

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
      tension: 80, friction: 8,
    }).start();
    setFlipped(!flipped);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  const handleAnswer = (option: string) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    const isCorrect = option === card.correct;
    setCorrect(isCorrect);
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScore(s => s + 15);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = () => {
    if (cardIdx + 1 >= FLASHCARDS.length) {
      store.addCoins(score);
      store.addXP(25);
      setShowModal(true);
    } else {
      // Slide out and in
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -400, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setCardIdx(i => i + 1);
        setFlipped(false);
        setSelected(null);
        setAnswered(false);
        flipAnim.setValue(0);
        slideAnim.setValue(400);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
      });
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#42A5F5', '#1565C0']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🃏 Flashcards</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>{cardIdx + 1}/{FLASHCARDS.length}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>Tap the card to flip it, then pick the translation!</Text>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {FLASHCARDS.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i < cardIdx && styles.dotDone,
              i === cardIdx && styles.dotActive,
            ]} />
          ))}
        </View>

        {/* Flashcard */}
        <Animated.View style={[styles.cardWrap, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity onPress={flipCard} activeOpacity={0.92} style={styles.cardTouchable}>
            {/* Front */}
            <Animated.View style={[styles.card, styles.cardFront, {
              transform: [{ rotateY: frontRotate }],
              opacity: frontOpacity,
            }]}>
              <LinearGradient colors={['#FFF9C4', '#FFF176']} style={styles.cardInner}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                <Text style={styles.cardWord}>{card.english}</Text>
                <Text style={styles.cardHint}>Tap to see translation →</Text>
              </LinearGradient>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.card, styles.cardBack, {
              transform: [{ rotateY: backRotate }],
              opacity: backOpacity,
            }]}>
              <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.cardInner}>
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
                <Text style={styles.cardWordBack}>{card.correct}</Text>
                <Text style={styles.cardWordEng}>{card.english}</Text>
                <Text style={styles.cardHintBack}>Now pick below! ↓</Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          <Text style={styles.optionsLabel}>Pick the correct translation:</Text>
          {card.options.map((opt, i) => {
            let bg = 'rgba(255,255,255,0.15)';
            let border = 'rgba(255,255,255,0.3)';
            if (answered) {
              if (opt === card.correct) { bg = 'rgba(102,187,106,0.4)'; border = Colors.green; }
              else if (opt === selected) { bg = 'rgba(239,83,80,0.3)'; border = '#EF5350'; }
            }
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optBtn, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleAnswer(opt)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <Text style={styles.optText}>{opt}</Text>
                {answered && opt === card.correct && <Text style={styles.optIcon}>✓</Text>}
                {answered && opt === selected && opt !== card.correct && <Text style={styles.optIcon}>✕</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {answered && (
          <View style={[styles.feedbackBanner, correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackEmoji}>{correct ? '🎉' : '💡'}</Text>
            <Text style={styles.feedbackText}>
              {correct ? `+15 coins! "${card.english}" = "${card.correct}"` : `"${card.english}" means "${card.correct}"`}
            </Text>
          </View>
        )}

        {/* Next */}
        {answered && (
          <View style={styles.nextWrap}>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={['#FF7043', '#E64A19']} style={styles.nextBtnInner}>
                <Text style={styles.nextBtnText}>
                  {cardIdx + 1 >= FLASHCARDS.length ? '🏁 Finish!' : '➡️ Next Card'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <RewardModal
        visible={showModal}
        emoji="🃏"
        title="Cards Complete!"
        subtitle={`You scored ${score} points on ${FLASHCARDS.length} flashcards!`}
        coins={score}
        xp={25}
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
  instruction: { fontFamily: Fonts.bodyMed, fontSize: 12, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 10, paddingHorizontal: 16 },

  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { width: 20, backgroundColor: Colors.gold },
  dotDone: { backgroundColor: Colors.white },

  cardWrap: { paddingHorizontal: 24, marginBottom: 16 },
  cardTouchable: { height: 200 },
  card: { position: 'absolute', inset: 0, borderRadius: Radii.xxl, overflow: 'hidden', ...Shadow.pop, backfaceVisibility: 'hidden' },
  cardFront: {},
  cardBack: {},
  cardInner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, borderRadius: Radii.xxl },
  cardEmoji: { fontSize: 52, marginBottom: 10 },
  cardWord: { fontFamily: Fonts.display, fontSize: 30, color: Colors.textDark, marginBottom: 8 },
  cardHint: { fontFamily: Fonts.bodyMed, fontSize: 12, color: Colors.textLight },
  cardWordBack: { fontFamily: Fonts.display, fontSize: 28, color: Colors.greenDark, marginBottom: 4 },
  cardWordEng: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.textMid, marginBottom: 8 },
  cardHintBack: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.textLight },

  optionsWrap: { paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  optionsLabel: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  optBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: Radii.lg, borderWidth: 2 },
  optText: { fontFamily: Fonts.bodyBlack, fontSize: 16, color: Colors.white },
  optIcon: { fontSize: 20, color: Colors.white },

  feedbackBanner: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: Radii.lg, marginBottom: 8 },
  feedbackCorrect: { backgroundColor: 'rgba(102,187,106,0.3)', borderWidth: 1.5, borderColor: Colors.green },
  feedbackWrong: { backgroundColor: 'rgba(255,248,225,0.9)', borderWidth: 1.5, borderColor: Colors.gold },
  feedbackEmoji: { fontSize: 22 },
  feedbackText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.white, flex: 1 },

  nextWrap: { paddingHorizontal: 16 },
  nextBtn: { borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.pop },
  nextBtnInner: { paddingVertical: 15, alignItems: 'center', borderRadius: Radii.xl },
  nextBtnText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
});
