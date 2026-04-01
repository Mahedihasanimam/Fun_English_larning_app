import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Polygon, Rect, Line, Path, Text as SvgText } from 'react-native-svg';

interface CatTeacherProps {
  size?: number;
  showBubble?: boolean;
  bubbleText?: string;
  animate?: boolean;
}

export default function CatTeacher({
  size = 110,
  showBubble = true,
  bubbleText = "Let's learn! 🌟",
  animate = true,
}: CatTeacherProps) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, { toValue: -8, duration: 1400, useNativeDriver: true }),
          Animated.timing(bobAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    }
    if (showBubble) {
      Animated.spring(bubbleAnim, {
        toValue: 1, delay: 800, useNativeDriver: true,
        tension: 100, friction: 8,
      }).start();
    }
  }, [animate, showBubble]);

  return (
    <View style={[styles.wrap, { width: size, height: size + 44 }]}>
      {showBubble && (
        <Animated.View style={[styles.bubble, {
          opacity: bubbleAnim,
          transform: [{ scale: bubbleAnim }],
        }]}>
          <Text style={styles.bubbleText}>{bubbleText}</Text>
        </Animated.View>
      )}
      <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
        <Svg width={size} height={size} viewBox="0 0 110 110">
          {/* Shadow */}
          <Ellipse cx="55" cy="105" rx="28" ry="5" fill="rgba(0,0,0,0.1)" />
          {/* Body */}
          <Rect x="32" y="65" width="46" height="32" rx="16" fill="#FFCCBC" />
          {/* Belly */}
          <Ellipse cx="55" cy="80" rx="14" ry="12" fill="#FFF3E0" />
          {/* Tail */}
          <Path d="M78,90 Q95,80 90,65 Q85,52 80,60" stroke="#FFCCBC" strokeWidth="6" fill="none" strokeLinecap="round" />
          {/* Head */}
          <Circle cx="55" cy="50" r="30" fill="#FFCCBC" />
          {/* Ears */}
          <Polygon points="25,28 18,10 36,22" fill="#FFCCBC" />
          <Polygon points="28,26 22,14 35,23" fill="#FF8A65" />
          <Polygon points="85,28 92,10 74,22" fill="#FFCCBC" />
          <Polygon points="82,26 88,14 75,23" fill="#FF8A65" />
          {/* Eye whites */}
          <Ellipse cx="43" cy="48" rx="9" ry="10" fill="white" />
          <Ellipse cx="67" cy="48" rx="9" ry="10" fill="white" />
          {/* Pupils */}
          <Ellipse cx="44" cy="49" rx="5.5" ry="7" fill="#3E2723" />
          <Ellipse cx="68" cy="49" rx="5.5" ry="7" fill="#3E2723" />
          {/* Shine */}
          <Circle cx="46" cy="46" r="2" fill="white" />
          <Circle cx="70" cy="46" r="2" fill="white" />
          {/* Nose */}
          <Ellipse cx="55" cy="58" rx="4" ry="3" fill="#FF7043" />
          {/* Mouth */}
          <Path d="M49,62 Q55,68 61,62" stroke="#E64A19" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Whiskers */}
          <Line x1="20" y1="55" x2="44" y2="58" stroke="#90A4AE" strokeWidth="1.2" strokeLinecap="round" />
          <Line x1="20" y1="60" x2="44" y2="61" stroke="#90A4AE" strokeWidth="1.2" strokeLinecap="round" />
          <Line x1="66" y1="58" x2="90" y2="55" stroke="#90A4AE" strokeWidth="1.2" strokeLinecap="round" />
          <Line x1="66" y1="61" x2="90" y2="60" stroke="#90A4AE" strokeWidth="1.2" strokeLinecap="round" />
          {/* Graduation hat */}
          <Rect x="30" y="23" width="50" height="7" rx="4" fill="#1565C0" />
          <Rect x="38" y="10" width="34" height="17" rx="5" fill="#1E88E5" />
          <Rect x="38" y="10" width="34" height="4" rx="2" fill="#1565C0" />
          {/* Tassel */}
          <Line x1="62" y1="14" x2="72" y2="6" stroke="#FFD54F" strokeWidth="2" />
          <Circle cx="72" cy="6" r="3.5" fill="#FFC107" />
          {/* Bow tie */}
          <Polygon points="47,75 55,71 63,75 55,82" fill="#E53935" />
          <Circle cx="55" cy="76" r="3" fill="#EF9A9A" />
          {/* Arms */}
          <Ellipse cx="29" cy="76" rx="6" ry="11" fill="#FFCCBC" />
          <Ellipse cx="81" cy="76" rx="6" ry="11" fill="#FFCCBC" />
          {/* Book */}
          <Rect x="34" y="87" width="42" height="13" rx="6" fill="#42A5F5" />
          <SvgText x="55" y="97" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">ABC</SvgText>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    position: 'relative',
  },
  bubble: {
    position: 'absolute',
    top: 0,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  bubbleText: {
    fontSize: 12,
    fontFamily: 'Nunito_800ExtraBold',
    color: '#FF7043',
  },
});
