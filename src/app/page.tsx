'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { examsApi, Exam } from '@/lib/api';

export default function HomePage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    examsApi.list()
      .then(setExams)
      .catch(() => setError('Could not connect to server. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79,110,247,0.12) 0%, rgba(124,58,237,0.08) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '80px 24px 60px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: 16 }}>
          <span className="badge badge-accent" style={{ fontSize: 13, padding: '6px 14px' }}>
            🎓 CBT Exam System
          </span>
        </div>
        <h1 className="page-title" style={{ fontSize: 48, marginBottom: 16 }}>
          Computer-Based Testing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: 540, margin: '0 auto 32px' }}>
          Take exams online with instant automated grading and real-time results.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin" className="btn btn-secondary">
            ⚙️ Admin Panel
          </Link>
          <Link href="/admin/audit" className="btn btn-outline">
            🔍 Audit Tool
          </Link>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 className="section-title">Available Exams</h2>
          <span className="badge badge-accent">{exams.length} exam{exams.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner spinner-lg" />
            <p>Loading exams…</p>
          </div>
        ) : exams.length === 0 && !error ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)',
            border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No exams available</p>
            <p style={{ fontSize: 14 }}>Visit the Admin Panel to create and upload exam questions.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {exams.map((exam) => (
              <ExamCard key={exam._id} exam={exam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExamCard({ exam }: { exam: Exam }) {
  return (
    <div className="card card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {exam.title}
          </h3>
          <span className="badge badge-accent">{exam.subject}</span>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <InfoPill icon="⏱" label={`${exam.durationMinutes} min`} />
          <InfoPill icon="❓" label={`${exam.totalQuestions} Qs`} />
          <InfoPill icon="✅" label={`Pass: ${exam.passMark}%`} />
        </div>
      </div>

      {exam.instructions && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {exam.instructions.length > 100 ? exam.instructions.slice(0, 100) + '…' : exam.instructions}
        </p>
      )}

      <Link
        href={`/exam/${exam._id}/register`}
        className="btn btn-primary btn-full"
        style={{ marginTop: 'auto' }}
      >
        Start Exam →
      </Link>
    </div>
  );
}

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 12, color: 'var(--text-secondary)',
      background: 'var(--bg-secondary)', padding: '4px 10px',
      borderRadius: 999, border: '1px solid var(--border)',
    }}>
      {icon} {label}
    </span>
  );
}
