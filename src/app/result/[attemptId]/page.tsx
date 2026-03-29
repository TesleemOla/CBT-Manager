'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { attemptsApi, Attempt, Exam } from '@/lib/api';

export default function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    attemptsApi.get(attemptId)
      .then(setAttempt)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <div className="loading-center"><div className="spinner-lg" /></div>;
  if (!attempt) return <div className="container" style={{ padding: 40 }}><div className="alert alert-error">Result not found.</div></div>;

  const exam = attempt.examId as Exam;
  const isPassed = attempt.percentage >= exam.passMark;

  return (
    <div className="page-wrapper" style={{ padding: '60px 24px' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div className={`result-circle ${isPassed ? 'passed' : 'failed'}`}>
            <div className="result-percent">{attempt.percentage}%</div>
            <div className="result-label">Score</div>
          </div>
          <h1 className="page-title" style={{ fontSize: 32, marginBottom: 8 }}>{isPassed ? 'Congratulations!' : 'Keep Practicing!'}</h1>
          <p className="text-secondary" style={{ fontSize: 18 }}>You scored {attempt.score} out of {attempt.totalPoints} points.</p>
          <div style={{ marginTop: 16 }}>
             <span className={`badge ${isPassed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 16, padding: '8px 20px' }}>
                {isPassed ? '🎉 PASSED' : '❌ FAILED'}
             </span>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 32 }}>
            <div className="stat-card">
                <span className="stat-label">Subject</span>
                <span className="stat-value" style={{ fontSize: 18 }}>{exam.subject}</span>
            </div>
            <div className="stat-card">
                <span className="stat-label">Pass Mark</span>
                <span className="stat-value" style={{ fontSize: 18 }}>{exam.passMark}%</span>
            </div>
            <div className="stat-card">
                <span className="stat-label">Duration Taken</span>
                <span className="stat-value" style={{ fontSize: 18 }}>
                    {Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)} Min
                </span>
            </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <h3 className="section-title" style={{ fontSize: 16 }}>Answer Breakdown</h3>
            </div>
            <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                   <thead>
                      <tr>
                         <th>Result</th>
                         <th>Points</th>
                         <th>Selected Answer</th>
                      </tr>
                   </thead>
                   <tbody>
                      {attempt.gradedAnswers.map((ans, i) => (
                         <tr key={i}>
                            <td>
                               <span className={`badge ${ans.isCorrect ? 'badge-success' : 'badge-danger'}`}>
                                  {ans.isCorrect ? 'Correct' : 'Incorrect'}
                               </span>
                            </td>
                            <td>{ans.pointsEarned} / {ans.pointsEarned ? ans.pointsEarned : (ans.isCorrect ? 1 : 0)}</td>
                            <td><span className="text-secondary">{ans.selectedAnswer || 'No Answer'}</span></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
            </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 40, justifyContent: 'center' }}>
            <Link href="/" className="btn btn-secondary btn-lg">Back to Homepage</Link>
            <Link href={`/exam/${exam._id}/register`} className="btn btn-primary btn-lg">Retake Exam</Link>
        </div>
      </div>
    </div>
  );
}
