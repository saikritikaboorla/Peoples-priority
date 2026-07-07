import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Peoples Priority — Citizen Feedback Platform',
  description: 'AI-powered citizen feedback platform for evidence-based development planning',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
