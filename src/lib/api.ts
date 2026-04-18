const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// ── Exams ─────────────────────────────────────────────────────────────────
export const examsApi = {
  list: () => request<Exam[]>('/exams'),
  get: (id: string) => request<Exam>(`/exams/${id}`),
  create: (data: Partial<Exam>) =>
    request<Exam>('/exams', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Exam>) =>
    request<Exam>(`/exams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/exams/${id}`, { method: 'DELETE' }),
};

// ── Questions ─────────────────────────────────────────────────────────────
export const questionsApi = {
  byExam: (examId: string) => request<Question[]>(`/questions/exam/${examId}`),
  uploadDocx: (examId: string, questionsFile: File, answersFile: File) => {
    const form = new FormData();
    form.append('questionsFile', questionsFile);
    form.append('answersFile', answersFile);
    return fetch(`${BASE_URL}/questions/upload/${examId}`, {
      method: 'POST',
      body: form,
    }).then(async (r) => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: r.statusText }));
        throw new Error(err.message || 'Upload failed');
      }
      return r.json();
    });
  },
};

// ── Students ──────────────────────────────────────────────────────────────
export const studentsApi = {
  register: (data: { name: string; email: string; matricNumber: string }) =>
    request<Student>('/students', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request<Student[]>('/students'),
  get: (id: string) => request<Student>(`/students/${id}`),
};

// ── Attempts ──────────────────────────────────────────────────────────────
export const attemptsApi = {
  start: (examId: string, studentId: string) =>
    request<Attempt>('/attempts/start', {
      method: 'POST',
      body: JSON.stringify({ examId, studentId }),
    }),
  submit: (data: SubmitPayload) =>
    request<Attempt>('/attempts/submit', { method: 'POST', body: JSON.stringify(data) }),
  byStudent: (studentId: string) =>
    request<Attempt[]>(`/attempts/student/${studentId}`),
  results: (examId: string) =>
    request<{ attempts: Attempt[]; stats: ExamStats }>(`/attempts/results/${examId}`),
  get: (id: string) => request<Attempt>(`/attempts/${id}`),
};

// ── Types ─────────────────────────────────────────────────────────────────
export interface Exam {
  _id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  isActive: boolean;
  instructions?: string;
  passMark: number;
  createdAt: string;
}

export interface Question {
  _id: string;
  examId: string;
  text: string;
  options: string[];
  correctAnswer: string;
  order: number;
  points: number;
  explanation?: string;
  isPassage?: boolean;
}

export interface Student {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
}

export interface Attempt {
  _id: string;
  examId: Exam | string;
  studentId: Student | string;
  answers: Record<string, string>;
  gradedAnswers: GradedAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  startedAt: string;
  status: string;
}

export interface GradedAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ExamStats {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  avgScore: number;
}

export interface SubmitPayload {
  examId: string;
  studentId: string;
  answers: Record<string, string>;
  startedAt?: string;
}
