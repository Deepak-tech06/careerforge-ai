import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CareerForge AI — Intelligent Career Readiness & Resume Analysis',
  description: 'Elevate your career with CareerForge AI. Analyze your resume, identify skill gaps, and get a personalized learning roadmap. AI-powered career readiness platform for developers.',
  keywords: ['CareerForge', 'AI resume analysis', 'skill gap detection', 'career readiness', 'developer jobs', 'tech interviews', 'learning roadmap', 'career growth'],
  authors: [{ name: 'Deepak' }],
  openGraph: {
    title: 'CareerForge AI — Your Career Compass',
    description: 'Transform your resume into an actionable career strategy with AI-driven insights.',
    url: 'https://careerforge.ai',
    siteName: 'CareerForge AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CareerForge AI — AI-Powered Career Intelligence',
    description: 'Discover your skill gaps and get hired faster with our AI resume analysis.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0, background: 'var(--bg)', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}