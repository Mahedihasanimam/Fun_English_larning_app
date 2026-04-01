import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Fonts, Radii } from '@/constants/theme';

interface XPBarProps {
  level: number;
  xpCurrent: number;
  xpMax: number;
  progress: number; // 0–1
  light?: boolean;
}

export default function XPBar({ level, xpCurrent, xpMax, progress, light }: XPBarProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 1400,
      useNativeDriver: false,
    }).start();
    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, [progress]);

  const textColor = light ? 'rgba(255,255,255,0.9)' : Colors.textLight;

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: textColor }]}>Level {level} · Explorer 🗺️</Text>
        <Text style={[styles.label, { color: textColor }]}>{xpCurrent} / {xpMax} XP</Text>
      </View>
      <View style={[styles.track, light && styles.trackLight]}>
        <Animated.View
          style={[
            styles.fill,
            { width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        >
          <Animated.View style={[styles.shimmer, {
            transform: [{
              translateX: shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-80, 200] }),
            }],
          }]} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontFamily: Fonts.bodyBold, fontSize: 11 },
  track: {
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  trackLight: { backgroundColor: Colors.border },
  fill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: Radii.full,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ skewX: '-20deg' }],
  },
});
