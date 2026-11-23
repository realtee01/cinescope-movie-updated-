import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Film } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

const Auth = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const { user, loginDemo, signupDemo } = useMovieContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError('');
    setPassword('');
  }, [mode]);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      if (isLogin) {
        loginDemo({ email, password });
      } else {
        signupDemo({ name, email, password });
      }
      setSubmitting(false);
      navigate('/');
    }, 350);
  };

  const handleQuickDemo = () => {
    setSubmitting(true);
    setTimeout(() => {
      signupDemo({ name: 'Alex Mercer', email: 'demo@cinescope.app', password: 'demo-user' });
      setSubmitting(false);
      navigate('/');
    }, 250);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16 overflow-hidden">
      {/* Subtle Ambient Backdrop Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-orange-500/10 blur-[140px]" />

      <div className="relative w-full max-w-md bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 mb-4">
            <Film size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-playfair font-black tracking-tight text-white">
            {isLogin ? 'Welcome back' : 'Join CineScope'}
          </h1>
          <p className="text-sm text-white/50 mt-2">
            {isLogin
              ? 'Sign in to access your demo profile and watchlist.'
              : 'Create a demo account to personalize your movie experience.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 mb-6 bg-black/40 border border-white/10 rounded-xl">
          <Link
            to="/login"
            className={`text-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isLogin
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={`text-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
              !isLogin
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Sign Up
          </Link>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tobiloba Akala"
                  autoComplete="name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 transition shadow-lg shadow-orange-500/25"
          >
            {submitting
              ? isLogin
                ? 'Signing in...'
                : 'Creating account...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
            {!submitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-widest text-white/40">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* One-Click Demo Sign-In */}
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={submitting}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          Continue with Demo Account
        </button>

        <p className="text-center text-xs text-white/40 mt-6">
          Demo authentication — stored locally in your browser.
        </p>
      </div>
    </div>
  );
};

export default Auth;
