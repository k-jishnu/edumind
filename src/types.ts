export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  xp: number;
  streak: number;
  level: number;
  lastActive: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface Note {
  id?: string;
  userId: string;
  content: string;
  topic: string;
  createdAt: any;
}

export interface Lesson {
  id?: string;
  userId: string;
  noteId?: string;
  topic: string;
  title: string;
  summary: string;
  explanation: string;
  keyPoints: string[];
  examples: string[];
  examNotes: string;
  createdAt: any;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface Quiz {
  id?: string;
  lessonId?: string;
  userId: string;
  topic: string;
  questions: QuizQuestion[];
  createdAt: any;
}

export interface QuizResult {
  id?: string;
  quizId: string;
  userId: string;
  topic: string;
  score: number;
  total: number;
  difficulty: string;
  createdAt: any;
}

export interface StudyPlanDay {
  day: string;
  tasks: string[];
}

export interface StudyPlan {
  id?: string;
  userId: string;
  goal: string;
  schedule: StudyPlanDay[];
  createdAt: any;
}

export interface Progress {
  userId: string;
  topic: string;
  masteryScore: number;
  lastAttemptAt: any;
}

export interface UploadedFile {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadURL: string;
  extractedText: string;
  createdAt: any;
}

export interface Flashcard {
  front: string;
  back: string;
  known: boolean;
}

export interface FlashcardSet {
  id: string;
  fileId: string;
  userId: string;
  title: string;
  cards: Flashcard[];
  createdAt: any;
}
