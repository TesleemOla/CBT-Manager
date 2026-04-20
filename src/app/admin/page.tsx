'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { examsApi, questionsApi, Exam } from '@/lib/api';

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  // Form State for new exam
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    durationMinutes: 60,
    passMark: 70,
    instructions: '',
  });

  const fetchExams = () => {
    examsApi.list()
      .then(setExams)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await examsApi.create(formData);
      setIsCreateModalOpen(false);
      fetchExams();
      setFormData({ title: '', subject: '', durationMinutes: 60, passMark: 70, instructions: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam and all its questions?')) {
      try {
        await examsApi.delete(id);
        fetchExams();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            <div className="brand-icon">🎓</div>
            Admin Dashboard
          </Link>
          <div className="navbar-links">
            <Link href="/admin/audit" className="nav-link">🔍 Audit Tool</Link>
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>+ Create Exam</button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '40px 0' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <div>
                <h1 className="page-title">Manage Exams</h1>
                <p className="text-secondary">Create exams and upload questions from Word files.</p>
            </div>
            <div className="stats-grid" style={{ width: 'auto' }}>
                <div className="stat-card" style={{ padding: '12px 24px' }}>
                    <span className="stat-label">Total Exams</span>
                    <span className="stat-value">{exams.length}</span>
                </div>
            </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner-lg" />
            <p style={{ marginTop: 12 }}>Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p className="text-secondary">No exams found. Click "Create Exam" to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Pass Mark</th>
                  <th>Config</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{exam.title}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>ID: {exam._id}</div>
                    </td>
                    <td><span className="badge badge-accent">{exam.subject}</span></td>
                    <td>{exam.durationMinutes}m</td>
                    <td>{exam.passMark}%</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                         <span className={`badge ${exam.totalQuestions > 0 ? 'badge-success' : 'badge-warning'}`}>
                            {exam.totalQuestions || 0} Questions
                         </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setUploadTargetId(exam._id)}>
                             📁 Upload
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam._id)}>
                             Delete
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="section-title" style={{ marginBottom: 24 }}>Create New Exam</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Exam Title</label>
                <input required className="form-input" placeholder="e.g. Mid-term Biology" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input required className="form-input" placeholder="e.g. Science" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Duration (Minutes)</label>
                    <input type="number" required min="1" className="form-input" value={formData.durationMinutes} onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pass Mark (%)</label>
                    <input type="number" required min="1" max="100" className="form-input" value={formData.passMark} onChange={e => setFormData({ ...formData, passMark: parseInt(e.target.value) })} />
                  </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea className="form-input" rows={3} placeholder="Provide exam rules or guidelines..." value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" className="btn btn-primary btn-full">Save Exam</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadTargetId && (
        <UploadModal 
          examId={uploadTargetId} 
          onClose={() => setUploadTargetId(null)} 
          onSuccess={() => {
            setUploadTargetId(null);
            fetchExams();
          }}
        />
      )}
    </div>
  );
}

interface UploadModalProps {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadModal({ examId, onClose, onSuccess }: UploadModalProps) {
  const [questionsFile, setQuestionsFile] = useState<File | null>(null);
  const [answersFile, setAnswersFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const qRef = useRef<HTMLInputElement>(null);
  const aRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!questionsFile || !answersFile) {
      setError('Please select both questions and answer key files.');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      await questionsApi.uploadDocx(examId, questionsFile, answersFile);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error uploading files. Check your format.');
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <h2 className="section-title">Upload Exam Data</h2>
        <p className="text-secondary" style={{ marginBottom: 24, fontSize: 13 }}>
          Import questions and answer key from DOCX files.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Questions File Slot */}
          <div className="form-group">
            <label className="form-label">Questions DOCX</label>
            <div 
              className={`upload-zone ${questionsFile ? 'has-file' : ''}`}
              onClick={() => qRef.current?.click()}
              style={{ padding: '24px 16px' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {questionsFile ? questionsFile.name : 'Select Questions File'}
              </div>
              <p className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                {questionsFile ? 'Click to change file' : 'Standard question format required'}
              </p>
              <input 
                type="file" 
                ref={qRef} 
                accept=".docx" 
                style={{ display: 'none' }} 
                onChange={e => setQuestionsFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Answers File Slot */}
          <div className="form-group">
            <label className="form-label">Answer Key DOCX</label>
            <div 
              className={`upload-zone ${answersFile ? 'has-file' : ''}`}
              onClick={() => aRef.current?.click()}
              style={{ padding: '24px 16px' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔑</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {answersFile ? answersFile.name : 'Select Answer Key File'}
              </div>
              <p className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
                {answersFile ? 'Click to change file' : 'A separate file with answer labels'}
              </p>
              <input 
                type="file" 
                ref={aRef} 
                accept=".docx" 
                style={{ display: 'none' }} 
                onChange={e => setAnswersFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button 
              className="btn btn-primary btn-full" 
              onClick={handleUpload} 
              disabled={isUploading || !questionsFile || !answersFile}
            >
              {isUploading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, marginRight: 8 }} />
                  Processing...
                </>
              ) : 'Import Questions & Answers'}
            </button>
            <button className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
