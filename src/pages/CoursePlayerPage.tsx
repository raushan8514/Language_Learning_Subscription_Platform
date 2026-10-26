import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Lesson, Section, Course } from '../types';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Play,
  Volume2,
  Download,
  BookOpen,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react';

export function CoursePlayerPage() {
  const { path, navigate } = useRouter();
  const { user } = useAuth();

  // Route format: /learn/:courseSlug/:lessonId
  const parts = path.split('/learn/')[1]?.split('/') || [];
  const courseSlug = parts[0];
  const lessonId = parts[1];

  const [lessonData, setLessonData] = useState<{
    course: any;
    sections: any[];
    currentLesson: Lesson;
    prevLesson: { id: string; title: string } | null;
    nextLesson: { id: string; title: string } | null;
    isCompleted: boolean;
    enrollment?: any;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'dialogue' | 'vocabulary' | 'resources'>('content');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const fetchLesson = () => {
    if (!courseSlug || !lessonId) return;
    setLoading(true);
    api.getLesson(courseSlug, lessonId)
      .then(res => {
        setLessonData(res);
        setError('');
      })
      .catch(err => {
        setError(err.message || 'Unable to access lesson. Please enroll first.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLesson();
  }, [courseSlug, lessonId]);

  // Audio pronunciation synthesis based on course language
  const speakForeignText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const lang = lessonData?.course?.language || 'Spanish';

    if (lang === 'Spanish') utterance.lang = 'es-ES';
    else if (lang === 'Japanese') utterance.lang = 'ja-JP';
    else if (lang === 'French') utterance.lang = 'fr-FR';
    else if (lang === 'German') utterance.lang = 'de-DE';
    else if (lang === 'Mandarin Chinese') utterance.lang = 'zh-CN';
    else if (lang === 'Korean') utterance.lang = 'ko-KR';
    else if (lang === 'Italian') utterance.lang = 'it-IT';
    else utterance.lang = 'en-US';

    utterance.rate = 0.9; // Slightly slower for language learners
    setSpeakingText(text);
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleMarkComplete = async () => {
    if (!courseSlug || !lessonId || markingComplete) return;
    setMarkingComplete(true);
    try {
      const res = await api.markLessonComplete(courseSlug, lessonId);

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
      });

      // Refresh current state
      setLessonData(prev => prev ? {
        ...prev,
        isCompleted: true,
        enrollment: res.enrollment,
      } : null);

      // If there's a quiz, prompt user
      if (lessonData?.currentLesson.quizId) {
        // Can take quiz or advance
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record completion');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading interactive lesson player...</p>
        </div>
      </div>
    );
  }

  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Lesson Access Restricted</h2>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/courses/${courseSlug}`)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
            >
              View Course Details
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs"
            >
              Course Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { course, sections, currentLesson, prevLesson, nextLesson, isCompleted, enrollment } = lessonData;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Player Navigation Bar */}
      <header className="h-14 bg-slate-950 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/courses/${course.slug}`)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit to Course</span>
          </button>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate max-w-xs sm:max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {enrollment && (
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span>Progress: {enrollment.progressPercent}%</span>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${enrollment.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300"
            aria-label="Toggle curriculum"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Learning Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Collapsible Curriculum Drawer */}
        <aside
          className={`fixed lg:static top-14 bottom-0 left-0 w-80 bg-slate-950 border-r border-slate-800 flex flex-col z-20 transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Curriculum</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">{course.language} · {course.level}</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
            {sections.map((section: any) => (
              <div key={section.id} className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wide">
                  {section.title}
                </p>
                <div className="space-y-1 mt-1">
                  {section.lessons.map((les: any) => {
                    const isCurrent = les.id === currentLesson.id;
                    return (
                      <button
                        key={les.id}
                        onClick={() => {
                          navigate(`/learn/${course.slug}/${les.id}`);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                          isCurrent
                            ? 'bg-violet-600/30 text-violet-300 font-semibold border border-violet-500/40'
                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {les.isCompleted ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{les.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 ml-2">{les.durationMinutes}m</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center/Right Lesson Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-900 flex flex-col">
          {/* Video Player Box */}
          <div className="bg-black aspect-video max-h-[500px] w-full flex items-center justify-center relative">
            {currentLesson.videoUrl ? (
              <video
                key={currentLesson.id}
                controls
                className="w-full h-full object-contain"
                poster="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80"
              >
                <source src={currentLesson.videoUrl} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="text-center p-8 text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-violet-400" />
                <p className="text-xs">Interactive Reading & Pronunciation Lab</p>
              </div>
            )}
          </div>

          {/* Action Bar Beneath Video */}
          <div className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{currentLesson.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {course.language} · Module Lesson · Duration: {currentLesson.durationMinutes} min
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete || isCompleted}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                  isCompleted
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                {isCompleted ? 'Lesson Completed' : markingComplete ? 'Saving...' : 'Mark as Complete'}
              </button>

              {currentLesson.quizId && (
                <button
                  onClick={() => navigate(`/learn/${course.slug}/quiz/${currentLesson.quizId}`)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition"
                >
                  <HelpCircle className="w-4 h-4" />
                  Take Assessment
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation for Lesson Learning Materials */}
          <div className="border-b border-slate-800 bg-slate-950/60 px-6 flex items-center gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-3 transition border-b-2 ${
                activeTab === 'content'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Lesson Notes
            </button>
            {currentLesson.dialogue && currentLesson.dialogue.length > 0 && (
              <button
                onClick={() => setActiveTab('dialogue')}
                className={`py-3 transition border-b-2 ${
                  activeTab === 'dialogue'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Interactive Dialogue ({currentLesson.dialogue.length})
              </button>
            )}
            {currentLesson.vocabulary && currentLesson.vocabulary.length > 0 && (
              <button
                onClick={() => setActiveTab('vocabulary')}
                className={`py-3 transition border-b-2 ${
                  activeTab === 'vocabulary'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Vocabulary Decks ({currentLesson.vocabulary.length})
              </button>
            )}
            {currentLesson.downloadableResources && currentLesson.downloadableResources.length > 0 && (
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-3 transition border-b-2 ${
                  activeTab === 'resources'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Downloadable Worksheets
              </button>
            )}
          </div>

          {/* Tab Panels */}
          <div className="p-6 max-w-4xl space-y-6 flex-1">
            {activeTab === 'content' && (
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                <div className="bg-slate-800/70 p-5 rounded-xl border border-slate-700/80">
                  <h3 className="font-bold text-white text-base mb-2">Lesson Overview & Grammar Guidance</h3>
                  <div className="whitespace-pre-line font-normal text-xs sm:text-sm text-slate-300">
                    {currentLesson.content}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dialogue' && currentLesson.dialogue && (
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Listen and repeat line-by-line. Click the audio button to hear native pronunciation.
                </p>
                <div className="space-y-3">
                  {currentLesson.dialogue.map((line, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                          {line.speaker}
                        </span>
                        <p className="text-base font-semibold text-white">
                          {line.foreignText}
                        </p>
                        {line.pinyinOrRomaji && (
                          <p className="text-xs text-amber-300/90 font-mono">
                            {line.pinyinOrRomaji}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 italic">
                          "{line.translation}"
                        </p>
                      </div>

                      <button
                        onClick={() => speakForeignText(line.audioText || line.foreignText)}
                        className={`p-2.5 rounded-lg border transition ${
                          speakingText === (line.audioText || line.foreignText)
                            ? 'bg-violet-600 text-white border-violet-500 scale-105'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                        }`}
                        title="Listen to native speech"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vocabulary' && currentLesson.vocabulary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentLesson.vocabulary.map((vocab, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {vocab.partOfSpeech}
                        </span>
                        <button
                          onClick={() => speakForeignText(vocab.term)}
                          className="p-1.5 rounded hover:bg-slate-700 text-violet-400 hover:text-violet-300"
                          title="Listen to term"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h4 className="text-lg font-bold text-white">{vocab.term}</h4>
                      {vocab.phonetic && (
                        <p className="text-xs text-slate-400 font-mono">{vocab.phonetic}</p>
                      )}
                      <p className="text-sm font-medium text-emerald-400 mt-2">{vocab.translation}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 italic">
                      Example: "{vocab.example}"
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && currentLesson.downloadableResources && (
              <div className="space-y-3">
                {currentLesson.downloadableResources.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">{res.title}</p>
                        <p className="text-xs text-slate-400">{res.filename} · {res.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading verified resource: ${res.filename}`)}
                      className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Lesson Navigation Bar */}
          <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 flex items-center justify-between mt-auto">
            {prevLesson ? (
              <button
                onClick={() => navigate(`/learn/${course.slug}/${prevLesson.id}`)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous: {prevLesson.title}
              </button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <button
                onClick={() => navigate(`/learn/${course.slug}/${nextLesson.id}`)}
                className="flex items-center gap-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
              >
                Next: {nextLesson.title}
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate(`/courses/${course.slug}`)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
              >
                <Award className="w-4 h-4" />
                View Course Completion
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
