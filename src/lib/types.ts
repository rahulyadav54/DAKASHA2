import { QuestionGenerationOutput } from "@/ai/flows/ai-question-generator";

export type Role = 'Student' | 'Teacher' | 'Parent' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface QuizSession {
  id: string;
  content: string;
  title: string;
  questions: QuestionGenerationOutput;
  results?: QuizResult;
  timestamp: number;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  evaluations: AnswerEvaluation[];
  feedback: string;
}

export interface AnswerEvaluation {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions: string;
}

export interface StudentProgress {
  userId: string;
  totalQuizzes: number;
  averageScore: number;
  history: { date: string; score: number }[];
  weakAreas: string[];
}