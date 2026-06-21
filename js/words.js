// Word list - 300+ common English words for typing tests
const WORD_LIST = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "I",
  "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from",
  "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can",
  "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about",
  "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these",
  "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such",
  "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many",
  "must", "look", "before", "great", "back", "through", "long", "where", "much", "should",
  "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel",
  "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation",
  "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between",
  "need", "mean", "called", "during", "turn", "really", "without", "again", "against",
  "being", "leave", "something", "might", "next", "below", "last", "under", "never",
  "let", "point", "why", "off", "going", "thing", "right", "few", "public", "same", "able",
  "quite", "case", "year", "far", "away", "fact", "head", "interest", "government", "child",
  "system", "set", "voice", "number", "course", "side", "problem", "face", "far", "open",
  "door", "mind", "early", "example", "kind", "group", "often", "until", "run", "water",
  "money", "story", "young", "word", "love", "test", "type", "quick", "brown", "fox", "jumps",
  "lazy", "dog", "keyboard", "computer", "program", "system", "design", "create", "build",
  "code", "data", "function", "variable", "object", "array", "string", "number", "boolean",
  "value", "return", "class", "method", "property", "event", "handler", "callback", "promise",
  "async", "await", "fetch", "json", "html", "css", "javascript", "tailwind", "responsive",
  "modern", "clean", "fast", "smooth", "elegant", "simple", "complex", "challenge", "practice",
  "improve", "skill", "speed", "accuracy", "focus", "concentrate", "learn", "teach", "share",
  "explore", "discover", "create", "imagine", "dream", "achieve", "success", "journey",
  "adventure", "story", "moment", "memory", "future", "present", "past", "today", "tomorrow",
  "yesterday", "always", "never", "sometimes", "often", "rarely", "quickly", "slowly",
  "carefully", "boldly", "bravely", "wisely", "kindly", "gently", "softly", "loudly",
  "silently", "peacefully", "powerful", "brilliant", "creative", "innovative", "unique",
  "special", "wonderful", "amazing", "fantastic", "incredible", "excellent", "perfect",
  "beautiful", "gorgeous", "stunning", "magnificent", "extraordinary", "remarkable",
  "outstanding", "exceptional", "phenomenal", "spectacular", "marvelous", "wonderful",
  "fantasy", "reality", "fiction", "nonfiction", "science", "art", "music", "literature",
  "history", "geography", "mathematics", "philosophy", "psychology", "sociology",
  "economics", "politics", "culture", "tradition", "custom", "habit", "routine",
  "schedule", "calendar", "appointment", "meeting", "conference", "presentation",
  "discussion", "conversation", "dialogue", "communication", "message", "email",
  "letter", "note", "report", "document", "file", "folder", "directory", "path",
  "address", "location", "position", "place", "area", "region", "country", "continent",
  "planet", "galaxy", "universe", "space", "time", "moment", "second", "minute", "hour",
  "day", "week", "month", "year", "decade", "century", "millennium", "era", "age",
  "generation", "family", "parent", "mother", "father", "sister", "brother", "son",
  "daughter", "cousin", "uncle", "aunt", "grandmother", "grandfather", "friend",
  "stranger", "neighbor", "colleague", "partner", "spouse", "child", "adult", "teenager",
  "baby", "toddler", "elder", "senior", "youth", "kid", "boy", "girl", "man", "woman",
  "person", "human", "being", "creature", "animal", "plant", "insect", "bird", "fish",
  "mammal", "reptile", "amphibian", "species", "breed", "type", "kind", "sort", "variety"
];

// Generate deterministic daily challenge word list based on date
function generateDailyWords(count = 60) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  const rng = seededRandom(seed);
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_LIST[Math.floor(rng() * WORD_LIST.length)]);
  }
  return words;
}

// Get random words for typing test
function getRandomWords(count = 50) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  }
  return words;
}

// ========== Difficulty levels ==========
// Easy: short, common 3-4 letter words — great for beginners learning home row
// Medium: common everyday English words (5-8 letters)
// Hard: longer / less common words, includes numbers, punctuation, capitalization
const EASY_WORDS = WORD_LIST.filter(w => w.length <= 4);
const HARD_EXTRA = [
  'rhythm', 'queue', 'mnemonic', 'pseudonym', 'pharaoh', 'exquisite', 'onomatopoeia',
  'juxtapose', 'kaleidoscope', 'labyrinth', 'quintessential', 'serendipity', 'paradigm',
  'phenomenon', 'entrepreneur', 'conscientious', 'idiosyncratic', 'mellifluous', 'obfuscate',
  'penultimate', 'quixotic', 'ubiquitous', 'verisimilitude', 'zeitgeist', 'calligraphy',
  'photosynthesis', 'hippopotamus', 'chrysanthemum', 'flabbergasted', 'incomprehensible',
  'perspicacious', 'sesquipedalian', 'antidisestablishmentarianism'
];
const HARD_PHRASES = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'How vexingly quick daft zebras jump!',
  'Sphinx of black quartz, judge my vow.',
  'The five boxing wizards jump quickly.',
  'Jackdaws love my big sphinx of quartz.',
  'Cwm fjord bank glyphs vext quiz.',
  'Heavy boxes perform quick waltzes and jigs.',
  'A wizard\'s job is to vex chumps quickly.',
  'Crazy Fredrick bought many very exquisite opal jewels.',
  'We promptly judged antique ivory buckles for the next prize.',
  'A large fawn jumped quickly over white zinc boxes.',
  'Back in June we delivered oxygen equipment of the same size.',
  'Few quips galvanized the mock jury box.',
  'The jay, pig, fox, zebra, and my wolves quack!',
  'Sympathizing would fix Quaker objectives.',
  'Why shouldn\'t a quixotic Kazakh vampire vex all jolly Swabians?',
  'Glib jocks quiz nymph to vex dwarf.',
  'Blowzy red-foxed nymphs deftly jugged my quartz.',
  'Cozy sphinx waves quart jug of bad milk.',
  'Fix problem: bold hawk sends first vibrant squawk.',
  'Mr. Jock, TV quiz Ph.D., bags few lynx.',
  'Amazingly few discotheques provide jukeboxes.',
  'Quick zephyrs blow, vexing daft Jim.',
  'Two driven jocks help fax my big quiz.',
  'Mix Zapf with brackets: [] {} <> ()',
  'Email me at jane.doe+work@example.com by 12:30 p.m.',
  'Set price to $1,234.50 (approx. €1,150).',
  'Coordinates: 40.7128° N, 74.0060° W.',
  'The ratio is 3:1 — that\'s 75% efficiency!'
];

function getWordsByDifficulty(level, count = 60) {
  if (level === 'easy') {
    // Easy: short common words only
    const words = [];
    for (let i = 0; i < count; i++) {
      words.push(EASY_WORDS[Math.floor(Math.random() * EASY_WORDS.length)]);
    }
    return words;
  }
  if (level === 'hard') {
    // Hard: mix of uncommon words, long words, and phrase challenges
    const pool = [...WORD_LIST, ...HARD_EXTRA];
    const words = [];
    // 30% chance each: insert a phrase chunk
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.3 && words.length < count - 5) {
        const phrase = HARD_PHRASES[Math.floor(Math.random() * HARD_PHRASES.length)]
          .replace(/[.,!?]/g, '').split(/\s+/);
        words.push(...phrase);
      } else {
        words.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      if (words.length >= count) break;
    }
    return words.slice(0, count);
  }
  // Medium (default): full common list
  return getRandomWords(count);
}

// Lessons for the typing tutorial — each is a curated word list with a focus
const LESSONS = {
  'home-row': {
    title: 'Home Row',
    description: 'Master the foundation: a s d f j k l ;',
    words: ['sad', 'add', 'dad', 'fad', 'lass', 'fall', 'all', 'shall', 'shall', 'salad',
            'asks', 'alfalfa', 'falls', 'dallas', 'jazz', 'flask', 'ask', 'flask', 'flask']
  },
  'top-row': {
    title: 'Top Row',
    description: 'Reach up: q w e r t y u i o p',
    words: ['type', 'writer', 'quiet', 'quote', 'quite', 'equal', 'quite', 'tower',
            'twenty', 'poetry', 'report', 'output', 'power', 'tower', 'pirate', 'triple']
  },
  'bottom-row': {
    title: 'Bottom Row',
    description: 'Reach down: z x c v b n m',
    words: ['zoom', 'cabin', 'banana', 'vacuum', 'cocoa', 'zombie', 'maven', 'canvas',
            'combo', 'bamboo', 'minimax', 'examine', 'amazing', 'buzz', 'common', 'column']
  },
  'numbers': {
    title: 'Numbers & Symbols',
    description: 'Practice digits and punctuation',
    words: ['123', '456', '7890', '24/7', 'C3PO', '2024', '3.14', '2nd', '100%', '#1',
            '$50', '50%', '2:30', 'A1', 'B2', 'H2O', 'Q1', '1,000', '7-11', '4u']
  },
  'capitals': {
    title: 'Capitalization',
    description: 'Shift key + first letter practice',
    words: ['The', 'Paris', 'London', 'January', 'Monday', 'Google', 'Apple', 'India',
            'I', 'America', 'English', 'Hello', 'Welcome', 'TypeFlow', 'Best', 'Practice']
  }
};

function getLessonWords(lessonKey) {
  const lesson = LESSONS[lessonKey];
  if (!lesson) return getRandomWords(50);
  // Repeat the lesson words enough times to fill ~50 words
  const words = [];
  while (words.length < 50) words.push(...lesson.words);
  return words.slice(0, 50);
}