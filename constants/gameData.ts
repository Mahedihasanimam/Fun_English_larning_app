export interface Challenge {
  id: number;
  type: 'fill-blank' | 'match' | 'translate';
  question: string;
  options: string[];
  correct: string;
  reward: number;
  xp: number;
  hint: string;
}

export interface StoryScene {
  id: number;
  chapter: number;
  setting: string;
  bgEmoji: string;
  narrator: string;
  character: string;
  charEmoji: string;
  dialogue: string;
  blank: string;
  options: string[];
  correct: string;
  successText: string;
  hint: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface MiniGame {
  id: number;
  name: string;
  emoji: string;
  description: string;
  color: string;
  shadowColor: string;
  unlockLevel: number;
  type: 'word-hunt' | 'sentence-builder' | 'typing' | 'flashcard';
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  bg: string;
  target: number;
  current: number;
  unlocked: boolean;
}

// ─── DAILY CHALLENGES ───────────────────────────────────────────────
export const DAILY_CHALLENGES: Challenge[] = [
  {
    id: 1,
    type: 'fill-blank',
    question: 'She _____ to school every day.',
    options: ['go', 'goes', 'going'],
    correct: 'goes',
    reward: 10, xp: 8,
    hint: '💡 With "she/he/it" we add -s to the verb in present simple.',
  },
  {
    id: 2,
    type: 'fill-blank',
    question: 'I _____ my homework yesterday.',
    options: ['do', 'did', 'does'],
    correct: 'did',
    reward: 10, xp: 8,
    hint: '💡 "Yesterday" means past tense. Use "did" for simple past.',
  },
  {
    id: 3,
    type: 'fill-blank',
    question: 'They _____ playing football now.',
    options: ['is', 'are', 'am'],
    correct: 'are',
    reward: 10, xp: 8,
    hint: '💡 "They" uses "are" — I am, you/we/they are, he/she/it is.',
  },
  {
    id: 4,
    type: 'translate',
    question: 'আমি প্রতিদিন ইংরেজি পড়ি।',
    options: ['I read English every day.', 'I will read English.', 'I read English yesterday.'],
    correct: 'I read English every day.',
    reward: 15, xp: 12,
    hint: '💡 "প্রতিদিন" = every day. Present simple for habits.',
  },
  {
    id: 5,
    type: 'fill-blank',
    question: 'The cat is _____ the table.',
    options: ['on', 'in', 'at'],
    correct: 'on',
    reward: 10, xp: 8,
    hint: '💡 "On" is used for surfaces — on the table, on the floor.',
  },
  {
    id: 6,
    type: 'fill-blank',
    question: 'If it rains, I _____ stay home.',
    options: ['will', 'would', 'shall'],
    correct: 'will',
    reward: 15, xp: 12,
    hint: '💡 First conditional: If + present simple → will + verb.',
  },
];

// ─── STORY SCENES ────────────────────────────────────────────────────
export const STORY_SCENES: StoryScene[] = [
  {
    id: 1, chapter: 1,
    setting: 'School Entrance · Morning',
    bgEmoji: '🏫',
    narrator: 'Mia arrives at her new school on her first day. She sees a friendly boy named Leo near the gate.',
    character: 'Leo', charEmoji: '👦',
    dialogue: 'Hi! My name _____ Leo. What is your name?',
    blank: '_____',
    options: ['am', 'is', 'are'],
    correct: 'is',
    successText: 'Leo smiles warmly. "Nice to meet you, Mia! Come, I will show you around!"',
    hint: '💡 With "my name" we use "is" — My name is...',
    difficulty: 'beginner',
  },
  {
    id: 2, chapter: 1,
    setting: 'Classroom · Morning',
    bgEmoji: '📚',
    narrator: 'Mia and Leo enter the classroom. The teacher asks everyone to introduce themselves.',
    character: 'Teacher', charEmoji: '👩‍🏫',
    dialogue: 'Good morning class! Please _____ yourselves to our new student.',
    blank: '_____',
    options: ['introduce', 'introducing', 'introduced'],
    correct: 'introduce',
    successText: 'The class cheers and welcomes Mia warmly!',
    hint: '💡 After "please", use the base form of the verb.',
    difficulty: 'beginner',
  },
  {
    id: 3, chapter: 2,
    setting: 'School Cafeteria · Lunchtime',
    bgEmoji: '🍱',
    narrator: 'Mia is hungry and goes to the cafeteria. She wants to order her lunch.',
    character: 'Cafeteria Staff', charEmoji: '👨‍🍳',
    dialogue: 'Would you _____ rice or noodles for lunch today?',
    blank: '_____',
    options: ['like', 'likes', 'liked'],
    correct: 'like',
    successText: 'Mia orders rice and gets a delicious meal. She feels happy!',
    hint: '💡 "Would you like" is a polite way to ask. Use "like" not "likes".',
    difficulty: 'beginner',
  },
  {
    id: 4, chapter: 3,
    setting: 'School Library · Afternoon',
    bgEmoji: '📖',
    narrator: 'Mia discovers the school library. Leo is already there, reading a book.',
    character: 'Leo', charEmoji: '👦',
    dialogue: 'I _____ reading this book for two hours! It is amazing.',
    blank: '_____',
    options: ["'ve been", 'have been', 'was'],
    correct: 'have been',
    successText: 'Leo shows Mia the book. They decide to read it together after school!',
    hint: '💡 Present perfect continuous: have/has + been + -ing for ongoing action.',
    difficulty: 'intermediate',
  },
  {
    id: 5, chapter: 4,
    setting: 'City Café · Saturday',
    bgEmoji: '☕',
    narrator: 'On the weekend, Mia and Leo meet at a café to study English together.',
    character: 'Leo', charEmoji: '👦',
    dialogue: 'If we study hard today, we _____ pass the English test next week!',
    blank: '_____',
    options: ["will", "would", "can"],
    correct: 'will',
    successText: 'They study for two hours and feel very confident. Great teamwork!',
    hint: '💡 First conditional: If + present → will + base verb.',
    difficulty: 'intermediate',
  },
  {
    id: 6, chapter: 5,
    setting: 'Science Lab · Morning',
    bgEmoji: '🔬',
    narrator: 'Mia\'s class has a science experiment today. She needs to explain the results.',
    character: 'Mia', charEmoji: '👧',
    dialogue: 'The plant _____ growing faster since we gave it more sunlight.',
    blank: '_____',
    options: ['has been', 'have been', 'was'],
    correct: 'has been',
    successText: 'The teacher gives Mia an A+ for her explanation. She\'s thrilled!',
    hint: '💡 "The plant" is singular, so use "has been" not "have been".',
    difficulty: 'advanced',
  },
];

// ─── MINI GAMES ──────────────────────────────────────────────────────
export const MINI_GAMES: MiniGame[] = [
  {
    id: 1, name: 'Word Hunt', emoji: '🔍',
    description: 'Find hidden words in the grid',
    color: '#AB47BC', shadowColor: '#6A1B9A',
    unlockLevel: 1, type: 'word-hunt',
  },
  {
    id: 2, name: 'Sentence Builder', emoji: '🧩',
    description: 'Drag words in the right order',
    color: '#66BB6A', shadowColor: '#2E7D32',
    unlockLevel: 2, type: 'sentence-builder',
  },
  {
    id: 3, name: 'Typing Race', emoji: '⌨️',
    description: 'Type fast to earn bonus coins',
    color: '#FF7043', shadowColor: '#BF360C',
    unlockLevel: 3, type: 'typing',
  },
  {
    id: 4, name: 'Flashcards', emoji: '🃏',
    description: 'Tap the correct translation',
    color: '#42A5F5', shadowColor: '#1565C0',
    unlockLevel: 5, type: 'flashcard',
  },
];

// ─── WORD HUNT WORDS ─────────────────────────────────────────────────
export const WORD_HUNT_WORDS = ['CAT', 'DOG', 'SUN', 'RUN', 'FUN', 'HAT', 'MAP', 'JAM'];

export const WORD_HUNT_GRID = [
  ['C','A','T','S','U','N'],
  ['D','O','G','R','U','N'],
  ['H','A','T','F','U','N'],
  ['M','A','P','J','A','M'],
  ['B','O','O','K','E','Y'],
  ['P','L','A','Y','T','H'],
];

// ─── SENTENCE BUILDER ────────────────────────────────────────────────
export interface SentenceQuestion {
  words: string[];
  correct: string;
  hint: string;
}

export const SENTENCE_QUESTIONS: SentenceQuestion[] = [
  {
    words: ['likes', 'She', 'cats', 'little'],
    correct: 'She likes little cats',
    hint: 'Subject + verb + adjective + noun',
  },
  {
    words: ['every', 'I', 'English', 'study', 'day'],
    correct: 'I study English every day',
    hint: 'Subject + verb + object + time',
  },
  {
    words: ['are', 'They', 'playing', 'football'],
    correct: 'They are playing football',
    hint: 'Subject + be + verb-ing',
  },
];

// ─── TYPING WORDS ────────────────────────────────────────────────────
export const TYPING_WORDS = [
  'apple', 'banana', 'school', 'teacher', 'elephant',
  'beautiful', 'wonderful', 'adventure', 'friendship', 'knowledge',
];

// ─── FLASHCARDS ──────────────────────────────────────────────────────
export interface Flashcard {
  english: string;
  options: string[];
  correct: string;
  emoji: string;
}

export const FLASHCARDS: Flashcard[] = [
  { english: 'Apple', options: ['আপেল', 'কলা', 'আম'], correct: 'আপেল', emoji: '🍎' },
  { english: 'School', options: ['বাড়ি', 'স্কুল', 'বাজার'], correct: 'স্কুল', emoji: '🏫' },
  { english: 'Happy', options: ['দুঃখিত', 'রাগী', 'খুশি'], correct: 'খুশি', emoji: '😊' },
  { english: 'Sun', options: ['চাঁদ', 'সূর্য', 'তারা'], correct: 'সূর্য', emoji: '☀️' },
  { english: 'Water', options: ['আগুন', 'বায়ু', 'পানি'], correct: 'পানি', emoji: '💧' },
  { english: 'Book', options: ['কলম', 'বই', 'খাতা'], correct: 'বই', emoji: '📚' },
];

// ─── ACHIEVEMENTS ────────────────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_star',   title: 'First Star',    desc: 'Complete your first challenge', emoji: '⭐', bg: '#FFF8E1', target: 1,   current: 1,  unlocked: true  },
  { id: 'streak_7',    title: '7-Day Streak',  desc: 'Log in 7 days in a row',        emoji: '🔥', bg: '#FBE9E7', target: 7,   current: 7,  unlocked: true  },
  { id: 'words_100',   title: '100 Words',     desc: 'Learn 100 English words',       emoji: '💬', bg: '#E8F5E9', target: 100, current: 78, unlocked: false },
  { id: 'story_finish',title: 'Storyteller',   desc: 'Finish a full story chapter',   emoji: '📖', bg: '#FCE4EC', target: 1,   current: 0,  unlocked: false },
  { id: 'speed_demon', title: 'Speed Demon',   desc: 'Type 30 WPM in Typing Race',    emoji: '⚡', bg: '#E3F2FD', target: 30,  current: 18, unlocked: false },
  { id: 'perfect',     title: 'Perfectionist', desc: 'Get 3 stars on 5 challenges',   emoji: '💎', bg: '#F3E5F5', target: 5,   current: 2,  unlocked: false },
];
