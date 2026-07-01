/* ============================================
   useEditorSessionTracker.ts — Active Editor Time Tracker
   Tracks active programming sessions per user and project.
   Flushes coding seconds on blur or page exit.
   ============================================ */
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { saveEditorSession, logUserActivity } from '@/services/dbSync';

export function useEditorSessionTracker(activeProjectId: string) {
  const { user } = useAuthStore();
  const activeTimeRef = useRef<number>(0);
  const lastActiveRef = useRef<number>(Date.now());
  const isTrackingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!user || !activeProjectId) return;

    // Start session tracking
    lastActiveRef.current = Date.now();
    isTrackingRef.current = true;

    const flushSession = async () => {
      if (!isTrackingRef.current) return;
      const now = Date.now();
      const elapsedMs = now - lastActiveRef.current;
      const totalSeconds = Math.round((activeTimeRef.current + elapsedMs) / 1000);

      if (totalSeconds > 0) {
        try {
          await saveEditorSession(user.uid, activeProjectId, totalSeconds);
          // Log activity periodically if active for more than 5 minutes
          if (totalSeconds > 300) {
            await logUserActivity(
              user.uid,
              `Programmed in workspace for ${Math.round(totalSeconds / 60)} minutes`,
              '💻',
              'editor'
            );
          }
        } catch (e) {
          console.error("Failed to save active session tracking:", e);
        }
      }

      // Reset markers
      activeTimeRef.current = 0;
      lastActiveRef.current = now;
    };

    const handleFocus = () => {
      lastActiveRef.current = Date.now();
      isTrackingRef.current = true;
    };

    const handleBlur = () => {
      if (isTrackingRef.current) {
        const elapsedMs = Date.now() - lastActiveRef.current;
        activeTimeRef.current += elapsedMs;
        isTrackingRef.current = false;
        flushSession();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      } else {
        handleBlur();
      }
    };

    // Listen for tab focus/blur/visibility and page unload
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', flushSession);

    // Auto-flush session duration every 60 seconds
    const interval = setInterval(() => {
      if (isTrackingRef.current) {
        flushSession();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      flushSession();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', flushSession);
    };
  }, [user, activeProjectId]);
}
export default useEditorSessionTracker;
