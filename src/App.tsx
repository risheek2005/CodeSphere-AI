/* ============================================
   App.tsx — Root component with routing
   ============================================ */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { ToastContainer } from '@/components/shared/Toast';
import LoadingScreen from '@/components/shared/LoadingScreen';
import GlobalAIAssistant from '@/components/ai/GlobalAIAssistant';

/* ---- Lazy loaded pages ---- */
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));
const EditorPage = lazy(() => import('@/features/editor/EditorPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const CommunityPage = lazy(() => import('@/features/community/CommunityPage'));
const InterviewPage = lazy(() => import('@/features/interview/InterviewPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));

export default function App() {
  const { setIsMobile } = useUIStore();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
      <ToastContainer />
      {/* Global AI Copilot — visible on every page */}
      <GlobalAIAssistant />
    </BrowserRouter>
  );
}
