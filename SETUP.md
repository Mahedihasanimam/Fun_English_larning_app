# 🎓 Fun English Academy — Setup Guide

## Prerequisites
- Node.js 18+ installed
- Expo CLI: `npm install -g expo-cli`
- Android Studio or Xcode (for device simulators)
- OR the **Expo Go** app on your phone (easiest!)

---

## Step 1 — Install dependencies

```bash
cd FunEnglishAcademy
npm install
```

---

## Step 2 — Start the app

```bash
npx expo start
```

Then:
- Press **`a`** for Android emulator
- Press **`i`** for iOS simulator  
- Scan the **QR code** with Expo Go on your phone

---

## Project Structure

```
FunEnglishAcademy/
├── app/
│   ├── _layout.tsx              # Root layout + font loading
│   ├── tabs/
│   │   ├── _layout.tsx          # Bottom tab navigator
│   │   ├── index.tsx            # 🏠 Home screen
│   │   ├── story.tsx            # 📚 Story Mode tab
│   │   ├── games.tsx            # 🎮 Games hub tab
│   │   ├── rewards.tsx          # 🏆 Rewards + Lucky Wheel
│   │   └── profile.tsx          # 👤 Profile & settings
│   ├── challenge/
│   │   └── index.tsx            # 📝 Daily Challenge screen
│   ├── story/
│   │   └── index.tsx            # 📖 Interactive Story screen
│   └── games/
│       ├── word-hunt.tsx        # 🔍 Word Hunt game
│       ├── sentence-builder.tsx # 🧩 Sentence Builder game
│       ├── typing.tsx           # ⌨️ Typing Race game
│       └── flashcards.tsx       # 🃏 Flashcard game
├── components/
│   ├── CatTeacher.tsx           # 🐱 Animated SVG cat character
│   ├── RewardModal.tsx          # 🎉 Confetti reward popup
│   ├── XPBar.tsx                # ⚡ Animated XP progress bar
│   ├── PressableCard.tsx        # 🫨 Bouncy press wrapper
│   └── FloatingCoins.tsx        # 🪙 +coins animation
├── constants/
│   ├── theme.ts                 # 🎨 Colors, fonts, radii, shadows
│   └── gameData.ts              # 📊 All game content & data
├── hooks/
│   └── useGameStore.ts          # 💾 Global state + AsyncStorage
├── app.json                     # Expo config
├── package.json                 # Dependencies
└── babel.config.js
```

---

## All Screens & Features

| Screen | Route | Features |
|--------|-------|---------|
| Home | `/tabs` | Cat teacher, XP bar, daily challenge card, lucky wheel, story preview, mini-games grid, achievements |
| Story Tab | `/tabs/story` | Chapter list, progress tracking, locked/unlocked scenes |
| Games Tab | `/tabs/games` | Game cards with lock system, tips |
| Rewards Tab | `/tabs/rewards` | Lucky Wheel (spinner), weekly streak, achievements, coin shop |
| Profile Tab | `/tabs/profile` | Stats, level progress, settings, premium upsell |
| Daily Challenge | `/challenge` | 3-question session, fill-blank & translate, star rating, haptics |
| Story Mode | `/story` | Narrated scenes, character dialogue, blank-fill choices, hint system |
| Word Hunt | `/games/word-hunt` | Letter grid tap game, word finder |
| Sentence Builder | `/games/sentence-builder` | Drag-and-drop word ordering |
| Typing Race | `/games/typing` | 30-second timed typing, WPM counter |
| Flashcards | `/games/flashcards` | Flip animation, translation matching |

---

## Key Features

### 🎨 Design
- Animated SVG Cat Teacher character (bobs, whiskers, graduation hat)
- Springy `PressableCard` press animations throughout
- Confetti `RewardModal` with animated pieces
- Shimmer XP bar animation
- Gradient backgrounds per screen with matching colors

### 🧠 Game State
- Global `useGameStore` hook with AsyncStorage persistence
- Coins, XP, level, streak, completed scenes all saved automatically
- Daily streak detection on app launch

### 🎮 Games
- **Daily Challenge** — 3-question sessions with shake-on-wrong, hint system, star rating
- **Story Mode** — 6 scenes with narrator, character dialogue, difficulty progression
- **Word Hunt** — 6×6 letter grid with tap-to-select, word detection in all directions
- **Sentence Builder** — bank of words, tap to build, shake-on-wrong
- **Typing Race** — 30s timer, live letter color feedback, WPM counter
- **Flashcards** — 3D flip animation (CSS rotateY), multi-choice translation

### 💰 Monetization hooks
- Rewarded ads placeholder in Lucky Wheel
- Premium banner in Profile tab
- Premium story chapter teaser in Story tab

---

## Adding Real Content

To add more challenges, open `constants/gameData.ts` and add to:
- `DAILY_CHALLENGES` — add more fill-blank or translate questions
- `STORY_SCENES` — add more narrative scenes
- `FLASHCARDS` — add more vocabulary cards
- `SENTENCE_QUESTIONS` — add more sentence building exercises
- `TYPING_WORDS` — add more words for the typing game

---

## Recommended Next Steps

1. **Add Lottie animations** — replace emoji rewards with `lottie-react-native`
2. **Add audio** — use `expo-av` to play correct/wrong sound effects  
3. **Add Firebase** — sync progress to cloud with `firebase` SDK
4. **Add AdMob** — integrate `expo-ads-admob` for rewarded ads
5. **Add push notifications** — use `expo-notifications` for daily streaks
6. **Add more stories** — extend `STORY_SCENES` with Chapter 2, 3...
7. **Add leaderboard** — use Firebase Realtime Database for global scores
