'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { examsApi, studentsApi, attemptsApi, Exam } from '@/lib/api';

export default function ExamRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricNumber: '',
  });

  useEffect(() => {
    examsApi.get(id)
      .then(setExam)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Register/Find Student
      const student = await studentsApi.register(formData);
      // 2. Start Attempt
      const attempt = await attemptsApi.start(id, student._id);
      // 3. Go to Exam
      router.push(`/exam/${id}/take?attemptId=${attempt._id}&studentId=${student._id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner-lg" /></div>;
  if (!exam) return <div className="container" style={{ padding: '40px 0' }}><div className="alert alert-error">Exam not found</div></div>;

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal" style={{ maxWidth: 480, animation: 'fadeIn 0.3s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="brand-icon" style={{ margin: '0 auto 16px', fontSize: 24 }}>📖</div>
          <h1 className="page-title">{exam.title}</h1>
          <p className="badge badge-accent" style={{ marginTop: 8 }}>{exam.subject}</p>
        </div>

        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <h2 className="section-title" style={{ fontSize: 16, marginBottom: 12 }}>Exam Rules:</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Duration:</span>
              <span><strong>{exam.durationMinutes} Minutes</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Questions:</span>
              <span><strong>{exam.totalQuestions} Questions</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Pass Mark:</span>
              <span><strong>{exam.passMark}%</strong></span>
            </div>
          </div>
          {exam.instructions && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <p className="text-muted" style={{ lineHeight: 1.5 }}>{exam.instructions}</p>
            </div>
          )}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input required className="form-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" required className="form-input" placeholder="e.g. name@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Matric/ID Number</label>
            <input required className="form-input" placeholder="e.g. 2024-CBT-001" value={formData.matricNumber} onChange={e => setFormData({ ...formData, matricNumber: e.target.value })} />
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg btn-full" style={{ marginTop: 8 }}>
            {submitting ? 'Starting...' : 'Proceed to Exam →'}
          </button>
          <Link href="/" className="btn btn-secondary btn-full">Back to Home</Link>
        </form>
      </div>
    </div>
  );
}
