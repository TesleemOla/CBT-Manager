'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AuditPage() {
  const [reformattedText, setReformattedText] = useState('');
  const [showReformatted, setShowReformatted] = useState(false);
  const [questionsText, setQuestionsText] = useState('');
  const [answersText, setAnswersText] = useState('');
  const [qCount, setQCount] = useState(0);
  const [aCount, setACount] = useState(0);

  // Advanced parser logic for frontend preview (Matches backend logic)
  useEffect(() => {
    const normalizedText = questionsText.replace(/\t/g, ' ').replace(/\r\n/g, '\n').replace(/ {2,}/g, ' ');
    const lines = normalizedText.split('\n');
    let qFound = 0;
    let currentBlockHasOptions = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const isExplicitNumber = /^\d+[.)\s]/.test(trimmedLine);
      const containsAMarker = /(?:\s+|^)\(?a[.)]\s+/i.test(trimmedLine);
      const startsWithAMarker = /^\(?a[.)]\s+/i.test(trimmedLine);

      if (isExplicitNumber || (containsAMarker && !startsWithAMarker)) {
        if (isExplicitNumber || !currentBlockHasOptions) {
          qFound++;
          currentBlockHasOptions = containsAMarker;
        }
      } else if (containsAMarker) {
        currentBlockHasOptions = true;
      }
    }
    
    const aMatches = answersText.match(/(?:^|\s)(\d+)[.)]?\s+([A-Ea-e])(?:\s|$)/g);
    setQCount(qFound);
    setACount(aMatches ? aMatches.length : 0);
  }, [questionsText, answersText]);

  const handleReformat = () => {
    const normalizedText = questionsText.replace(/\t/g, ' ').replace(/\r\n/g, '\n').replace(/ {2,}/g, ' ');
    const lines = normalizedText.split('\n');
    const rawBlocks: { content: string, hasOptions: boolean }[] = [];
    let currentBlock = '';
    let currentHasOptions = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const isExplicitNumber = /^\d+[.)\s]/.test(trimmedLine);
      const containsAMarker = /(?:\s+|^)\(?a[.)]\s+/i.test(trimmedLine);
      const startsWithAMarker = /^\(?a[.)]\s+/i.test(trimmedLine);
      
      const shouldSplit = isExplicitNumber || (containsAMarker && !startsWithAMarker && currentHasOptions);

      if (shouldSplit && currentBlock) {
        rawBlocks.push({ content: currentBlock, hasOptions: currentHasOptions });
        currentBlock = line;
        currentHasOptions = containsAMarker;
      } else {
        currentBlock = (currentBlock ? currentBlock + '\n' : '') + line;
        if (containsAMarker) currentHasOptions = true;
      }
    }
    if (currentBlock) rawBlocks.push({ content: currentBlock, hasOptions: currentHasOptions });

    let order = 1;
    let pendingPassage = '';
    const cleaned = [];

    for (const block of rawBlocks) {
      if (!block.hasOptions) {
        pendingPassage += (pendingPassage ? '\n\n' : '') + block.content.trim();
        continue;
      }

      const qContent = (pendingPassage ? pendingPassage + '\n\n' : '') + block.content.trim();
      pendingPassage = '';

      let qText = qContent;
      const headerMatch = qContent.match(/^\d+[.)\s]\s*([\s\S]+)/);
      if (headerMatch) qText = headerMatch[1];

      const markers = Array.from(qText.matchAll(/(?:\s+|^)\(?([a-eA-E])[.)]\s+/gi));
      if (markers.length >= 2) {
        const body = qText.substring(0, markers[0].index!).trim();
        const opts = markers.map((m, i) => {
          const start = m.index! + m[0].length;
          const end = markers[i+1] ? markers[i+1].index! : qText.length;
          return `(${m[1].toLowerCase()}) ${qText.substring(start, end).trim()}`;
        });
        cleaned.push(`${order}. ${body}\n   ${opts.join('   ')}`);
      } else {
        cleaned.push(`${order}. ${qContent.trim()}`);
      }
      order++;
    }

    setReformattedText(cleaned.join('\n\n'));
    setShowReformatted(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reformattedText);
    alert('Reformatted text copied to clipboard!');
  };

  const diff = qCount - aCount;
  const isMatch = qCount > 0 && qCount === aCount;

  return (
    <div className="page-wrapper min-h-screen">
      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: 16 }}>
            ← Back to Admin
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="page-title">Exam Audit Tool</h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Verify counts and auto-reformat messy questions.
              </p>
            </div>
            {questionsText && (
              <button className="btn btn-primary" onClick={handleReformat}>
                ✨ Auto-Reformat Questions
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showReformatted ? '1fr' : '1fr 1fr', gap: 24, marginBottom: 32 }}>
          {showReformatted ? (
            <div className="card" style={{ border: '1px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent)' }}>Cleaned & Standardized Result</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                   <button className="btn btn-secondary btn-sm" onClick={() => setShowReformatted(false)}>Cancel</button>
                   <button className="btn btn-primary btn-sm" onClick={copyToClipboard}>📋 Copy Result</button>
                </div>
              </div>
              <textarea
                className="form-control"
                readOnly
                style={{ height: 500, fontFamily: 'monospace', fontSize: 13, background: 'var(--bg-secondary)', border: '1px solid var(--accent-alpha)' }}
                value={reformattedText}
              />
            </div>
          ) : (
            <>
              {/* Questions Input */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>Questions Text</h3>
                  <span className={`badge ${qCount > 0 ? 'badge-accent' : ''}`}>{qCount} detected</span>
                </div>
                <textarea
                  className="form-control"
                  style={{ height: 400, fontFamily: 'monospace', fontSize: 13, resize: 'none' }}
                  placeholder="Paste questions here..."
                  value={questionsText}
                  onChange={(e) => setQuestionsText(e.target.value)}
                />
              </div>

              {/* Answers Input */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>Answer Key Text</h3>
                  <span className={`badge ${aCount > 0 ? 'badge-accent' : ''}`}>{aCount} detected</span>
                </div>
                <textarea
                  className="form-control"
                  style={{ height: 400, fontFamily: 'monospace', fontSize: 13, resize: 'none' }}
                  placeholder="Paste answer key here..."
                  value={answersText}
                  onChange={(e) => setAnswersText(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Results Banner */}
        {!showReformatted && (qCount > 0 || aCount > 0) && (
          <div className={`alert ${isMatch ? 'alert-success' : 'alert-error'}`} style={{ borderRadius: 'var(--radius)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 32 }}>{isMatch ? '✅' : '⚠️'}</div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
                  {isMatch ? 'Counts Match Perfectly!' : 'Count Mismatch Detected'}
                </h2>
                <p style={{ opacity: 0.9 }}>
                  {isMatch 
                    ? `Great! Both files contain exactly ${qCount} items. You can safely proceed to upload.` 
                    : `Your questions (${qCount}) and answers (${aCount}) do not match. You are missing ${Math.abs(diff)} ${diff > 0 ? 'answers' : 'questions'}.`}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          <h4 style={{ marginBottom: 16, fontWeight: 600 }}>Formatting Tips:</h4>
          <p className="text-secondary" style={{ fontSize: 14, marginBottom: 16 }}>
            The <strong>Auto-Reformat</strong> tool will attempt to fix common issues like missing numbers or non-standard bracket styles.
          </p>
          <ul style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <li>• Use numbers with dots (e.g., <strong>1.</strong>) to start a question.</li>
            <li>• Use brackets for options (e.g., <strong>(a)</strong> or <strong>a)</strong>).</li>
            <li>• Each answer key item should follow the format <strong>1 A</strong> or <strong>1. B</strong>.</li>
            <li>• Multi-column answer keys (e.g., 1 A 26 D) are supported.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
