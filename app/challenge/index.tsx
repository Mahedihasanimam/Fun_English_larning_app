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
import { DAILY_CHALLENGES } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';
import FloatingCoins from '@/components/FloatingCoins';
import CatTeacher from '@/components/CatTeacher';

type AnswerState = 'idle' | 'correct' | 'wrong';

export default function ChallengeScreen() {
  const store = useGameStore();
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [showHint, setShowHint] = useState(false);
  const [stars, setStars] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showCoins, setShowCoins] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const catMood = useRef(new Animated.Value(0)).current;

  const current = DAILY_CHALLENGES[qIndex % DAILY_CHALLENGES.length];
  const totalQ = 3;

  useEffect(() => {
    // Slide in card
    slideAnim.setValue(60);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, tension: 80, friction: 10,
    }).start();
    // Progress bar
    Animated.timing(progressAnim, {
      toValue: qIndex / totalQ, duration: 600, useNativeDriver: false,
    }).start();
  }, [qIndex]);

  const shakeCard = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = (option: string) => {
    if (answerState !== 'idle') return;
    setSelected(option);
    const correct = option === current.correct;

    if (correct) {
      setAnswerState('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCoins(true);
      setTotalCoins(prev => prev + current.reward);
      setTotalXP(prev => prev + current.xp);
    } else {
      setAnswerState('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeCard();
      setShowHint(true);
      setStars(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (qIndex + 1 >= totalQ) {
      // Done — save and show modal
      store.completeChallenge(totalCoins, totalXP);
      setShowModal(true);
    } else {
      setQIndex(prev => prev + 1);
      setSelected(null);
      setAnswerState('idle');
      setShowHint(false);
    }
  };

  const optionStyle = (opt: string) => {
    if (answerState === 'idle') return styles.optBase;
    if (opt === current.correct) return [styles.optBase, styles.optCorrect];
    if (opt === selected && answerState === 'wrong') return [styles.optBase, styles.optWrong];
    return [styles.optBase, styles.optFaded];
  };

  const optionTextStyle = (opt: string) => {
    if (answerState === 'idle') return styles.optText;
    if (opt === current.correct) return [styles.optText, styles.optTextCorrect];
    if (opt === selected && answerState === 'wrong') return [styles.optText, styles.optTextWrong];
    return [styles.optText, styles.optTextFaded];
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#26C6DA', '#00838F']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={styles.progressText}>{qIndex + 1} / {totalQ}</Text>
          </View>
          <View style={styles.starsWrap}>
            {[0, 1, 2].map(i => (
              <Text key={i} style={[styles.starIcon, i >= stars && styles.starIconEmpty]}>⭐</Text>
            ))}
          </View>
        </View>

        {/* Cat teacher */}
        <View style={styles.catWrap}>
          <CatTeacher
            size={90}
            showBubble
            bubbleText={answerState === 'correct' ? 'Excellent! 🎉' : answerState === 'wrong' ? 'Try again! 💪' : 'Choose wisely! 🤔'}
            animate
          />
        </View>

        {/* Question card */}
        <Animated.View style={[styles.cardWrap, {
          transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
        }]}>
          <View style={styles.card}>
            {/* Type badge */}
            <View style={[styles.typeBadge, { backgroundColor: current.type === 'fill-blank' ? Colors.mint : Colors.purple }]}>
              <Text style={styles.typeBadgeText}>
                {current.type === 'fill-blank' ? '✏️ Fill the Blank' : current.type === 'translate' ? '🌐 Translate' : '🖼️ Match'}
              </Text>
            </View>

            {/* Question */}
            <Text style={styles.questionText}>
              {current.question.replace('_____', '______')}
            </Text>

            {/* Options */}
            <View style={styles.optionsWrap}>
              {current.options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={optionStyle(opt)}
                  onPress={() => handleAnswer(opt)}
                  activeOpacity={0.8}
                  disabled={answerState !== 'idle'}
                >
                  <View style={styles.optLetter}>
                    <Text style={styles.optLetterText}>{['A', 'B', 'C'][i]}</Text>
                  </View>
                  <Text style={optionTextStyle(opt)}>{opt}</Text>
                  {answerState !== 'idle' && opt === current.correct && (
                    <Text style={styles.optCheck}>✓</Text>
                  )}
                  {answerState === 'wrong' && opt === selected && (
                    <Text style={styles.optCross}>✕</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Hint */}
            {showHint && (
              <Animated.View style={styles.hintBox}>
                <Text style={styles.hintText}>{current.hint}</Text>
              </Animated.View>
            )}

            {/* Coin pop */}
            {showCoins && (
              <FloatingCoins
                amount={current.reward}
                visible={showCoins}
                onDone={() => setShowCoins(false)}
              />
            )}
          </View>

          {/* Result banner */}
          {answerState !== 'idle' && (
            <Animated.View style={[
              styles.resultBanner,
              answerState === 'correct' ? styles.resultCorrect : styles.resultWrong,
            ]}>
              <Text style={styles.resultEmoji}>{answerState === 'correct' ? '🎉' : '💪'}</Text>
              <Text style={styles.resultText}>
                {answerState === 'correct' ? `Great job! +${current.reward} coins` : `Correct answer: "${current.correct}"`}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Next button */}
        {answerState !== 'idle' && (
          <View style={styles.nextWrap}>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
              <LinearGradient colors={['#FF7043', '#E64A19']} style={styles.nextBtnInner}>
                <Text style={styles.nextBtnText}>
                  {qIndex + 1 >= totalQ ? '🏁 Finish!' : '➡️ Next Question'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <RewardModal
        visible={showModal}
        emoji={stars === 3 ? '🏆' : stars >= 2 ? '⭐' : '💪'}
        title={stars === 3 ? 'Perfect Score!' : stars >= 2 ? 'Well Done!' : 'Good Try!'}
        subtitle={`You earned ${stars} star${stars !== 1 ? 's' : ''} today!`}
        coins={totalCoins}
        xp={totalXP}
        onClose={() => { setShowModal(false); router.back(); }}
        buttonText="🏠 Back to Home"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },
  closeBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, color: Colors.white, fontFamily: Fonts.bodyBlack },
  headerCenter: { flex: 1, gap: 4 },
  progressTrack: { height: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)' },
  progressFill: { height: '100%', backgroundColor: Colors.gold, borderRadius: 99 },
  progressText: { fontFamily: Fonts.bodyBold, fontSize: 10, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  starsWrap: { flexDirection: 'row', gap: 2 },
  starIcon: { fontSize: 16 },
  starIconEmpty: { opacity: 0.3 },

  catWrap: { alignItems: 'center', paddingVertical: 8 },

  cardWrap: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xxl,
    padding: 22,
    flex: 1,
    ...Shadow.pop,
    position: 'relative',
    overflow: 'hidden',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.full, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 14,
  },
  typeBadgeText: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: Colors.white },
  questionText: { fontFamily: Fonts.displayBold, fontSize: 22, color: Colors.textDark, lineHeight: 32, marginBottom: 24 },

  optionsWrap: { gap: 10 },
  optBase: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F5F5F5', borderRadius: Radii.lg,
    padding: 14, borderWidth: 2, borderColor: '#E0E0E0',
  },
  optCorrect: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  optWrong: { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A' },
  optFaded: { opacity: 0.5 },
  optLetter: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  optLetterText: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: Colors.textMid },
  optText: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.textDark, flex: 1 },
  optTextCorrect: { color: Colors.greenDark },
  optTextWrong: { color: '#C62828' },
  optTextFaded: { color: Colors.textLight },
  optCheck: { fontSize: 18, color: Colors.green },
  optCross: { fontSize: 18, color: '#E53935' },

  hintBox: { backgroundColor: Colors.goldLight, borderRadius: Radii.lg, padding: 12, marginTop: 14, borderWidth: 1.5, borderColor: Colors.gold },
  hintText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.goldDark, lineHeight: 20 },

  resultBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: Radii.lg, marginTop: 12,
  },
  resultCorrect: { backgroundColor: Colors.greenLight, borderWidth: 1.5, borderColor: Colors.green },
  resultWrong: { backgroundColor: '#FFEBEE', borderWidth: 1.5, borderColor: '#FFCDD2' },
  resultEmoji: { fontSize: 24 },
  resultText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.textDark, flex: 1 },

  nextWrap: { paddingHorizontal: 16, paddingVertical: 12 },
  nextBtn: { borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.pop },
  nextBtnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: Radii.xl },
  nextBtnText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
});
