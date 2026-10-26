import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Globe2,
  BookOpen,
  Calendar,
  Award,
  CreditCard,
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const { path, navigate } = useRouter();
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const navLinks = [
    { label: 'Explore Courses', path: '/courses' },
    { label: 'Live Classes', path: '/classes' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Verify Credential', path: '/verify' },
  ];

  const handleNav = (targetPath: string) => {
    navigate(targetPath);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setRoleSwitcherOpen(false);
  };

  const handleRoleSwitch = async (role: string, email?: string) => {
    await demoLogin(role, email);
    setRoleSwitcherOpen(false);
    setUserDropdownOpen(false);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Test Assistant Bar for Immediate Testing Across All Roles */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LingoPro Live LMS
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Active User: <strong className="text-white capitalize">{user?.name || 'Guest Visitor'}</strong>
            {user && <span className="text-slate-400 font-mono ml-1">({user.role})</span>}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden md:inline">Quick Role Switch:</span>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'admin'
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin (Sarah)
          </button>
          <button
            onClick={() => handleRoleSwitch('instructor')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'instructor'
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Instructor (Elena)
          </button>
          <button
            onClick={() => handleRoleSwitch('student', 'student@example.com')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'student' && user?.email === 'student@example.com'
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Student (Alex)
          </button>
          <button
            onClick={() => handleRoleSwitch('student', 'raushansahni8514@gmail.com')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              user?.email === 'raushansahni8514@gmail.com'
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Owner (Raushan)
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-violet-200">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Lingo<span className="text-violet-600">Pro</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider text-slate-500 uppercase font-semibold">
                Language Academy
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            {navLinks.map(link => {
              const isActive = path === link.path || (link.path !== '/' && path.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`transition-colors py-1 relative hover:text-slate-900 ${
                    isActive ? 'text-violet-700 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action / Profile */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200 text-left"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('/dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 text-left"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Student Dashboard
                    </button>

                    {(user.role === 'admin' || user.role === 'instructor') && (
                      <button
                        onClick={() => handleNav('/admin')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 text-left"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Console
                      </button>
                    )}

                    <button
                      onClick={() => handleNav('/courses')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 text-left"
                    >
                      <BookOpen className="w-4 h-4" />
                      Browse Catalog
                    </button>

                    <button
                      onClick={() => handleNav('/classes')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700 text-left"
                    >
                      <Calendar className="w-4 h-4" />
                      Live Classes
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('/login')}
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-violet-200 transition"
                >
                  Start Free Trial
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className="text-left py-2 text-sm font-medium text-slate-700 hover:text-violet-600"
              >
                {link.label}
              </button>
            ))}

            {user ? (
              <>
                <div className="border-t border-slate-100 pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Account ({user.name})
                  </p>
                  <button
                    onClick={() => handleNav('/dashboard')}
                    className="w-full text-left py-2 text-sm font-medium text-violet-700"
                  >
                    Student Dashboard
                  </button>
                  {(user.role === 'admin' || user.role === 'instructor') && (
                    <button
                      onClick={() => handleNav('/admin')}
                      className="w-full text-left py-2 text-sm font-medium text-amber-700"
                    >
                      Admin Console
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left py-2 text-sm font-medium text-rose-600"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('/signup')}
                  className="w-full text-center py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg"
                >
                  Start Free Trial
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
