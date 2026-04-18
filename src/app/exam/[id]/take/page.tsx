'use client';
import { useEffect, useState, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { examsApi, questionsApi, attemptsApi, Exam, Question, Attempt } from '@/lib/api';

export default function ExamTakePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const attemptId = searchParams.get('attemptId');
  const studentId = searchParams.get('studentId');

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!attemptId || !studentId) {
      router.push(`/exam/${id}/register`);
      return;
    }

    const loadData = async () => {
      try {
        const [e, q, a] = await Promise.all([
          examsApi.get(id),
          questionsApi.byExam(id),
          attemptsApi.get(attemptId)
        ]);
        setExam(e);
        setQuestions(q);
        setAnswers(a.answers || {});

        // Timer logic
        const startTime = new Date(a.startedAt).getTime();
        const durationMs = e.durationMinutes * 60 * 1000;
        const elapsedMs = Date.now() - startTime;
        const remainSeconds = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
        setTimeLeft(remainSeconds);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, attemptId, studentId, router]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitting) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitting]);

  const handleSelect = (qId: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await attemptsApi.submit({
        examId: id,
        studentId: studentId!,
        answers: answers
      });
      router.push(`/result/${result._id}`);
    } catch (err: any) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = seconds % 60;
    return `${hh > 0 ? hh + ':' : ''}${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`;
  };

  if (loading) return <div className="loading-center"><div className="spinner-lg" /></div>;
  if (!exam || questions.length === 0) return <div className="container" style={{ padding: 40 }}><div className="alert alert-error">No questions found.</div></div>;

  const currentQ = questions[currentIdx];
  const totalQuestionsList = questions.filter(q => !q.isPassage);
  const totalQuestionsCount = totalQuestionsList.length;

  const getQuestionNumber = (idx: number) => {
    if (questions[idx].isPassage) return 'P';
    const count = questions.slice(0, idx + 1).filter(q => !q.isPassage).length;
    return count;
  };

  const progress = totalQuestionsCount > 0 
    ? Math.round((Object.keys(answers).length / totalQuestionsCount) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      <header className="exam-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="brand-icon" style={{ width: 32, height: 32, fontSize: 16 }}>📝</div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>{exam.title}</h3>
            <p className="text-secondary" style={{ fontSize: 11 }}>{exam.subject} Exam</p>
          </div>
        </div>

        <div style={{ flex: 1, margin: '0 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span className="text-muted" style={{ fontSize: 10 }}>Progress: {Object.keys(answers).length}/{totalQuestionsCount} answered</span>
            <span className="text-muted" style={{ fontSize: 10 }}>{progress}%</span>
          </div>
          <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
        </div>

        <div style={{ textAlign: 'right' }}>
           <button className="btn btn-success" onClick={handleSubmit} disabled={isSubmitting}>Finish Exam</button>
        </div>
      </header>

      <div className="exam-layout">
        <div className="exam-content">
          <div className="question-card" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="question-number">
              {currentQ.isPassage ? 'Comprehension Passage' : `Question ${getQuestionNumber(currentIdx)} of ${totalQuestionsCount}`}
            </div>
            <div 
              className="question-text" 
              style={{ 
                fontSize: currentQ.isPassage ? '1.15rem' : '1.25rem', 
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                opacity: 0.95
              }}
            >
              {currentQ.text}
            </div>

            {!currentQ.isPassage && (
              <div className="options-list">
                {currentQ.options.map((option, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = answers[currentQ._id] === option;
                  return (
                    <div
                      key={i}
                      className={`option-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(currentQ._id, option)}
                    >
                      <div className="option-letter">{letter}</div>
                      <div className="option-text">{option}</div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <button
                className="btn btn-secondary"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
              >
                ← Previous
              </button>
              <button
                className="btn btn-primary"
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
              >
                Next (Ctrl + →)
              </button>
            </div>
          </div>
        </div>

        <aside className="exam-sidebar">
          <div className="timer-card">
            <div className="form-label" style={{ marginBottom: 4 }}>Time Remaining</div>
            <div className={`timer-display ${timeLeft < 300 ? 'warning' : ''} ${timeLeft < 60 ? 'danger' : ''}`}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="question-nav">
            <div className="question-nav-title">Questions Navigation</div>
            <div className="question-nav-grid">
              {questions.map((q, i) => (
                <button
                  key={q._id}
                  className={`q-nav-btn ${i === currentIdx ? 'current' : ''} ${answers[q._id] ? 'answered' : ''} ${q.isPassage ? 'is-passage' : ''}`}
                  onClick={() => setCurrentIdx(i)}
                >
                  {getQuestionNumber(i)}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
