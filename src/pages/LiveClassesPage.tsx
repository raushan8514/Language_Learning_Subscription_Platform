import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LiveClass } from '../types';
import {
  Calendar,
  Clock,
  Video,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export function LiveClassesPage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);
  const [activeModalData, setActiveModalData] = useState<any>(null);

  useEffect(() => {
    api.getLiveClasses()
      .then(res => setClasses(res.classes))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleJoinClass = async (classId: string) => {
    if (!user) {
      navigate('/login?redirect=/classes');
      return;
    }

    setJoiningClassId(classId);
    try {
      const res = await api.joinLiveClass(classId);
      setActiveModalData(res);
    } catch (err: any) {
      alert(err.message || 'You must be enrolled in the course or have a Pro membership to join this live class.');
    } finally {
      setJoiningClassId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
            <Video className="w-3.5 h-3.5" />
            Interactive Video Labs
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Live Breakout Speaking Classes
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Practice spontaneous conversation in small cohorts on Zoom & Google Meet, coached by certified native instructors.
          </p>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">No upcoming live classes scheduled</h3>
            <p className="text-xs text-slate-500 mt-1">Our instructors schedule new cohorts each week. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {classes.map(cls => {
              const startDate = new Date(cls.startTime);
              const isPast = startDate.getTime() < Date.now();

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">
                        {cls.courseTitle}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {cls.meetingProvider} Live
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 leading-snug">{cls.title}</h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{cls.description}</p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <span>
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.timezone}) · Duration: 60 min
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <span>Cohort Limit: {cls.capacity} students max</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400">Instructor</p>
                      <p className="text-xs font-bold text-slate-800">{cls.instructorName}</p>
                    </div>

                    <button
                      onClick={() => handleJoinClass(cls.id)}
                      disabled={joiningClassId === cls.id || isPast}
                      className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      {joiningClassId === cls.id ? 'Verifying access...' : isPast ? 'Session Ended' : 'Join Live Session'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Real Live Meeting Access Modal */}
        {activeModalData && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Access Granted</h3>
                    <p className="text-xs text-slate-500">Authorized student credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalData(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Class Topic</label>
                  <p className="text-sm font-semibold text-slate-900">{activeModalData.title}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Platform:</span>
                    <strong className="text-slate-900">{activeModalData.meetingProvider}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Meeting ID:</span>
                    <strong className="font-mono text-slate-900">{activeModalData.meetingId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passcode:</span>
                    <strong className="font-mono text-slate-900">{activeModalData.passcode}</strong>
                  </div>
                </div>

                <p className="text-slate-500 leading-relaxed">
                  Click the button below to launch into the live meeting room. Please ensure your microphone and webcam are connected.
                </p>

                <div className="pt-2 flex gap-3">
                  <a
                    href={activeModalData.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl text-center shadow-md flex items-center justify-center gap-2"
                  >
                    Open {activeModalData.meetingProvider} Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setActiveModalData(null)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
