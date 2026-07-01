/* ============================================
   LoginPage.tsx — Premium Auth View
   Supports Demo, Google, GitHub, and Email flows using Firebase Auth.
   ============================================ */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { GithubIcon, GoogleIcon } from '@/components/shared/SocialIcons';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { isFirebaseConfigured, auth, setDocument } from '@/services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithGitHub, loginAsDemo } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = () => {
    setIsLoading(true);
    loginAsDemo();
    addToast({
      type: 'success',
      title: 'Logged in as Guest',
      message: 'Welcome to CodeSphere AI workspace.',
    });
    navigate('/dashboard');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Please fill in all fields.',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        if (isRegistering) {
          const credentials = await createUserWithEmailAndPassword(auth, email, password);
          const userUid = credentials.user.uid;
          const userProfile = {
            uid: userUid,
            name: email.split('@')[0],
            email: email,
            avatar: '',
            role: 'Developer',
            level: 1,
            xp: 100
          };
          await setDocument('users', userUid, userProfile);
          addToast({
            type: 'success',
            title: 'Account Created',
            message: `Welcome to CodeSphere, ${email.split('@')[0]}!`,
          });
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          addToast({
            type: 'success',
            title: 'Logged In Successfully',
            message: 'Accessing developer workspace...',
          });
        }
      } else {
        // Simulated local auth fallback
        const simUid = `sim-email-${email.split('@')[0]}`;
        const simUser = {
          uid: simUid,
          name: email.split('@')[0],
          email: email,
          avatar: '',
          role: 'Developer',
          level: 1,
          xp: 100
        };
        localStorage.setItem('codesphere_simulated_user', JSON.stringify(simUser));
        // Add to simulated users collection
        const usersDb = JSON.parse(localStorage.getItem('db_users') || '{}');
        usersDb[simUid] = simUser;
        localStorage.setItem('db_users', JSON.stringify(usersDb));

        // Use custom local trigger
        useAuthStore.setState({ user: simUser, isAuthenticated: true, isLoading: false });

        addToast({
          type: 'success',
          title: isRegistering ? 'Account Scaffolding Set' : 'Logged In (Simulated Mode)',
          message: `Logged in as ${email.split('@')[0]}`,
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Check credentials or try another method.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGitHub();
      }
      addToast({
        type: 'success',
        title: `Authenticated via ${provider === 'google' ? 'Google' : 'GitHub'}`,
        message: 'Redirecting to your analytics dashboard...',
      });
      navigate('/dashboard');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Sign In Aborted',
        message: err.message || 'OAuth interaction was closed.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <motion.div 
        className="login-container glass-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header">
          <div className="login-logo">
            <Sparkles className="login-logo-icon" />
          </div>
          <h2>{isRegistering ? 'Create your account' : 'Welcome to CodeSphere AI'}</h2>
          <p>{isRegistering ? 'Get started with collaborative cloud workspaces' : 'Enter your credentials to access your workspace'}</p>
        </div>

        <form onSubmit={handleAuthSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {!isRegistering && (
            <div className="forgot-password">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                addToast({ type: 'info', title: 'Password Reset', message: 'Demo mode: password reset email sent.' });
              }}>Forgot password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isRegistering ? 'Sign Up' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="login-divider">
          <span>or continue with</span>
        </div>

        <div className="oauth-grid">
          <button 
            onClick={() => handleOAuthLogin('github')}
            className="btn btn-secondary oauth-btn"
            disabled={isLoading}
          >
            <GithubIcon size={18} />
            GitHub
          </button>
          <button 
            onClick={() => handleOAuthLogin('google')}
            className="btn btn-secondary oauth-btn"
            disabled={isLoading}
          >
            <GoogleIcon size={18} />
            Google
          </button>
        </div>

        <button 
          onClick={handleDemoLogin}
          className="btn btn-ghost demo-login-btn"
          disabled={isLoading}
        >
          ⚡ Explore Workspace as Guest (Demo Mode)
        </button>

        <div className="login-footer">
          <p>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setIsRegistering(!isRegistering);
              }}
            >
              {isRegistering ? 'Sign In' : 'Sign Up'}
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
