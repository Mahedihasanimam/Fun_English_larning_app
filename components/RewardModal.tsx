import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface RewardModalProps {
  visible: boolean;
  emoji: string;
  title: string;
  subtitle: string;
  coins: number;
  xp?: number;
  onClose: () => void;
  buttonText?: string;
}

function ConfettiPiece({ delay, color }: { delay: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const x = useRef(Math.random() * width).current;
  const drift = useRef((Math.random() - 0.5) * 120).current;
  const size = useRef(8 + Math.random() * 8).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1, duration: 1800 + Math.random() * 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        width: size,
        height: size,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 0.8, 0] }),
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, height * 0.7] }) },
          { translateX: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, drift / 2, drift] }) },
          { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] }) },
        ],
      }}
    />
  );
}

const CONF_COLORS = [Colors.coral, Colors.gold, Colors.green, Colors.blue, Colors.purple, Colors.pink, Colors.mint];

export default function RewardModal({
  visible, emoji, title, subtitle, coins, xp = 0, onClose, buttonText = '🚀 Keep Going!',
}: RewardModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      emojiAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1, useNativeDriver: true, tension: 80, friction: 7,
      }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(emojiAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(emojiAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
          Animated.timing(emojiAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        {visible && Array.from({ length: 30 }).map((_, i) => (
          <ConfettiPiece
            key={i}
            delay={i * 50}
            color={CONF_COLORS[i % CONF_COLORS.length]}
          />
        ))}
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.Text style={[styles.emoji, {
            transform: [{ rotate: emojiAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-15deg', '0deg', '15deg'] }) }],
          }]}>
            {emoji}
          </Animated.Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardChip}>
              <Text style={styles.rewardChipText}>🪙 +{coins} Coins</Text>
            </View>
            {xp > 0 && (
              <View style={[styles.rewardChip, { backgroundColor: Colors.purpleLight }]}>
                <Text style={[styles.rewardChipText, { color: Colors.purpleDark }]}>⚡ +{xp} XP</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xxl,
    padding: 32,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    ...Shadow.pop,
    zIndex: 10,
  },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: {
    fontFamily: Fonts.display,
    fontSize: 26,
    color: Colors.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.bodyMed,
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  rewardChip: {
    backgroundColor: Colors.goldLight,
    borderRadius: Radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rewardChipText: {
    fontFamily: Fonts.bodyBlack,
    fontSize: 15,
    color: Colors.goldDark,
  },
  btn: {
    backgroundColor: Colors.coral,
    borderRadius: Radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.coralDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  btnText: {
    fontFamily: Fonts.display,
    fontSize: 17,
    color: Colors.white,
  },
});
