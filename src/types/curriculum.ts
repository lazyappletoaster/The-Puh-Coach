export interface QuizQuestion {
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
}

export interface Lesson {
  id: string;
  levelId: number;
  order: number;
  title: string;
  sciencePrinciple: string;
  researcherCitation: string;
  briefing: string;
  conceptCheck: QuizQuestion;
  scenarioCheck: QuizQuestion;
  speakingPrompt: string;
  targetCues: [string, string, string];
  modelExample: string;
  xpReward: number;
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  scienceDomain: string;
  summary: string;
  accentHex: string;
  lessons: Lesson[];
}

export interface CoachingEvaluation {
  transcript: string;
  score: number;
  passed: boolean;
  strengths: string[];
  psychologyBreakdown: string;
  vocalAndDeliveryTip: string;
  improvedExample: string;
  coachSummary: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  xp: number;
  streak: number;
  lastPracticeDate?: string;
  hearts: number;
  currentLevel: number;
  completedLessonsCount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LessonProgress {
  lessonId: string;
  userId: string;
  levelId: number;
  bestScore: number;
  attempts: number;
  completed: boolean;
  lastFeedbackSummary?: string;
  updatedAt?: unknown;
}

export interface PracticeSession {
  id?: string;
  userId: string;
  lessonId: string;
  lessonTitle: string;
  mode: 'voice' | 'text';
  transcriptOrText: string;
  score: number;
  coachSummary: string;
  createdAt?: unknown;
}
