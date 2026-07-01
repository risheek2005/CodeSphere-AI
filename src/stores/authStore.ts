/* ============================================
   Auth Store — Authentication state
   Integrated with Firebase OAuth & Firestore User records
   ============================================ */
import { create } from 'zustand';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  githubProvider, 
  isFirebaseConfigured,
  setDocument,
  getDocument
} from '@/services/firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  level: number;
  xp: number;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  setLoading: (val: boolean) => void;
  syncUserSession: (firebaseUser: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Listen to Auth State Changes
  if (isFirebaseConfigured && auth) {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await get().syncUserSession(firebaseUser);
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  } else {
    // Local environment user observer fallback
    setTimeout(() => {
      const savedUser = localStorage.getItem('codesphere_simulated_user');
      if (savedUser) {
        set({ user: JSON.parse(savedUser), isAuthenticated: true, isLoading: false });
      }
    }, 100);
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,

    setLoading: (val) => set({ isLoading: val }),

    syncUserSession: async (firebaseUser) => {
      set({ isLoading: true });
      const userUid = firebaseUser.uid;
      const email = firebaseUser.email || '';
      const name = firebaseUser.displayName || email.split('@')[0] || 'Developer';
      const avatar = firebaseUser.photoURL || '';

      // Check if user document already exists in Firestore
      let userProfile = await getDocument<UserProfile>('users', userUid);
      if (!userProfile) {
        userProfile = {
          uid: userUid,
          name,
          email,
          avatar,
          role: 'Developer',
          level: 1,
          xp: 100,
        };
        await setDocument('users', userUid, userProfile);
      }

      set({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false
      });

      // Dynamically import and trigger workspace load to avoid circular dependencies
      import('./editorStore').then((store) => {
        store.useEditorStore.getState().loadWorkspace(userUid);
      });
      import('./aiChatStore').then((store) => {
        store.useAIChatStore.getState().loadUserChats(userUid);
      });
    },

    loginWithGoogle: async () => {
      set({ isLoading: true });
      if (isFirebaseConfigured && auth) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          await get().syncUserSession(result.user);
        } catch (error) {
          console.error("Google sign-in failed:", error);
          set({ isLoading: false });
          throw error;
        }
      } else {
        // Simulated popup flow for offline mode
        const simUser: UserProfile = {
          uid: 'sim-google-uid-101',
          name: 'Google Dev Guest',
          email: 'google.guest@codesphere.ai',
          avatar: '',
          role: 'Senior Engineer',
          level: 5,
          xp: 2450
        };
        localStorage.setItem('codesphere_simulated_user', JSON.stringify(simUser));
        set({ user: simUser, isAuthenticated: true, isLoading: false });
      }
    },

    loginWithGitHub: async () => {
      set({ isLoading: true });
      if (isFirebaseConfigured && auth) {
        try {
          const result = await signInWithPopup(auth, githubProvider);
          await get().syncUserSession(result.user);
        } catch (error) {
          console.error("GitHub sign-in failed:", error);
          set({ isLoading: false });
          throw error;
        }
      } else {
        // Simulated Github login
        const simUser: UserProfile = {
          uid: 'sim-github-uid-202',
          name: 'GitHub Dev Guest',
          email: 'github.guest@codesphere.ai',
          avatar: '',
          role: 'Principal Architect',
          level: 10,
          xp: 6800
        };
        localStorage.setItem('codesphere_simulated_user', JSON.stringify(simUser));
        set({ user: simUser, isAuthenticated: true, isLoading: false });
      }
    },

    loginAsDemo: () => {
      const demoProfile: UserProfile = {
        uid: 'demo-guest-id',
        name: 'Alex Chen (Guest)',
        email: 'alex.chen@codesphere.ai',
        avatar: '',
        role: 'Pro Developer',
        level: 24,
        xp: 12450
      };
      set({
        user: demoProfile,
        isAuthenticated: true,
        isLoading: false
      });
    },

    logout: async () => {
      set({ isLoading: true });
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
      localStorage.removeItem('codesphere_simulated_user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  };
});
