import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameState {
  coins: number;
  xp: number;
  level: number;
  streak: number;
  lastLoginDate: string;
  challengesDoneToday: number;
  storyScenesCompleted: number[];
  miniGamesUnlocked: number[];
  achievements: string[];
  totalWordsLearned: number;
  hasSpunWheel: boolean;
}

const DEFAULT_STATE: GameState = {
  coins: 480,
  xp: 240,
  level: 5,
  streak: 7,
  lastLoginDate: new Date().toDateString(),
  challengesDoneToday: 0,
  storyScenesCompleted: [1],
  miniGamesUnlocked: [1, 2],
  achievements: ['first_star', 'streak_7'],
  totalWordsLearned: 78,
  hasSpunWheel: false,
};

const XP_PER_LEVEL = 300;
const STORAGE_KEY = '@FunEnglish:gameState';

export function useGameStore() {
  const [state, setState] = useState<GameState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as GameState;
        // Check streak
        const today = new Date().toDateString();
        const last = new Date(saved.lastLoginDate).toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (last === today) {
          setState(saved);
        } else if (last === yesterday) {
          setState({ ...saved, streak: saved.streak + 1, lastLoginDate: today, challengesDoneToday: 0, hasSpunWheel: false });
        } else {
          setState({ ...saved, streak: 1, lastLoginDate: today, challengesDoneToday: 0, hasSpunWheel: false });
        }
      }
    } catch (_) {}
    setLoaded(true);
  };

  const saveState = useCallback(async (newState: GameState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (_) {}
  }, []);

  const update = useCallback((patch: Partial<GameState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const addCoins = useCallback((amount: number) => {
    setState(prev => {
      const next = { ...prev, coins: prev.coins + amount };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      const next = { ...prev, xp: newXP, level: Math.max(prev.level, newLevel) };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const completeChallenge = useCallback((reward: number, xp: number) => {
    setState(prev => {
      const newXP = prev.xp + xp;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      const next = {
        ...prev,
        coins: prev.coins + reward,
        xp: newXP,
        level: Math.max(prev.level, newLevel),
        challengesDoneToday: prev.challengesDoneToday + 1,
        totalWordsLearned: prev.totalWordsLearned + 1,
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const completeStoryScene = useCallback((sceneId: number, reward: number) => {
    setState(prev => {
      if (prev.storyScenesCompleted.includes(sceneId)) return prev;
      const next = {
        ...prev,
        coins: prev.coins + reward,
        xp: prev.xp + 20,
        storyScenesCompleted: [...prev.storyScenesCompleted, sceneId],
      };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const spinWheel = useCallback((prize: number) => {
    setState(prev => {
      const next = { ...prev, coins: prev.coins + prize, hasSpunWheel: true };
      saveState(next);
      return next;
    });
  }, [saveState]);

  const xpInCurrentLevel = state.xp % XP_PER_LEVEL;
  const xpProgress = xpInCurrentLevel / XP_PER_LEVEL;

  return {
    ...state,
    loaded,
    xpProgress,
    xpInCurrentLevel,
    XP_PER_LEVEL,
    addCoins,
    addXP,
    update,
    completeChallenge,
    completeStoryScene,
    spinWheel,
  };
}
