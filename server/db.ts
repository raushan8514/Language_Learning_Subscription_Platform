import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar: string;
  passwordHash: string; // SHA-256 for simple deterministic verification
  createdAt: string;
  plan: 'free' | 'monthly' | 'yearly';
  planStatus: 'active' | 'cancelled' | 'none';
  streak: number;
  lastActiveDate: string;
  bio?: string;
  isSuspended?: boolean;
}

export interface VocabularyItem {
  term: string;
  phonetic?: string;
  translation: string;
  example: string;
  partOfSpeech: string;
}

export interface DialogueLine {
  speaker: string;
  foreignText: string;
  translation: string;
  pinyinOrRomaji?: string;
  audioText?: string;
}

export interface DownloadableResource {
  title: string;
  filename: string;
  size: string;
  downloadUrl: string;
}

export interface Lesson {
  id: string;
  sectionId: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  order: number;
  isPreview: boolean;
  videoUrl?: string;
  content: string;
  dialogue?: DialogueLine[];
  vocabulary?: VocabularyItem[];
  downloadableResources?: DownloadableResource[];
  quizId?: string;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  language: string;
  level: 'A1 Beginner' | 'A2 Elementary' | 'B1 Intermediate' | 'B2 Upper-Intermediate' | 'C1 Advanced';
  category: string;
  instructorId: string;
  instructorName: string;
  instructorTitle: string;
  instructorAvatar: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  durationHours: number;
  rating: number;
  totalReviews: number;
  prerequisites: string[];
  learningOutcomes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  prompt: string;
  contextSnippet?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  instructions: string;
  passingScorePercent: number;
  timeLimitMinutes: number;
  allowedAttempts: number;
  questions: QuizQuestion[];
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  userEmail: string;
  score: number;
  totalPoints: number;
  scorePercent: number;
  passed: boolean;
  answers: Record<string, string>;
  feedback: Record<string, { correct: boolean; explanation: string; correctAnswer: string }>;
  attemptNumber: number;
  submittedAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedLessonIds: string[];
  lastVisitedLessonId?: string;
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: string;
  certificateId?: string;
}

export interface LiveClass {
  id: string;
  courseId: string;
  courseTitle: string;
  instructorId: string;
  instructorName: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  timezone: string;
  capacity: number;
  enrolledStudentIds: string[];
  meetingUrl: string;
  meetingProvider: 'Zoom' | 'Google Meet';
  meetingId: string;
  passcode: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export interface Certificate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  language: string;
  level: string;
  issueDate: string;
  instructorName: string;
  status: 'valid' | 'revoked';
  revocationReason?: string;
  credentialHash: string;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  type: 'plan_subscription' | 'course_purchase';
  plan?: 'monthly' | 'yearly';
  courseId?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'refunded';
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  courses: Course[];
  sections: Section[];
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  enrollments: Enrollment[];
  liveClasses: LiveClass[];
  certificates: Certificate[];
  transactions: PaymentTransaction[];
}

const DB_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain).digest('hex');
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const str = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', 'lingopro-secret-key-2026').update(str).digest('hex');
  return Buffer.from(str).toString('base64') + '.' + signature;
}

export function verifyToken(token: string): { id: string; email: string; role: 'student' | 'instructor' | 'admin'; name: string } | null {
  try {
    const [b64, signature] = token.split('.');
    if (!b64 || !signature) return null;
    const str = Buffer.from(b64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', 'lingopro-secret-key-2026').update(str).digest('hex');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(str);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Initial Seed Data
const defaultPasswordHash = hashPassword('password123');

const initialUsers: User[] = [
  {
    id: 'usr_admin',
    email: 'admin@lingopro.com',
    name: 'Sarah Jenkins',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    passwordHash: defaultPasswordHash,
    createdAt: '2026-01-10T08:00:00Z',
    plan: 'yearly',
    planStatus: 'active',
    streak: 28,
    lastActiveDate: '2026-10-25',
    bio: 'Platform Administrator & Head of Academic Operations.',
  },
  {
    id: 'usr_inst_1',
    email: 'elena.torres@lingopro.com',
    name: 'Elena Torres',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    passwordHash: defaultPasswordHash,
    createdAt: '2026-01-15T09:00:00Z',
    plan: 'yearly',
    planStatus: 'active',
    streak: 42,
    lastActiveDate: '2026-10-25',
    bio: 'Native Spanish educator from Salamanca with 12+ years preparing students for DELE B2/C1.',
  },
  {
    id: 'usr_inst_2',
    email: 'kenji.sato@lingopro.com',
    name: 'Kenji Sato',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    passwordHash: defaultPasswordHash,
    createdAt: '2026-02-01T10:00:00Z',
    plan: 'yearly',
    planStatus: 'active',
    streak: 19,
    lastActiveDate: '2026-10-25',
    bio: 'Tokyo-born linguist specializing in JLPT N5–N2 and natural business keigo communication.',
  },
  {
    id: 'usr_student_demo',
    email: 'student@example.com',
    name: 'Alex Rivera',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    passwordHash: defaultPasswordHash,
    createdAt: '2026-03-01T11:00:00Z',
    plan: 'monthly',
    planStatus: 'active',
    streak: 14,
    lastActiveDate: '2026-10-25',
    bio: 'Language enthusiast aiming for fluency in Spanish and conversational Japanese for upcoming work travel.',
  },
  {
    id: 'usr_user_owner',
    email: 'raushansahni8514@gmail.com',
    name: 'Raushan Sahni',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    passwordHash: defaultPasswordHash,
    createdAt: '2026-10-25T12:00:00Z',
    plan: 'yearly',
    planStatus: 'active',
    streak: 7,
    lastActiveDate: '2026-10-25',
    bio: 'Dedicated learner preparing for international business opportunities.',
  }
];

const initialCourses: Course[] = [
  {
    id: 'course_es_a1',
    slug: 'conversational-spanish-foundations',
    title: 'Conversational Spanish: Daily Life & Travel',
    subtitle: 'From zero to speaking confident Spanish in real-world scenarios across Madrid and Latin America.',
    description: 'Master everyday vocabulary, essential verb conjugations, and native pronunciation drills. Designed specifically for beginners wanting practical speaking ability rather than abstract grammar memorization.',
    language: 'Spanish',
    level: 'A1 Beginner',
    category: 'General Conversation',
    instructorId: 'usr_inst_1',
    instructorName: 'Elena Torres',
    instructorTitle: 'Senior Spanish Lecturer & DELE Certified Coach',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
    price: 49,
    isFree: false,
    isPublished: true,
    durationHours: 14,
    rating: 4.9,
    totalReviews: 342,
    prerequisites: ['No prior knowledge required', 'Dedication of 20 minutes daily'],
    learningOutcomes: [
      'Confidently introduce yourself, order food, and navigate public transit in Spanish',
      'Understand present tense regular and essential irregular verbs (ser, estar, tener, ir)',
      'Produce natural pronunciation with rolled R and authentic syllable cadences',
      'Hold 5-to-10 minute conversations with native speakers without freezing'
    ],
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'course_ja_n5',
    slug: 'japanese-starter-hiragana-and-beyond',
    title: 'Zero to Conversational Japanese (JLPT N5 Core)',
    subtitle: 'Master Hiragana, Katakana, practical grammar particles, and respectful daily expressions.',
    description: 'A structured, visual pathway into modern Japanese. Build intuitive understanding of particles (wa, ga, o, ni), basic Kanji origins, sentence structure, and polite desk/travel vocabulary.',
    language: 'Japanese',
    level: 'A1 Beginner',
    category: 'General Conversation',
    instructorId: 'usr_inst_2',
    instructorName: 'Kenji Sato',
    instructorTitle: 'Linguistics M.A. & JLPT Master Instructor',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    price: 59,
    isFree: false,
    isPublished: true,
    durationHours: 18,
    rating: 4.95,
    totalReviews: 512,
    prerequisites: ['Curiosity for Japanese culture and phonetics'],
    learningOutcomes: [
      'Read and write all 46 Hiragana and 46 Katakana with correct stroke orders',
      'Understand SOV sentence mechanics and essential particles (は, が, を, に, で)',
      'Introduce yourself, ask directions in Tokyo stations, and shop with confidence',
      'Pass the grammar and listening portions of JLPT N5'
    ],
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'course_fr_b1',
    slug: 'french-fluency-intermediate-expression',
    title: 'French Fluency & Cultural Expression',
    subtitle: 'Unlock intermediate discussions, past tenses (Passé Composé vs Imparfait), and Parisian nuances.',
    description: 'Elevate your French beyond textbook basics. Engage in debates on current events, cinema, gastronomy, and literature while conquering the subtle rhythms of spoken French.',
    language: 'French',
    level: 'B1 Intermediate',
    category: 'Grammar Mastery',
    instructorId: 'usr_inst_1',
    instructorName: 'Camille Dubois',
    instructorTitle: 'Sorbonne Paris Graduate & DELF Examiner',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    price: 65,
    isFree: false,
    isPublished: true,
    durationHours: 16,
    rating: 4.88,
    totalReviews: 218,
    prerequisites: ['Basic A2 French proficiency', 'Familiarity with basic conjugations'],
    learningOutcomes: [
      'Master the distinction between Passé Composé and Imparfait in storytelling',
      'Use subjunctive mood for wishes, doubts, and emotions',
      'Participate comfortably in casual social dinners and office conversations',
      'Analyze authentic French articles and audio broadcasts'
    ],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'course_de_biz',
    slug: 'german-business-communication',
    title: 'German for the Professional Workplace',
    subtitle: 'Formal email etiquette, negotiation vocabulary, and German corporate cultural norms.',
    description: 'Targeted at professionals relocating to Germany, Austria, or Switzerland. Master precise technical terms, formal Sie forms, project reporting, and polite meeting discourse.',
    language: 'German',
    level: 'B2 Upper-Intermediate',
    category: 'Business & Workplace',
    instructorId: 'usr_inst_2',
    instructorName: 'Markus Weber',
    instructorTitle: 'Corporate Language Consultant, Munich',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
    price: 79,
    isFree: false,
    isPublished: true,
    durationHours: 20,
    rating: 4.92,
    totalReviews: 184,
    prerequisites: ['Intermediate German B1 proficiency'],
    learningOutcomes: [
      'Draft crisp, idiomatic business emails and formal proposals in German',
      'Confidently lead standup meetings and participate in technical reviews',
      'Navigate German labor culture, punctuality norms, and contract terminology',
      'Prepare for Goethe-Zertifikat B2 Beruf examination'
    ],
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'course_zh_hsk1',
    slug: 'mandarin-chinese-tones-and-pinyin',
    title: 'Mandarin Chinese: Tones, Pinyin & Daily Survival',
    subtitle: 'Demystifying the 4 tones, essential characters, and everyday conversational survival.',
    description: 'Learn the world’s most spoken language step by step. We make tone accuracy enjoyable, teach character radicals logically, and guide you through ordering in restaurants, taxis, and WeChat culture.',
    language: 'Mandarin Chinese',
    level: 'A1 Beginner',
    category: 'Pronunciation & Accent',
    instructorId: 'usr_inst_1',
    instructorName: 'Mei-Ling Chen',
    instructorTitle: 'Beijing Language & Culture University Certified',
    instructorAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    price: 55,
    isFree: false,
    isPublished: true,
    durationHours: 15,
    rating: 4.91,
    totalReviews: 295,
    prerequisites: ['None required'],
    learningOutcomes: [
      'Pronounce all 4 Mandarin tones and neutral tone accurately',
      'Read and produce standard Pinyin romanization with tone marks',
      'Recognize 150 high-frequency simplified Chinese characters',
      'Achieve target score on HSK 1 certification test'
    ],
    createdAt: '2026-03-15T08:00:00Z',
    updatedAt: '2026-10-21T09:00:00Z',
  },
  {
    id: 'course_ko_hangul',
    slug: 'korean-hangul-and-essential-phrases',
    title: 'Master Korean Hangul & Natural Phrasing',
    subtitle: 'Learn the scientific Korean alphabet in one afternoon and start speaking K-Drama & Seoul street phrases.',
    description: 'Hangul is widely considered the world’s most intuitive writing system. Learn every vowel and consonant combination, batchim rules, and honorific speech levels.',
    language: 'Korean',
    level: 'A1 Beginner',
    category: 'Travel Essentials',
    instructorId: 'usr_inst_2',
    instructorName: 'Ji-Eun Park',
    instructorTitle: 'Yonsei University Korean Language Institute Alum',
    instructorAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80',
    price: 39,
    isFree: true, // Free gateway course
    isPublished: true,
    durationHours: 10,
    rating: 4.97,
    totalReviews: 640,
    prerequisites: ['No prior experience required'],
    learningOutcomes: [
      'Read and write complete Korean Hangul blocks effortlessly',
      'Understand polite informal endings (-ayo / -eoyo)',
      'Order at Korean restaurants, cafes, and navigate Hongdae & Gangnam',
      'Understand core cultural etiquette and honorific prefixes'
    ],
    createdAt: '2026-03-20T08:00:00Z',
    updatedAt: '2026-10-24T12:00:00Z',
  }
];

const initialSections: Section[] = [
  {
    id: 'sec_es_1',
    courseId: 'course_es_a1',
    title: 'Module 1: First Steps & Greetings in Spain & Latin America',
    order: 1,
    lessons: [
      {
        id: 'les_es_101',
        sectionId: 'sec_es_1',
        courseId: 'course_es_a1',
        title: 'Introductions, Hola & The Golden Pronunciation Rules',
        durationMinutes: 18,
        order: 1,
        isPreview: true,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: `### Welcome to Spanish Foundations!
In this first lesson, you will master the five pure Spanish vowels (A, E, I, O, U) and learn how to greet someone warmly in Madrid, Mexico City, or Buenos Aires.

Unlike English, Spanish vowels are always pure and never diphthongized. When you say **"O"**, your lips form a round, stable shape without gliding into a "w" sound.

#### Key Cultural Tip:
In Spanish-speaking countries, eye contact and a cordial greeting like *"¡Buenos días!"* (Good morning) or *"¡Buenas tardes!"* (Good afternoon) precede any request. Walking into a bakery or shop without saying hello is considered impolite.`,
        dialogue: [
          { speaker: 'Elena', foreignText: '¡Hola! ¿Cómo te llamas?', translation: 'Hello! What is your name?', audioText: 'Hola, ¿cómo te llamas?' },
          { speaker: 'Mateo', foreignText: 'Me llamo Mateo. ¿Y tú?', translation: 'My name is Mateo. And you?', audioText: 'Me llamo Mateo. ¿Y tú?' },
          { speaker: 'Elena', foreignText: 'Mucho gusto, Mateo. Yo soy Elena de Madrid.', translation: 'Nice to meet you, Mateo. I am Elena from Madrid.', audioText: 'Mucho gusto, Mateo. Yo soy Elena de Madrid.' }
        ],
        vocabulary: [
          { term: 'Hola', phonetic: '[ˈo.la]', translation: 'Hello / Hi', example: '¡Hola! ¿Qué tal?', partOfSpeech: 'Interjection' },
          { term: 'Me llamo', phonetic: '[me ˈʝa.mo]', translation: 'My name is (I call myself)', example: 'Me llamo Sofia.', partOfSpeech: 'Phrase' },
          { term: 'Mucho gusto', phonetic: '[ˈmu.tʃo ˈɣus.to]', translation: 'Nice to meet you', example: 'Mucho gusto en conocerte.', partOfSpeech: 'Phrase' },
          { term: '¿Cómo estás?', phonetic: '[ˈko.mo esˈtas]', translation: 'How are you?', example: 'Hola Juan, ¿cómo estás hoy?', partOfSpeech: 'Phrase' }
        ],
        downloadableResources: [
          { title: 'Spanish Vowel & Phonetics Guide (PDF)', filename: 'spanish_phonetics_cheatsheet.pdf', size: '1.2 MB', downloadUrl: '#' },
          { title: 'Printable Flashcards - Module 1', filename: 'module1_flashcards.pdf', size: '2.4 MB', downloadUrl: '#' }
        ]
      },
      {
        id: 'les_es_102',
        sectionId: 'sec_es_1',
        courseId: 'course_es_a1',
        title: 'Numbers 1-100 & Ordering at a Tapas Bar',
        durationMinutes: 22,
        order: 2,
        isPreview: false,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        content: `### Ordering Like a Local
When in a cafe or tapas bar, avoid translating "Can I please have" word for word. Native speakers naturally say:
- **"Para mí, un café con leche, por favor."** (For me, a coffee with milk, please.)
- **"¿Me pone una ración de bravas?"** (Could you bring me a portion of bravas?)

Learn how numbers link seamlessly into currency calculations (euros & pesos).`,
        dialogue: [
          { speaker: 'Camarero', foreignText: 'Buenas tardes, ¿qué desean tomar?', translation: 'Good afternoon, what would you like to drink?', audioText: 'Buenas tardes, ¿qué desean tomar?' },
          { speaker: 'Elena', foreignText: 'Para mí, un café solo y una tortilla de patatas.', translation: 'For me, a black coffee and a potato omelet.', audioText: 'Para mí, un café solo y una tortilla de patatas.' },
          { speaker: 'Camarero', foreignText: 'Muy bien. ¿Algo más?', translation: 'Very well. Anything else?', audioText: 'Muy bien. ¿Algo más?' },
          { speaker: 'Elena', foreignText: 'No, nada más. La cuenta, por favor.', translation: 'No, nothing else. The bill, please.', audioText: 'No, nada más. La cuenta, por favor.' }
        ],
        vocabulary: [
          { term: 'La cuenta', phonetic: '[la ˈkwen.ta]', translation: 'The bill / check', example: '¿Nos trae la cuenta, por favor?', partOfSpeech: 'Noun' },
          { term: 'Por favor', phonetic: '[poɾ faˈβoɾ]', translation: 'Please', example: 'Un agua con gas, por favor.', partOfSpeech: 'Adverb' },
          { term: 'Café solo', phonetic: '[kaˈfe ˈso.lo]', translation: 'Espresso (black coffee)', example: 'Prefiero café solo por la mañana.', partOfSpeech: 'Noun' }
        ],
        quizId: 'quiz_es_1'
      }
    ]
  },
  {
    id: 'sec_es_2',
    courseId: 'course_es_a1',
    title: 'Module 2: Essential Verbs (Ser vs. Estar)',
    order: 2,
    lessons: [
      {
        id: 'les_es_201',
        sectionId: 'sec_es_2',
        courseId: 'course_es_a1',
        title: 'Ser vs. Estar: The Definitive Framework',
        durationMinutes: 25,
        order: 1,
        isPreview: false,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        content: `### The Two "To Be" Verbs
Both **Ser** and **Estar** mean "to be", but they carry completely distinct semantic weight:
- **SER (DOCTOR)**: Description, Occupation, Characteristic, Time, Origin, Relationship.
- **ESTAR (PLACE)**: Position, Location, Action (present progressive), Condition, Emotion.

Notice how the meaning shifts:
- *Soy listo* = I am smart.
- *Estoy listo* = I am ready!`,
        dialogue: [
          { speaker: 'Carlos', foreignText: '¿Dónde está el museo del Prado?', translation: 'Where is the Prado Museum?', audioText: '¿Dónde está el museo del Prado?' },
          { speaker: 'Lucia', foreignText: 'Está cerca de aquí. Es un edificio clásico muy famoso.', translation: 'It is near here. It is a very famous classical building.', audioText: 'Está cerca de aquí. Es un edificio clásico muy famoso.' }
        ],
        vocabulary: [
          { term: 'Ser', phonetic: '[seɾ]', translation: 'To be (permanent / intrinsic)', example: 'Ella es médica.', partOfSpeech: 'Verb' },
          { term: 'Estar', phonetic: '[esˈtaɾ]', translation: 'To be (state / location)', example: 'Madrid está en España.', partOfSpeech: 'Verb' },
          { term: 'Cerca de', phonetic: '[ˈseɾ.ka ðe]', translation: 'Close to / Near', example: 'Mi hotel está cerca de la estación.', partOfSpeech: 'Prepositional Phrase' }
        ]
      }
    ]
  },
  {
    id: 'sec_ja_1',
    courseId: 'course_ja_n5',
    title: 'Module 1: Hiragana Mastery & Basic Etiquette',
    order: 1,
    lessons: [
      {
        id: 'les_ja_101',
        sectionId: 'sec_ja_1',
        courseId: 'course_ja_n5',
        title: 'Hiragana Vowels & The Art of Ojigi (Bowing)',
        durationMinutes: 20,
        order: 1,
        isPreview: true,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: `### Welcome to Japanese!
Japanese writing uses three scripts:
1. **Hiragana (ひらがな)**: 46 phonetic characters used for native Japanese words and grammar particles.
2. **Katakana (カタカナ)**: 46 phonetic characters used for foreign loanwords (like *koohii* for coffee).
3. **Kanji (漢字)**: Chinese logographic characters representing core conceptual meanings.

In this lesson, we master the foundation vowels: **あ (a), い (i), う (u), え (e), お (o)**.`,
        dialogue: [
          { speaker: 'Kenji', foreignText: 'はじめまして。佐藤です。よろしくお願いします。', pinyinOrRomaji: 'Hajimemashite. Satou desu. Yoroshiku onegaishimasu.', translation: 'Nice to meet you. I am Sato. Pleased to make your acquaintance.', audioText: 'はじめまして。佐藤です。よろしくお願いします。' },
          { speaker: 'Anna', foreignText: 'はじめまして、アンナです。こちらこそ！', pinyinOrRomaji: 'Hajimemashite, Anna desu. Kochirakoso!', translation: 'Nice to meet you, I am Anna. Likewise!', audioText: 'はじめまして、アンナです。こちらこそ！' }
        ],
        vocabulary: [
          { term: 'はじめまして', phonetic: '[ha.dʑi.me.ma.ɕi.te]', translation: 'Nice to meet you (for the first time)', example: 'はじめまして、田中です。', partOfSpeech: 'Expression' },
          { term: 'よろしくお願いします', phonetic: '[jo.ɾo.ɕi.kɯ o.ne.ɡa.i.ɕi.ma.sɯ]', translation: 'Please treat me well / Looking forward to working with you', example: 'どうぞよろしくお願いします。', partOfSpeech: 'Expression' }
        ],
        quizId: 'quiz_ja_1'
      }
    ]
  },
  {
    id: 'sec_ko_1',
    courseId: 'course_ko_hangul',
    title: 'Module 1: The Hangul Alphabet Matrix',
    order: 1,
    lessons: [
      {
        id: 'les_ko_101',
        sectionId: 'sec_ko_1',
        courseId: 'course_ko_hangul',
        title: 'King Sejong’s Alphabet: Consonants and Vowels',
        durationMinutes: 16,
        order: 1,
        isPreview: true,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        content: `### The Scientific Genius of Hangul
Created in 1443 by King Sejong the Great, Hangul is designed so that the shape of consonants mimics the shape of the mouth and tongue when making the sound:
- **ㄱ (g/k)**: Tongue blocking the back of the throat.
- **ㄴ (n)**: Tongue tip touching the upper gums.
- **ㅁ (m)**: Lips coming together.
- **ㅅ (s)**: Teeth shape.

Every Korean syllable is arranged in a compact block of 2 to 4 letters.`,
        dialogue: [
          { speaker: 'Minho', foreignText: '안녕하세요! 반갑습니다.', pinyinOrRomaji: 'Annyeonghaseyo! Bangapseumnida.', translation: 'Hello! Nice to meet you.', audioText: '안녕하세요! 반갑습니다.' },
          { speaker: 'Sara', foreignText: '안녕하세요! 저는 사라입니다.', pinyinOrRomaji: 'Annyeonghaseyo! Jeoneun Sara-imnida.', translation: 'Hello! I am Sara.', audioText: '안녕하세요! 저는 사라입니다.' }
        ],
        vocabulary: [
          { term: '안녕하세요', phonetic: '[an.njʌŋ.ha.se.jo]', translation: 'Hello (polite)', example: '선생님, 안녕하세요!', partOfSpeech: 'Greeting' },
          { term: '감사합니다', phonetic: '[kam.sa.ham.ni.da]', translation: 'Thank you (formal)', example: '도와주셔서 감사합니다.', partOfSpeech: 'Expression' }
        ]
      }
    ]
  }
];

const initialQuizzes: Quiz[] = [
  {
    id: 'quiz_es_1',
    courseId: 'course_es_a1',
    lessonId: 'les_es_102',
    title: 'Module 1 Mastery Assessment: Spanish Essentials',
    instructions: 'Test your understanding of greetings, numbers, tapas ordering etiquette, and basic pronunciation rules. Passing score is 80%.',
    passingScorePercent: 80,
    timeLimitMinutes: 15,
    allowedAttempts: 3,
    questions: [
      {
        id: 'q_es_1',
        type: 'multiple-choice',
        prompt: 'Which phrase is the most natural way to order a coffee with milk in a Spanish cafe?',
        options: [
          'Para mí, un café con leche, por favor.',
          '¿Puedo tener un café con leche ahora?',
          'Quiero tu café con leche.',
          'Dame café con leche inmediatamente.'
        ],
        correctAnswer: 'Para mí, un café con leche, por favor.',
        explanation: '"Para mí... por favor" is the standard, natural, polite way native speakers order in cafes across Spain and Latin America.',
        points: 25
      },
      {
        id: 'q_es_2',
        type: 'multiple-choice',
        prompt: 'When asking for the bill at the conclusion of a meal, you say:',
        options: [
          'La cuenta, por favor.',
          'El dinero, por favor.',
          'El papel de pago, por favor.',
          '¿Cuánto es mi deuda?'
        ],
        correctAnswer: 'La cuenta, por favor.',
        explanation: '"La cuenta, por favor" translates to "The bill/check, please."',
        points: 25
      },
      {
        id: 'q_es_3',
        type: 'short-answer',
        prompt: 'Type the Spanish word for "Hello" (include correct punctuation if you wish, accents are not required):',
        correctAnswer: 'hola',
        explanation: '"Hola" means hello or hi in Spanish. The initial "H" is always silent.',
        points: 25
      },
      {
        id: 'q_es_4',
        type: 'multiple-choice',
        prompt: 'Which vowel sound in Spanish is pronounced like the "ee" in English "feet"?',
        options: [
          'I',
          'E',
          'A',
          'O'
        ],
        correctAnswer: 'I',
        explanation: 'In Spanish, the letter "I" always has the pure vowel sound /i/, as in "sí" or English "machine" / "feet".',
        points: 25
      }
    ]
  },
  {
    id: 'quiz_ja_1',
    courseId: 'course_ja_n5',
    lessonId: 'les_ja_101',
    title: 'Hiragana & Introductions Checkpoint',
    instructions: 'Verify your mastery of first meetings in Japan and core Hiragana phonetics.',
    passingScorePercent: 75,
    timeLimitMinutes: 10,
    allowedAttempts: 5,
    questions: [
      {
        id: 'q_ja_1',
        type: 'multiple-choice',
        prompt: 'What is the customary phrase used when introducing yourself for the very first time?',
        options: [
          'はじめまして (Hajimemashite)',
          'さようなら (Sayounara)',
          'おやすみなさい (Oyasuminasai)',
          'いただききます (Itadakimasu)'
        ],
        correctAnswer: 'はじめまして (Hajimemashite)',
        explanation: 'Hajimemashite literally originates from "hajimete" (for the first time), expressing "we meet for the first time."',
        points: 50
      },
      {
        id: 'q_ja_2',
        type: 'short-answer',
        prompt: 'Which writing system in Japanese is specifically used for native grammar particles and native Japanese words? (hiragana, katakana, or kanji)',
        correctAnswer: 'hiragana',
        explanation: 'Hiragana is the primary syllabary for native words and grammatical markers.',
        points: 50
      }
    ]
  }
];

const initialEnrollments: Enrollment[] = [
  {
    id: 'enr_alex_es',
    userId: 'usr_student_demo',
    courseId: 'course_es_a1',
    enrolledAt: '2026-03-05T10:00:00Z',
    completedLessonIds: ['les_es_101', 'les_es_102', 'les_es_201'],
    lastVisitedLessonId: 'les_es_201',
    progressPercent: 100,
    isCompleted: true,
    completedAt: '2026-04-12T16:30:00Z',
    certificateId: 'LP-2026-ES01-9842'
  },
  {
    id: 'enr_alex_ja',
    userId: 'usr_student_demo',
    courseId: 'course_ja_n5',
    enrolledAt: '2026-04-01T12:00:00Z',
    completedLessonIds: ['les_ja_101'],
    lastVisitedLessonId: 'les_ja_101',
    progressPercent: 100,
    isCompleted: true,
    completedAt: '2026-05-01T09:00:00Z',
    certificateId: 'LP-2026-JA01-4419'
  },
  {
    id: 'enr_raushan_es',
    userId: 'usr_user_owner',
    courseId: 'course_es_a1',
    enrolledAt: '2026-10-25T14:00:00Z',
    completedLessonIds: ['les_es_101'],
    lastVisitedLessonId: 'les_es_102',
    progressPercent: 33,
    isCompleted: false
  }
];

const initialCertificates: Certificate[] = [
  {
    id: 'LP-2026-ES01-9842',
    userId: 'usr_student_demo',
    userName: 'Alex Rivera',
    userEmail: 'student@example.com',
    courseId: 'course_es_a1',
    courseTitle: 'Conversational Spanish: Daily Life & Travel',
    language: 'Spanish',
    level: 'A1 Beginner',
    issueDate: '2026-04-12',
    instructorName: 'Elena Torres',
    status: 'valid',
    credentialHash: 'e7b1a9c8f0412e4d9b231765c3089efb'
  },
  {
    id: 'LP-2026-JA01-4419',
    userId: 'usr_student_demo',
    userName: 'Alex Rivera',
    userEmail: 'student@example.com',
    courseId: 'course_ja_n5',
    courseTitle: 'Zero to Conversational Japanese (JLPT N5 Core)',
    language: 'Japanese',
    level: 'A1 Beginner',
    issueDate: '2026-05-01',
    instructorName: 'Kenji Sato',
    status: 'valid',
    credentialHash: '4a89bc2190184fa920cc1124ef985390'
  }
];

const initialLiveClasses: LiveClass[] = [
  {
    id: 'class_es_speaking_1',
    courseId: 'course_es_a1',
    courseTitle: 'Conversational Spanish: Daily Life & Travel',
    instructorId: 'usr_inst_1',
    instructorName: 'Elena Torres',
    title: 'Live Practice: Ordering Tapas & Navigating Madrid',
    description: 'Interactive breakout rooms where students practice real dialogue with feedback on accent and rhythm directly from Elena.',
    startTime: '2026-10-28T18:00:00Z',
    endTime: '2026-10-28T19:00:00Z',
    timezone: 'UTC-5 (EST)',
    capacity: 25,
    enrolledStudentIds: ['usr_student_demo', 'usr_user_owner'],
    meetingUrl: 'https://zoom.us/j/94827103847?pwd=LingoProLive2026',
    meetingProvider: 'Zoom',
    meetingId: '948 2710 3847',
    passcode: 'LingoPro2026',
    status: 'scheduled'
  },
  {
    id: 'class_ja_kanji_1',
    courseId: 'course_ja_n5',
    courseTitle: 'Zero to Conversational Japanese (JLPT N5 Core)',
    instructorId: 'usr_inst_2',
    instructorName: 'Kenji Sato',
    title: 'Masterclass: JLPT N5 Particle Traps (Wa vs Ga)',
    description: 'Deep dive into confusing Japanese particles with live quizzes, whiteboards, and Q&A.',
    startTime: '2026-10-29T20:00:00Z',
    endTime: '2026-10-29T21:15:00Z',
    timezone: 'UTC-5 (EST)',
    capacity: 30,
    enrolledStudentIds: ['usr_student_demo'],
    meetingUrl: 'https://meet.google.com/xyz-lingo-pro',
    meetingProvider: 'Google Meet',
    meetingId: 'xyz-lingo-pro',
    passcode: 'No passcode required',
    status: 'scheduled'
  }
];

const initialTransactions: PaymentTransaction[] = [
  {
    id: 'tx_sub_alex',
    userId: 'usr_student_demo',
    type: 'plan_subscription',
    plan: 'monthly',
    amount: 29,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-03-01T11:05:00Z'
  },
  {
    id: 'tx_sub_raushan',
    userId: 'usr_user_owner',
    type: 'plan_subscription',
    plan: 'yearly',
    amount: 249,
    currency: 'USD',
    status: 'succeeded',
    createdAt: '2026-10-25T12:05:00Z'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch {
        this.data = this.getDefaultData();
        this.save();
      }
    } else {
      this.data = this.getDefaultData();
      this.save();
    }
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private getDefaultData(): DatabaseSchema {
    return {
      users: initialUsers,
      courses: initialCourses,
      sections: initialSections,
      quizzes: initialQuizzes,
      submissions: [],
      enrollments: initialEnrollments,
      liveClasses: initialLiveClasses,
      certificates: initialCertificates,
      transactions: initialTransactions,
    };
  }

  public save() {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public update<K extends keyof DatabaseSchema>(collection: K, updater: (items: DatabaseSchema[K]) => DatabaseSchema[K]) {
    this.data[collection] = updater(this.data[collection]);
    this.save();
    return this.data[collection];
  }
}

export const db = new Database();
