import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Globe2, Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface AuthPagesProps {
  mode: 'login' | 'signup' | 'forgot';
}

export function AuthPages({ mode }: AuthPagesProps) {
  const { path, navigate } = useRouter();
  const { login, register, demoLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Extract redirect query param if present
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(redirectPath);
      } else if (mode === 'signup') {
        await register(name, email, password);
        navigate('/dashboard');
      } else if (mode === 'forgot') {
        setMessage(`Instructions have been dispatched to ${email}. You may sign in with default password 'password123'.`);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: string, userEmail?: string) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(role, userEmail);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-200">
            <Globe2 className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            Lingo<span className="text-violet-600">Pro</span>
          </span>
        </button>

        <h2 className="text-2xl font-extrabold text-slate-900">
          {mode === 'login' && 'Sign in to your account'}
          {mode === 'signup' && 'Create your student account'}
          {mode === 'forgot' && 'Reset your password'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {mode === 'login' && "Don't have an account? "}
          {mode === 'login' && (
            <button onClick={() => navigate('/signup')} className="font-semibold text-violet-600 hover:underline">
              Start free trial
            </button>
          )}
          {mode === 'signup' && 'Already registered? '}
          {mode === 'signup' && (
            <button onClick={() => navigate('/login')} className="font-semibold text-violet-600 hover:underline">
              Log in here
            </button>
          )}
          {mode === 'forgot' && (
            <button onClick={() => navigate('/login')} className="font-semibold text-violet-600 hover:underline">
              Back to login
            </button>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {/* Quick 1-Click Role Switcher for Testing */}
          <div className="mb-6 p-3.5 bg-slate-900 rounded-xl text-xs space-y-2 text-white">
            <p className="font-bold text-[11px] text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              1-Click Demo Testing Switcher
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded font-medium text-[11px] text-left transition"
              >
                👑 <strong>Admin</strong> (Sarah)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('instructor')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded font-medium text-[11px] text-left transition"
              >
                🎓 <strong>Instructor</strong> (Elena)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('student', 'student@example.com')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded font-medium text-[11px] text-left transition"
              >
                🎒 <strong>Student</strong> (Alex)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('student', 'raushansahni8514@gmail.com')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 px-2 rounded font-medium text-[11px] text-left transition"
              >
                ⭐ <strong>Owner</strong> (Raushan)
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="learner@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-[11px] text-violet-600 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-xs"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Student Account' : 'Send Reset Link'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-bit encrypted authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
