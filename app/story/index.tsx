import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, ScrollView, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { STORY_SCENES } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';
import CatTeacher from '@/components/CatTeacher';

const DIFF_COLORS: Record<string, [string, string]> = {
  beginner:     ['#66BB6A', '#2E7D32'],
  intermediate: ['#42A5F5', '#1565C0'],
  advanced:     ['#AB47BC', '#6A1B9A'],
};

type Phase = 'intro' | 'question' | 'result';

export default function StoryScreen() {
  const store = useGameStore();
  const params = useLocalSearchParams<{ sceneId?: string }>();

  const startId = params.sceneId ? parseInt(params.sceneId) : (() => {
    // Find first incomplete scene
    const first = STORY_SCENES.find(s => !store.storyScenesCompleted.includes(s.id));
    return first?.id ?? 1;
  })();

  const [sceneId, setSceneId] = useState(startId);
  const [phase, setPhase] = useState<Phase>('intro');
  const [selected, setSelected] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const scene = STORY_SCENES.find(s => s.id === sceneId) ?? STORY_SCENES[0];
  const colors = DIFF_COLORS[scene.difficulty];
  const sceneAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    sceneAnim.setValue(0);
    Animated.timing(sceneAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    setPhase('intro');
    setSelected(null);
    setAnswerState('idle');
    setShowHint(false);
  }, [sceneId]);

  const handleAnswer = (opt: string) => {
    if (answerState !== 'idle') return;
    setSelected(opt);
    const correct = opt === scene.correct;
    if (correct) {
      setAnswerState('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setPhase('result'), 600);
    } else {
      setAnswerState('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShowHint(true);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleContinue = () => {
    store.completeStoryScene(scene.id, 15);
    const nextScene = STORY_SCENES.find(s => s.id === scene.id + 1);
    if (nextScene) {
      setSceneId(nextScene.id);
    } else {
      setShowModal(true);
    }
  };

  const dialogueParts = scene.dialogue.split(/_+/);

  return (
    <View style={styles.root}>
      {/* Scene background gradient */}
      <LinearGradient colors={[...colors, colors[1]] as any} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.chapterLabel}>Chapter {scene.chapter}</Text>
            <Text style={styles.settingLabel}>{scene.setting}</Text>
          </View>
          <View style={styles.diffBadge}>
            <Text style={styles.diffText}>{scene.difficulty === 'beginner' ? '🌱' : scene.difficulty === 'intermediate' ? '🔥' : '⚡'}</Text>
          </View>
        </View>

        {/* Scene illustration */}
        <Animated.View style={[styles.sceneIllus, { opacity: sceneAnim }]}>
          <View style={styles.sceneCard}>
            <Text style={styles.sceneEmoji}>{scene.bgEmoji}</Text>
          </View>
        </Animated.View>

        {/* Content scroll */}
        <Animated.ScrollView
          style={[styles.contentScroll, { opacity: sceneAnim }]}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Narrator */}
          <View style={styles.narratorBox}>
            <Text style={styles.narratorLabel}>📖 Narrator</Text>
            <Text style={styles.narratorText}>{scene.narrator}</Text>
          </View>

          {/* Character dialogue */}
          <View style={styles.charRow}>
            <View style={styles.charAvatar}>
              <Text style={styles.charEmoji}>{scene.charEmoji}</Text>
            </View>
            <View style={styles.charBubble}>
              <Text style={styles.charName}>{scene.character}</Text>
              <Text style={styles.charDialogue}>
                {dialogueParts[0]}
                {dialogueParts.length > 1 && (
                  <Text style={styles.blankSpan}>
                    {selected && answerState === 'correct'
                      ? scene.correct
                      : '______'}
                  </Text>
                )}
                {dialogueParts[1] ?? ''}
              </Text>
            </View>
          </View>

          {/* Question phase */}
          {phase !== 'result' && (
            <View style={styles.choicesSection}>
              <Text style={styles.choicesLabel}>Choose the correct word:</Text>
              <View style={styles.choices}>
                {scene.options.map((opt, i) => {
                  const isSelected = opt === selected;
                  const isCorrect = opt === scene.correct;
                  let bg = 'rgba(255,255,255,0.15)';
                  let border = 'rgba(255,255,255,0.3)';
                  if (answerState !== 'idle' && isCorrect) { bg = 'rgba(102,187,106,0.4)'; border = Colors.green; }
                  if (answerState === 'wrong' && isSelected && !isCorrect) { bg = 'rgba(239,83,80,0.3)'; border = '#EF5350'; }

                  return (
                    <Animated.View key={i} style={{ transform: [{ translateX: isSelected && answerState === 'wrong' ? shakeAnim : new Animated.Value(0) }] }}>
                      <TouchableOpacity
                        style={[styles.choiceBtn, { backgroundColor: bg, borderColor: border }]}
                        onPress={() => handleAnswer(opt)}
                        disabled={answerState !== 'idle'}
                        activeOpacity={0.8}
                      >
                        <View style={styles.choiceLetter}>
                          <Text style={styles.choiceLetterText}>{['A', 'B', 'C'][i]}</Text>
                        </View>
                        <Text style={styles.choiceText}>{opt}</Text>
                        {answerState !== 'idle' && isCorrect && <Text style={{ fontSize: 18 }}>✓</Text>}
                        {answerState === 'wrong' && isSelected && !isCorrect && <Text style={{ fontSize: 18 }}>✕</Text>}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Hint */}
              {showHint && (
                <View style={styles.hintBox}>
                  <Text style={styles.hintText}>{scene.hint}</Text>
                </View>
              )}

              {/* Cat helper */}
              <View style={styles.catHelper}>
                <CatTeacher size={60} showBubble animate bubbleText={answerState === 'correct' ? '🎉 Yes!' : answerState === 'wrong' ? '💪 Try again!' : '🤔 Think!'} />
              </View>
            </View>
          )}

          {/* Result phase */}
          {phase === 'result' && (
            <Animated.View style={[styles.resultBox, { opacity: sceneAnim }]}>
              <Text style={styles.resultEmoji}>🌟</Text>
              <Text style={styles.resultTitle}>Correct!</Text>
              <Text style={styles.resultStory}>{scene.successText}</Text>
              <View style={styles.resultRewards}>
                <Text style={styles.resultRewardText}>🪙 +15 Coins</Text>
                <Text style={styles.resultRewardText}>⚡ +20 XP</Text>
              </View>
              <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
                <LinearGradient colors={['#FFC107', '#FF8F00']} style={styles.continueBtnInner}>
                  <Text style={styles.continueBtnText}>
                    {STORY_SCENES.find(s => s.id === scene.id + 1) ? '➡️ Next Scene' : '🏁 Finish Story!'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </SafeAreaView>

      <RewardModal
        visible={showModal}
        emoji="🏆"
        title="Story Complete!"
        subtitle="You finished Mia's Big Adventure!"
        coins={50}
        xp={100}
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
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
  },
  backBtn: { width: 38, height: 38, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: Colors.white, fontFamily: Fonts.display },
  headerInfo: { flex: 1 },
  chapterLabel: { fontFamily: Fonts.display, fontSize: 16, color: Colors.white },
  settingLabel: { fontFamily: Fonts.bodyMed, fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  diffBadge: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  diffText: { fontSize: 18 },

  sceneIllus: { alignItems: 'center', paddingVertical: 12 },
  sceneCard: { width: 88, height: 88, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  sceneEmoji: { fontSize: 46 },

  contentScroll: { flex: 1 },
  content: { paddingHorizontal: 16 },

  narratorBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radii.xl, padding: 14, marginBottom: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  narratorLabel: { fontFamily: Fonts.bodyBlack, fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 5 },
  narratorText: { fontFamily: Fonts.bodyMed, fontSize: 13, color: Colors.white, lineHeight: 20, fontStyle: 'italic' },

  charRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 18 },
  charAvatar: { width: 46, height: 46, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', flexShrink: 0 },
  charEmoji: { fontSize: 24 },
  charBubble: { flex: 1, backgroundColor: Colors.white, borderRadius: Radii.xl, borderTopLeftRadius: 4, padding: 14, ...Shadow.card },
  charName: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.textLight, marginBottom: 5 },
  charDialogue: { fontFamily: Fonts.bodyBold, fontSize: 15, color: Colors.textDark, lineHeight: 22 },
  blankSpan: { color: Colors.blue, borderBottomWidth: 2, borderBottomColor: Colors.blue, fontFamily: Fonts.display },

  choicesSection: { gap: 0 },
  choicesLabel: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  choices: { gap: 8, marginBottom: 12 },
  choiceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radii.lg, padding: 13,
    borderWidth: 2,
  },
  choiceLetter: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  choiceLetterText: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.white },
  choiceText: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.white, flex: 1 },

  hintBox: { backgroundColor: 'rgba(255,248,225,0.9)', borderRadius: Radii.lg, padding: 12, marginBottom: 12 },
  hintText: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.goldDark, lineHeight: 20 },

  catHelper: { alignItems: 'flex-end', marginBottom: 8 },

  resultBox: {
    backgroundColor: Colors.white, borderRadius: Radii.xxl,
    padding: 24, alignItems: 'center', ...Shadow.pop,
  },
  resultEmoji: { fontSize: 54, marginBottom: 10 },
  resultTitle: { fontFamily: Fonts.display, fontSize: 26, color: Colors.textDark, marginBottom: 8 },
  resultStory: { fontFamily: Fonts.bodyMed, fontSize: 14, color: Colors.textMid, textAlign: 'center', lineHeight: 22, marginBottom: 18 },
  resultRewards: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  resultRewardText: { fontFamily: Fonts.bodyBlack, fontSize: 14, color: Colors.goldDark, backgroundColor: Colors.goldLight, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7 },
  continueBtn: { width: '100%', borderRadius: Radii.xl, overflow: 'hidden', ...Shadow.pop },
  continueBtnInner: { paddingVertical: 15, alignItems: 'center' },
  continueBtnText: { fontFamily: Fonts.display, fontSize: 18, color: Colors.white },
});
