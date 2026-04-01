import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Switched to Ionicons for better compatibility
import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type TabRouteName = 'index' | 'story' | 'games' | 'rewards' | 'profile';

// Using Ionicons names here - make sure these match your navigation route names exactly
const TAB_META: Record<TabRouteName, {
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
}> = {
  index: { label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  story: { label: 'Story', activeIcon: 'book', inactiveIcon: 'book-outline' },
  games: { label: 'Play', activeIcon: 'game-controller', inactiveIcon: 'game-controller-outline', isCenter: true },
  rewards: { label: 'Awards', activeIcon: 'trophy', inactiveIcon: 'trophy-outline' },
  profile: { label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
};

function CustomAnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Initialize animation values
  const animValues = useRef<Record<string, Animated.Value>>({}).current;
  state.routes.forEach((route) => {
    if (!animValues[route.key]) {
      animValues[route.key] = new Animated.Value(0);
    }
  });

  useEffect(() => {
    state.routes.forEach((route, index) => {
      Animated.spring(animValues[route.key], {
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={[styles.footerWrapper, { bottom: Math.max(insets.bottom, 16) }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const routeName = route.name as TabRouteName;
          const meta = TAB_META[routeName];
          const anim = animValues[route.key];

          // If route name doesn't match TAB_META, provide a fallback
          const displayIcon = meta?.activeIcon || 'help-circle';
          const displayIconInactive = meta?.inactiveIcon || 'help-circle-outline';
          const displayLabel = meta?.label || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

          // CENTER "PLAY" BUTTON
          if (meta?.isCenter) {
            return (
              <View key={route.key} style={styles.centerTabContainer}>
                <Pressable onPress={onPress} style={styles.centerPressable}>
                  <Animated.View style={[styles.centerButton, { transform: [{ scale }] }]}>
                    <LinearGradient
                      colors={['#FF7043', '#F4511E']}
                      style={styles.centerGradient}
                    >
                      <Ionicons name={displayIcon} size={30} color="white" />
                    </LinearGradient>
                  </Animated.View>
                </Pressable>
                <Text style={[styles.tabLabel, isFocused && styles.activeLabel, { marginTop: 38 }]}>
                  {displayLabel}
                </Text>
              </View>
            );
          }

          // REGULAR BUTTONS
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tabHitArea}>
              <Animated.View style={{ transform: [{ translateY }, { scale }], alignItems: 'center' }}>
                <Ionicons
                  name={isFocused ? displayIcon : displayIconInactive}
                  size={24}
                  color={isFocused ? '#F4511E' : '#94A3B8'}
                />
                <Text style={[styles.tabLabel, { color: isFocused ? '#F4511E' : '#94A3B8' }]}>
                  {displayLabel}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomAnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="story" options={{ title: 'Story' }} />
      <Tabs.Screen name="games" options={{ title: 'Play' }} />
      <Tabs.Screen name="rewards" options={{ title: 'Awards' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  footerWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 72,
    zIndex: 1000, // Ensure it's on top of everything
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tabHitArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPressable: {
    position: 'absolute',
    top: -30,
    zIndex: 1001,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    padding: 5,
    shadowColor: '#F4511E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  centerGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  activeLabel: {
    color: '#F4511E',
  },
});