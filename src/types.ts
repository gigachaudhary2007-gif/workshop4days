export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  avatar?: string;
  gradeLevel?: string;
  studyGoalHours?: number;
  completedTasksToday?: number;
  streakDays?: number;
  rememberMe?: boolean;
}

export type AppView = 'home' | 'doubt-solver' | 'ai-notes' | 'news-paper' | 'my-notes' | 'settings';

export interface StepSolution {
  stepNumber: number;
  title: string;
  explanation: string;
  mathOrCode?: string;
}

export interface DoubtSolution {
  mainContext: string;
  mainPoints: string[];
  stepByStepSolution: StepSolution[];
  finalAnswer: string;
  quickSummary: string;
}

export interface DoubtRecord {
  id: string;
  question: string;
  subject: string;
  timestamp: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  solution?: DoubtSolution;
}

export interface ConceptItem {
  concept: string;
  description: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface FormulaItem {
  name: string;
  formula: string;
  explanation: string;
}

export interface ExampleItem {
  problem: string;
  solution: string;
}

export interface QuestionItem {
  question: string;
  hint: string;
  answer: string;
}

export interface AnalyzedNoteContent {
  topic: string;
  importantConcepts: ConceptItem[];
  definitions: DefinitionItem[];
  formulas: FormulaItem[];
  keyPoints: string[];
  examples: ExampleItem[];
  importantQuestions: QuestionItem[];
  quickRevision: string[];
}

export interface AnalyzedNoteRecord {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  summary: string;
  rawText?: string;
  data: AnalyzedNoteContent;
}

export interface NewsArticleHindi {
  title: string;
  category: string;
  summary: string;
  content: string[];
  studentTakeaway: string;
  quizPrompt?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Education' | 'Science & Tech' | 'Space' | 'AI & Tech' | 'Discoveries' | 'Opportunities' | 'Exams & Updates' | 'Global Affairs';
  source: string;
  date: string;
  readTime: string;
  summary: string;
  content: string[];
  studentTakeaway: string;
  quizPrompt?: string;
  badge?: string;
  featured?: boolean;
  hindi?: NewsArticleHindi;
}

export interface VisualNode {
  id: string;
  label: string;
  category: 'primary' | 'concept' | 'formula' | 'outcome';
  x: number;
  y: number;
}

export interface VisualLink {
  from: string;
  to: string;
  label: string;
}

export interface VisualGraphData {
  title: string;
  type: string;
  description: string;
  nodes: VisualNode[];
  links: VisualLink[];
  keyTakeaway: string;
}

export interface StudentNotebookNote {
  id: string;
  title: string;
  subject: string;
  folder?: string;
  updatedAt: string;
  createdAt?: string;
  textContent?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  canvasData?: string; // Data URL for drawings/sketches
  drawingDataUrl?: string;
  visualGraph?: VisualGraphData;
}
