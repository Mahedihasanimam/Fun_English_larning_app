import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radii, Shadow } from '@/constants/theme';
import { useGameStore } from '@/hooks/useGameStore';
import { ACHIEVEMENTS } from '@/constants/gameData';
import RewardModal from '@/components/RewardModal';

const WHEEL_SEGMENTS = [
  { label: '🪙 50', prize: 50, color: '#FFC107' },
  { label: '💡 Hint', prize: 0, color: '#42A5F5', isHint: true },
  { label: '🪙 20', prize: 20, color: '#FF7043' },
  { label: '⭐ Star', prize: 0, color: '#AB47BC', isStar: true },
  { label: '🪙 100', prize: 100, color: '#66BB6A' },
  { label: '🪙 10', prize: 10, color: '#EC407A' },
  { label: '🎁 Bonus', prize: 30, color: '#26C6DA' },
  { label: '🪙 5', prize: 5, color: '#FF8A65' },
];

export default function RewardsScreen() {
  const store = useGameStore();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [prizeResult, setPrizeResult] = useState({ amount: 0, label: '' });
  const currentAngle = useRef(0);

  const spinWheel = () => {
    if (spinning || store.hasSpunWheel) return;
    setSpinning(true);

    const segIdx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const seg = WHEEL_SEGMENTS[segIdx];
    const targetDeg = 720 + 360 - (segIdx * (360 / WHEEL_SEGMENTS.length)) + currentAngle.current;
    currentAngle.current = targetDeg % 360;

    Animated.timing(spinAnim, {
      toValue: targetDeg,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setPrizeResult({ amount: seg.prize, label: seg.label });
      store.spinWheel(seg.prize);
      setTimeout(() => setModalVisible(true), 400);
    });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#87CEEB', '#B3E5FC', '#E3F2FD']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <LinearGradient
        colors={['#FFC107', '#FF8F00']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏆 Rewards</Text>
        <Text style={styles.headerSub}>Spin, earn & collect!</Text>
        <View style={styles.coinsDisplay}>
          <Text style={styles.coinsEmoji}>🪙</Text>
          <Text style={styles.coinsValue}>{store.coins}</Text>
          <Text style={styles.coinsLabel}>Total Coins</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── LUCKY WHEEL ─── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>🎡 Lucky Wheel</Text>
          {!store.hasSpunWheel && <Text style={styles.freeBadge}>1 FREE spin today!</Text>}
        </View>

        <View style={styles.wheelCard}>
          {/* Wheel */}
          <View style={styles.wheelWrap}>
            {/* Pointer */}
            <View style={styles.wheelPointer}><Text style={styles.wheelPointerText}>▼</Text></View>

            <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
              {WHEEL_SEGMENTS.map((seg, i) => {
                const angle = (i * 360) / WHEEL_SEGMENTS.length;
                const rad = (angle * Math.PI) / 180;
                const r = 80;
                const x = 95 + r * Math.sin(rad);
                const y = 95 - r * Math.cos(rad);
                return (
                  <View
                    key={i}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: seg.color,
                        transform: [{ rotate: `${angle}deg` }],
                      },
                    ]}
                  />
                );
              })}

              {/* Center hub */}
              <View style={styles.wheelHub}>
                <Text style={styles.wheelHubText}>🌟</Text>
              </View>

              {/* Segment labels */}
              {WHEEL_SEGMENTS.map((seg, i) => {
                const angle = (i * 360) / WHEEL_SEGMENTS.length + 22.5;
                const rad = (angle * Math.PI) / 180;
                const r = 68;
                const x = r * Math.sin(rad);
                const y = -r * Math.cos(rad);
                return (
                  <View
                    key={`label-${i}`}
                    style={[styles.segLabel, {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                        { rotate: `${angle}deg` },
                      ],
                    }]}
                  >
                    <Text style={styles.segLabelText}>{seg.label}</Text>
                  </View>
                );
              })}
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[styles.spinBtn, (spinning || store.hasSpunWheel) && styles.spinBtnDisabled]}
            onPress={spinWheel}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={store.hasSpunWheel ? ['#B0BEC5', '#90A4AE'] : ['#FF7043', '#E64A19']}
              style={styles.spinBtnInner}
            >
              <Text style={styles.spinBtnText}>
                {store.hasSpunWheel ? '✅ Already spun today!' : spinning ? '🌀 Spinning...' : '🎯 SPIN!'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.wheelNote}>
            {store.hasSpunWheel ? 'Come back tomorrow for a free spin!' : 'Tap to spin the wheel for free!'}
          </Text>
        </View>

        {/* ─── DAILY STREAK ─── */}
        <Text style={styles.sectionTitle}>🔥 Weekly Streak</Text>
        <View style={styles.streakCard}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const done = i < store.streak % 7;
            const today = i === (store.streak - 1) % 7;
            return (
              <View key={i} style={styles.streakDay}>
                <View style={[styles.streakDot, done && styles.streakDotDone, today && styles.streakDotToday]}>
                  <Text style={[styles.streakDayText, (done || today) && { color: Colors.white }]}>{day}</Text>
                </View>
                <Text style={styles.streakBonus}>{today ? 'Today' : done ? `+${10 + i * 5}` : ''}</Text>
              </View>
            );
          })}
        </View>

        {/* Streak progress bar */}
        <View style={styles.streakBarWrap}>
          <View style={[styles.streakBar, { width: `${((store.streak % 7) / 7) * 100}%` }]} />
        </View>
        <Text style={styles.streakNote}>
          {store.streak >= 7 ? '🎉 7-day bonus unlocked! x2 coins!' : `${7 - (store.streak % 7)} more days for x2 coins!`}
        </Text>

        {/* ─── ACHIEVEMENTS ─── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🏅 Achievements</Text>
        {ACHIEVEMENTS.map(ach => (
          <View key={ach.id} style={[styles.achCard, { backgroundColor: ach.bg }]}>
            <View style={[styles.achIcon, ach.unlocked && styles.achIconDone]}>
              <Text style={styles.achEmoji}>{ach.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.achTitle}>{ach.title}</Text>
              <Text style={styles.achDesc}>{ach.desc}</Text>
              {!ach.unlocked && (
                <View style={styles.achBarWrap}>
                  <View style={[styles.achBar, { width: `${(ach.current / ach.target) * 100}%` }]} />
                </View>
              )}
              <Text style={styles.achProgress}>
                {ach.unlocked ? '✅ Completed!' : `${ach.current} / ${ach.target}`}
              </Text>
            </View>
            {ach.unlocked && <Text style={styles.achBadge}>⭐</Text>}
          </View>
        ))}

        {/* ─── SHOP ─── */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🛒 Coin Shop</Text>
        <View style={styles.shopGrid}>
          {[
            { item: '💡 Hint Pack', cost: 50, emoji: '💡' },
            { item: '⭐ Star Boost', cost: 100, emoji: '⭐' },
            { item: '🎨 Cat Outfit', cost: 200, emoji: '🎨' },
            { item: '🏅 VIP Badge', cost: 500, emoji: '🏅' },
          ].map((shop, i) => (
            <TouchableOpacity key={i} style={styles.shopCard} activeOpacity={0.8}>
              <Text style={styles.shopEmoji}>{shop.emoji}</Text>
              <Text style={styles.shopItem}>{shop.item}</Text>
              <View style={styles.shopCost}>
                <Text style={styles.shopCostText}>🪙 {shop.cost}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      <RewardModal
        visible={modalVisible}
        emoji="🎡"
        title={prizeResult.amount > 0 ? 'You won!' : 'Lucky draw!'}
        subtitle={`You landed on: ${prizeResult.label}`}
        coins={prizeResult.amount}
        onClose={() => setModalVisible(false)}
        buttonText="🎉 Awesome!"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  headerTitle: { fontFamily: Fonts.display, fontSize: 26, color: Colors.white, marginBottom: 4 },
  headerSub: { fontFamily: Fonts.bodyMed, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  coinsDisplay: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radii.xl, paddingHorizontal: 20, paddingVertical: 10 },
  coinsEmoji: { fontSize: 24 },
  coinsValue: { fontFamily: Fonts.display, fontSize: 28, color: Colors.white },
  coinsLabel: { fontFamily: Fonts.bodyBold, fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  content: { padding: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 },
  sectionTitle: { fontFamily: Fonts.display, fontSize: 18, color: Colors.textDark, marginBottom: 12 },
  freeBadge: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.green, backgroundColor: Colors.greenLight, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4 },

  // Wheel
  wheelCard: { backgroundColor: Colors.white, borderRadius: Radii.xl, padding: 20, alignItems: 'center', ...Shadow.card, marginBottom: 20 },
  wheelWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  wheelPointer: { position: 'absolute', top: -12, zIndex: 10 },
  wheelPointerText: { fontSize: 22, color: Colors.coral },
  wheel: {
    width: 190, height: 190,
    borderRadius: 95,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: Colors.white,
    ...Shadow.pop,
  },
  segment: {
    position: 'absolute',
    width: 0, height: 0,
    borderLeftWidth: 95,
    borderRightWidth: 95,
    borderBottomWidth: 95,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    top: 0,
    transformOrigin: 'bottom center',
  },
  wheelHub: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
    ...Shadow.card,
  },
  wheelHubText: { fontSize: 22 },
  segLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  segLabelText: { fontFamily: Fonts.bodyBlack, fontSize: 9, color: Colors.white, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  spinBtn: { width: '80%', borderRadius: Radii.xl, overflow: 'hidden', marginBottom: 10, ...Shadow.pop },
  spinBtnDisabled: { opacity: 0.7 },
  spinBtnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: Radii.xl },
  spinBtnText: { fontFamily: Fonts.display, fontSize: 20, color: Colors.white },
  wheelNote: { fontFamily: Fonts.bodyMed, fontSize: 12, color: Colors.textLight, textAlign: 'center' },

  // Streak
  streakCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: Radii.xl, padding: 16, ...Shadow.card, marginBottom: 10 },
  streakDay: { alignItems: 'center', gap: 4 },
  streakDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  streakDotDone: { backgroundColor: Colors.green },
  streakDotToday: { backgroundColor: Colors.blue },
  streakDayText: { fontFamily: Fonts.bodyBlack, fontSize: 11, color: Colors.textLight },
  streakBonus: { fontFamily: Fonts.bodyBold, fontSize: 8, color: Colors.textLight },
  streakBarWrap: { height: 8, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  streakBar: { height: '100%', backgroundColor: Colors.gold, borderRadius: 99 },
  streakNote: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.textLight, textAlign: 'center', marginBottom: 8 },

  // Achievements
  achCard: { borderRadius: Radii.xl, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, ...Shadow.card },
  achIcon: { width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  achIconDone: { backgroundColor: Colors.gold },
  achEmoji: { fontSize: 24 },
  achTitle: { fontFamily: Fonts.bodyBlack, fontSize: 13, color: Colors.textDark, marginBottom: 2 },
  achDesc: { fontFamily: Fonts.bodyMed, fontSize: 11, color: Colors.textMid, marginBottom: 5 },
  achBarWrap: { height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 4 },
  achBar: { height: '100%', backgroundColor: Colors.coral, borderRadius: 99 },
  achProgress: { fontFamily: Fonts.bodyBold, fontSize: 10, color: Colors.textLight },
  achBadge: { fontSize: 24 },

  // Shop
  shopGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  shopCard: { width: '47%', backgroundColor: Colors.white, borderRadius: Radii.xl, padding: 16, alignItems: 'center', ...Shadow.card },
  shopEmoji: { fontSize: 32, marginBottom: 8 },
  shopItem: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: Colors.textDark, textAlign: 'center', marginBottom: 8 },
  shopCost: { backgroundColor: Colors.goldLight, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  shopCostText: { fontFamily: Fonts.bodyBlack, fontSize: 12, color: Colors.goldDark },
});
