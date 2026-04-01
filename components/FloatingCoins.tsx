import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

interface FloatingCoinsProps {
  amount: number;
  visible: boolean;
  onDone?: () => void;
}

export default function FloatingCoins({ amount, visible, onDone }: FloatingCoinsProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(1);
      translateY.setValue(0);
      scale.setValue(0.5);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
        Animated.timing(translateY, { toValue: -80, duration: 900, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => onDone?.());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity, transform: [{ translateY }, { scale }] }]}>
      <Text style={styles.text}>+{amount} 🪙</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    fontFamily: Fonts.display,
    fontSize: 20,
    color: Colors.goldDark,
  },
});
