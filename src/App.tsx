import React from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { CoursesCatalogPage } from './pages/CoursesCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { QuizPlayerPage } from './pages/QuizPlayerPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { LiveClassesPage } from './pages/LiveClassesPage';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';
import { PricingPage } from './pages/PricingPage';
import { AdminConsolePage } from './pages/AdminConsolePage';
import { AuthPages } from './pages/AuthPages';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPages } from './pages/LegalPages';

function AppContent() {
  const { path } = useRouter();

  // Strip query parameters for route matching
  const pathname = path.split('?')[0];

  // Dedicated full-screen learning players
  if (pathname.includes('/learn/') && pathname.includes('/quiz/')) {
    return <QuizPlayerPage />;
  }

  if (pathname.startsWith('/learn/')) {
    return <CoursePlayerPage />;
  }

  const renderCurrentPage = () => {
    if (pathname === '/' || pathname === '') {
      return <HomePage />;
    }
    if (pathname === '/courses') {
      return <CoursesCatalogPage />;
    }
    if (pathname.startsWith('/courses/')) {
      return <CourseDetailPage />;
    }
    if (pathname === '/dashboard') {
      return <StudentDashboardPage />;
    }
    if (pathname === '/classes') {
      return <LiveClassesPage />;
    }
    if (pathname === '/verify' || pathname.startsWith('/verify/')) {
      return <CertificateVerifyPage />;
    }
    if (pathname === '/pricing') {
      return <PricingPage />;
    }
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return <AdminConsolePage />;
    }
    if (pathname === '/login') {
      return <AuthPages mode="login" />;
    }
    if (pathname === '/signup') {
      return <AuthPages mode="signup" />;
    }
    if (pathname === '/forgot-password') {
      return <AuthPages mode="forgot" />;
    }
    if (pathname === '/about') {
      return <AboutPage />;
    }
    if (pathname === '/contact') {
      return <ContactPage />;
    }
    if (pathname === '/terms') {
      return <LegalPages type="terms" />;
    }
    if (pathname === '/privacy') {
      return <LegalPages type="privacy" />;
    }
    if (pathname === '/refund') {
      return <LegalPages type="refund" />;
    }

    // 404 Fallback
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20 px-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">404</h2>
          <p className="text-sm text-slate-600 mb-6">The requested page does not exist or has been relocated.</p>
          <a
            href="/"
            className="bg-violet-600 text-white font-semibold text-xs px-5 py-2.5 rounded-lg inline-block"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{renderCurrentPage()}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
