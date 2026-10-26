export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatar: string;
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
  isCompleted?: boolean;
  isLocked?: boolean;
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
  totalLessons?: number;
  totalSections?: number;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer';
  prompt: string;
  contextSnippet?: string;
  options?: string[];
  points: number;
  correctAnswer?: string;
  explanation?: string;
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
  totalPoints?: number;
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

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'free' | 'monthly' | 'yearly';
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
  buttonText: string;
}
