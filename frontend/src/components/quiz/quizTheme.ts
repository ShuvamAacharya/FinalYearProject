export const QUIZ_BG = '#0f1117';
export const QUIZ_CARD = '#1a1d27';
export const QUIZ_ELEVATED = '#1f2937';
export const QUIZ_BORDER = '#2d3748';
export const QUIZ_ACCENT = '#3b82f6';
export const QUIZ_SUCCESS = '#10b981';
export const QUIZ_ERROR = '#ef4444';

export const API_BASE = 'http://localhost:5000';

export interface QuizQuestion {
  question: string;
  options: string[];
}

export interface QuizData {
  _id: string;
  title: string;
  course?: { title?: string };
  questions: QuizQuestion[];
  duration?: number;
  passingScore?: number;
  creditPoints?: number;
  difficulty?: string;
}

export interface AnswerReviewItem {
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface QuizSubmitResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  certificate?: { certificateNumber: string; pdfPath: string } | null;
  pointsEarned?: number;
  totalCreditPoints?: number;
  passingScore?: number;
  review?: AnswerReviewItem[];
  newlyInstructorEligible?: boolean;
}
