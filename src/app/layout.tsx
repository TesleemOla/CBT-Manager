import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CBT Exam System',
  description: 'Computer-Based Testing Exam System – take and manage exams online',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
