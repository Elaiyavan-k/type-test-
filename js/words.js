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

// ========== Curated Paragraphs by Difficulty ==========
const PARAGRAPHS = {
  easy: [
    "The sun is hot today. A little bird sings a song in the tree. We can go for a walk by the lake. The water is blue and calm. I see a green leaf on the grass. Life is good and simple. We like to run and play.",
    "Come and look at this. The cat is asleep on the soft mat. It has a long tail and white paws. Do not make a noise. We want it to rest. Soon we will have some food. It is time to eat.",
    "I have a big book. It has many pictures of animals. Some are green and some are red. I read this book every day before I go to sleep. It helps me learn new words. My mom gave it to me.",
    "The tree is very tall. It has green leaves in summer. In winter the leaves fall to the ground. A small squirrel has its home in the trunk. It runs up and down looking for nuts. It is fast.",
    "We went to the beach. The sand was warm under our feet. We built a sand castle near the water. The waves were small. We found some shells. It was a happy day with my friends. We will go back soon.",
    "My dog is very kind. He likes to play catch with a red ball. When I come home he wags his tail. He sits by my side when I do my work. We go for walks in the park. He is my best friend.",
    "The sky has many stars tonight. The moon is big and bright. It is dark and quiet outside. I like to look out of the window. The world is asleep. It is time for me to go to bed and dream.",
    "We can make a cake today. We need some flour, sugar, and milk. We will mix them in a big bowl. Then we put it in the oven. It smells very good. We will share it with the family."
  ],
  medium: [
    "In the middle of every difficulty lies opportunity. The greatest glory in living lies not in never falling, but in rising every time we fall. Believe you can and you are halfway there. Your time is limited, so do not waste it living someone else's life.",
    "Learning never exhausts the mind. The beautiful thing about learning is that nobody can take it away from you. Education is the most powerful weapon which you can use to change the world. Always do your best, and what you plant now, you will harvest later.",
    "The only way to do great work is to love what you do. If you have not found it yet, keep looking. Do not settle. As with all matters of the heart, you will know when you find it. Have the courage to follow your heart and intuition.",
    "Keep your eyes on the stars and your feet on the ground. You miss one hundred percent of the shots you do not take. Try to be a rainbow in someone else's cloud. The best way to predict the future is to create it ourselves.",
    "It is during our darkest moments that we must focus to see the light. Do not go where the path may lead, go instead where there is no path and leave a trail. Be yourself; everyone else is already taken. Let us make our future now.",
    "Warm coffee on a rainy morning can make the whole day feel different. The sound of droplets hitting the window pane brings a sense of calm. It is a perfect moment to read a book, write some thoughts down, or just listen to the quiet.",
    "Nature does not hurry, yet everything is accomplished. The trees grow slowly but surely, stretching their branches toward the sky. Rivers carve paths through solid rock over thousands of years. Persistence and patience are powerful forces in our lives.",
    "A journey of a thousand miles begins with a single step. The secret of getting ahead is getting started. Do not watch the clock; do what it does. Keep going. What lies behind us and what lies before us are tiny matters compared to what lies within us."
  ],
  hard: [
    "The system administrator queried the PostgreSQL database, executing: `SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC;`. The query execution took exactly 0.042 seconds, returning a JSON array of 1,024 user records. However, a memory leak in the node.js backend process (PID: 9482) caused a 15% latency spike across all responsive endpoints.",
    "Seneca once remarked: 'Life, if you know how to use it, is long.' (Consider the value of 100% devotion: it yields 10x returns!). Yet, modern distractions are ubiquitous; our smartphones, social feeds, and notifications constantly obfuscate our long-term goals. To succeed, one must juxtapose daily discipline against transient pleasures.",
    "The celestial coordinates of the newly discovered exoplanet are 14h 29m 42s right ascension and -62° 40' 46\" declination. Observations suggest a carbon-based atmosphere with temperature variations between -150°C and 45°C. At an estimated distance of 4.2 light-years, it represents a remarkable cosmological target for the next generation of space telescopes.",
    "A quintessential paradox of writing clean software code is that complexity must be hidden behind simple interfaces. As Dijkstra famously declared, 'Simplicity is a great virtue but it requires hard work to achieve it.' (For instance, wrapping asynchronous callbacks in promises or async/await syntax: `const data = await fetch(url).then(r => r.json());`).",
    "The entrepreneur analyzed the company's financial records: Q1 revenue was $1,245,800 (a 12.5% increase year-over-year), while operational expenses reached €950,400. In their presentation, they highlighted three key performance indicators: customer acquisition cost, monthly recurring revenue, and churn rate. Success depends on maintaining a healthy 3:1 LTV-to-CAC ratio.",
    "The labyrinth was an extraordinary, idiosyncratic structure, characterized by a kaleidoscope of winding paths, secret chambers, and dead ends. A sense of serendipity guided the travelers as they navigated the maze. 'Listen,' one whispered, hearing a mellifluous sound echoing through the stone corridors: a soft flute playing a haunting melody.",
    "To implement responsive layouts, web developers combine semantic HTML5, CSS media queries, and Tailwind CSS classes. Example: `<div class=\"grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-white/10\">...</div>`. This ensures that cards wrap on mobile displays but align side-by-side on desktop viewports. Proper alignment improves usability by 40%.",
    "The Antikythera mechanism (circa 150-100 BC) is an ancient Greek analog computer used to predict astronomical positions and eclipses. It employed a complex system of over thirty bronze gears with triangular teeth. Historians call it a technological marvel; nothing of equal sophistication appeared again for over a millennium."
  ]
};

function getWordsByDifficulty(level, count = 60) {
  const paras = PARAGRAPHS[level] || PARAGRAPHS['medium'];
  let selectedWords = [];
  const usedIndices = new Set();
  
  while (selectedWords.length < count) {
    let idx = Math.floor(Math.random() * paras.length);
    if (usedIndices.size < paras.length) {
      while (usedIndices.has(idx)) {
        idx = Math.floor(Math.random() * paras.length);
      }
      usedIndices.add(idx);
    }
    const paraWords = paras[idx].split(/\s+/).filter(w => w.length > 0);
    selectedWords = selectedWords.concat(paraWords);
  }
  
  return selectedWords.slice(0, count);
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