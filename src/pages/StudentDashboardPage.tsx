import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Calendar,
  Flame,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';

export function StudentDashboardPage() {
  const { navigate } = useRouter();
  const { user, updateProfile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'learning' | 'classes' | 'quizzes' | 'certificates' | 'settings'>('learning');

  // Profile update state
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const fetchSummary = () => {
    setLoading(true);
    api.getDashboardSummary()
      .then(res => {
        setData(res);
        setName(res.user.name);
        setBio(res.user.bio || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, bio });
      setProfileMsg('Profile updated successfully');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-40 bg-slate-200 rounded-2xl animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">Please log in to view your dashboard</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const { metrics, enrolledCourses, upcomingClasses, recentQuizzes, certificates } = data;

  return (
    <div className="min-h-screen bg-slate-50 py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500/20 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200/60">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Plan: <strong className="text-slate-800 capitalize">{user?.plan} Membership</strong> ({user?.planStatus})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="bg-amber-50 border border-amber-200/70 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <p className="text-lg font-black text-amber-900 leading-none">{metrics.streak} Days</p>
                <p className="text-[11px] font-semibold text-amber-700 mt-0.5">Active Learning Streak</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/courses')}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              Browse Catalog
            </button>
          </div>
        </div>

        {/* High-Level Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Enrolled Courses</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.enrolledCoursesCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Completed Lessons</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{metrics.completedLessonsCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Certificates Earned</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{metrics.certificatesCount}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-medium text-slate-500">Average Progress</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{metrics.averageProgress}%</p>
          </div>
        </div>

        {/* Dashboard Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'learning', label: `My Learning (${enrolledCourses.length})` },
            { id: 'classes', label: `Live Classes (${upcomingClasses.length})` },
            { id: 'quizzes', label: `Assessments (${recentQuizzes.length})` },
            { id: 'certificates', label: `Certificates (${certificates.length})` },
            { id: 'settings', label: 'Profile & Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 border-b-2 whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Enrolled Courses */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            {enrolledCourses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-base text-slate-800">You haven't enrolled in any courses yet</h3>
                <p className="text-xs text-slate-500 mt-1">Explore our 8 accredited language programs to begin speaking.</p>
                <button
                  onClick={() => navigate('/courses')}
                  className="mt-5 bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Browse Course Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((c: any) => (
                  <div
                    key={c.enrollmentId}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img src={c.thumbnail} alt={c.courseTitle} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded">
                          {c.language} · {c.level}
                        </div>
                        {c.isCompleted && (
                          <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1">{c.courseTitle}</h3>

                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span>Progress</span>
                            <span>{c.progressPercent}% ({c.completedLessonsCount}/{c.totalLessons} lessons)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-600 rounded-full transition-all duration-300"
                              style={{ width: `${c.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {c.nextLessonToResume && (
                          <p className="text-xs text-slate-500 mt-3 truncate">
                            Next: <strong className="text-slate-700">{c.nextLessonToResume.title}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                      {c.certificateId ? (
                        <button
                          onClick={() => navigate(`/verify/${c.certificateId}`)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> View Certificate
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Certificate upon 100%</span>
                      )}

                      <button
                        onClick={() => {
                          const targetId = c.nextLessonToResume?.id || c.lastVisitedLessonId;
                          if (targetId) navigate(`/learn/${c.courseSlug}/${targetId}`);
                        }}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {c.progressPercent > 0 ? 'Resume' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Live Classes */}
        {activeTab === 'classes' && (
          <div className="space-y-4">
            {upcomingClasses.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No scheduled classes right now. Check back soon!</p>
              </div>
            ) : (
              upcomingClasses.map((cls: any) => (
                <div
                  key={cls.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-violet-600">
                        {cls.courseTitle}
                      </span>
                      <span>·</span>
                      <span className="text-xs text-slate-500 font-medium">
                        Instructor: {cls.instructorName}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{cls.title}</h3>
                    <p className="text-xs text-slate-500">{cls.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 font-mono">
                      <span>{new Date(cls.startTime).toLocaleDateString()} at {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{cls.timezone}</span>
                      <span>Platform: {cls.meetingProvider}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      api.joinLiveClass(cls.id)
                        .then(res => {
                          alert(`Opening ${res.meetingProvider} session!\nMeeting ID: ${res.meetingId}\nPasscode: ${res.passcode}`);
                          window.open(res.meetingUrl, '_blank');
                        })
                        .catch(err => alert(err.message));
                    }}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <Calendar className="w-4 h-4" />
                    Enter Live Class
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Assessments & Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {recentQuizzes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                You haven't completed any quizzes yet. They appear at the end of course modules!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {recentQuizzes.map((sub: any) => (
                  <div key={sub.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">Quiz #{sub.quizId}</p>
                      <p className="text-slate-400 mt-0.5">Attempt #{sub.attemptNumber} · Submitted {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-slate-700 font-bold">{sub.score} / {sub.totalPoints} pts ({sub.scorePercent}%)</span>
                      <span className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${sub.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {sub.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Certificates */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            {certificates.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Complete all lessons in a course to earn your verified credential.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert: any) => (
                  <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-mono font-bold text-violet-600">{cert.id}</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{cert.courseTitle}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Issued to {cert.userName} on {cert.issueDate}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/verify/${cert.id}`)}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                      >
                        Official Verification Link <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Profile & Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl">
            <h3 className="font-bold text-base text-slate-900 mb-4">Account Profile</h3>

            {profileMsg && (
              <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio & Learning Objectives</label>
                <textarea
                  value={bio}
                  rows={3}
                  onChange={e => setBio(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Share your goals and target fluency..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
