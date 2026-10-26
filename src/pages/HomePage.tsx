import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Course } from '../types';
import {
  Globe2,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  Headphones,
  Video,
  FileCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export function HomePage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  useEffect(() => {
    api.getCourses()
      .then(res => {
        setCourses(res.courses.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const popularLanguages = [
    { name: 'Spanish', flag: '🇪🇸', learners: '24,500+', desc: 'Madrid & Latin American dialects' },
    { name: 'Japanese', flag: '🇯🇵', learners: '18,200+', desc: 'Hiragana, Kanji & JLPT N5-N2' },
    { name: 'French', flag: '🇫🇷', learners: '15,100+', desc: 'Parisian accent & DELF fluency' },
    { name: 'German', flag: '🇩🇪', learners: '11,400+', desc: 'Corporate German & Goethe prep' },
    { name: 'Mandarin Chinese', flag: '🇨🇳', learners: '14,800+', desc: 'Tones, Pinyin & HSK 1-4' },
    { name: 'Korean', flag: '🇰🇷', learners: '19,300+', desc: 'Hangul alphabet & K-culture' },
  ];

  const faqs = [
    {
      q: 'How does LingoPro differ from casual vocabulary apps?',
      a: 'LingoPro combines university-grade CEFR curricula (A1 to C1), native conversational audio drills, weekly live video breakout sessions on Zoom/Google Meet, and rigorous module assessments. You actually speak in complete sentences rather than matching isolated words.'
    },
    {
      q: 'Are the certificates accredited and verifiable?',
      a: 'Yes. Every certificate carries a unique verification identifier, issue timestamp, and cryptographic integrity seal. Employers, universities, and institutions can verify your credentials anytime via our public /verify registry.'
    },
    {
      q: 'How do the live classes work?',
      a: 'Enrolled students and Pro subscribers can join scheduled live masterclasses led by native instructors. We focus on natural pronunciation, spontaneous conversational drills, and Q&A in intimate cohorts.'
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Absolutely. You can cancel your monthly or annual membership with one click from your billing settings. You retain full access until the end of your billing cycle.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            Accredited CEFR Language Academy
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Master Any Language. <br />
            <span className="bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              Speak With Real Confidence.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The full-stack language academy combining native dialogues, interactive quizzes, live Zoom masterclasses, and verified CEFR digital certificates.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-violet-700/30 transition flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Explore All Courses
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/signup')}
              className="w-full sm:w-auto bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold px-8 py-3.5 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Start Free Learning'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Social proof metrics */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">8 Languages</p>
              <p className="text-xs text-slate-400 mt-1">Spanish to Japanese & Korean</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">4.92 / 5.0</p>
              <p className="text-xs text-slate-400 mt-1">Verified student rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Live Classes</p>
              <p className="text-xs text-slate-400 mt-1">Weekly Zoom speaking labs</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">100% Verifiable</p>
              <p className="text-xs text-slate-400 mt-1">CEFR accredited certificates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Languages Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-xs font-bold text-violet-600 uppercase tracking-widest">Global Curriculum</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Choose Your Language Path</p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="mt-3 sm:mt-0 text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            View all courses & levels <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularLanguages.map(lang => (
            <div
              key={lang.name}
              onClick={() => navigate(`/courses?language=${encodeURIComponent(lang.name)}`)}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-violet-300 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{lang.flag}</span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {lang.learners} learners
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition">
                {lang.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{lang.desc}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-violet-600">
                <span>Start from Beginner</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold text-violet-600 uppercase tracking-widest">Curated Programs</h2>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Featured Academy Courses</p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="mt-3 sm:mt-0 text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              See all courses ({courses.length}) <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.slug}`)}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-violet-300 transition cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {course.language} · {course.level}
                    </div>
                    {course.isFree && (
                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                        Free Course
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 hover:text-violet-700 transition line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {course.subtitle || course.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-slate-900">{course.rating}</span>
                        <span className="text-slate-400">({course.totalReviews})</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">
                        {course.isFree ? 'Free' : `$${course.price}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How LingoPro Works (4-Pillars) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-violet-600 uppercase tracking-widest">Our Methodology</h2>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">The Complete Fluency Architecture</p>
          <p className="text-sm text-slate-500 mt-3">
            Designed by linguists to take you from hesitant beginner to spontaneous conversational speaker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-5 font-extrabold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Native Immersion Video</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Watch authentic dialogues filmed on location with dual subtitles, phonetic transcriptions, and cultural notes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 font-extrabold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Audio Pronunciation Labs</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Practice tricky vowel shapes, Japanese pitch accents, French liaisons, and Mandarin tones with interactive audio playback.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 font-extrabold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Weekly Live Zoom Speaking</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Join intimate instructor-led conversation breakouts to practice real dialogue with immediate gentle coaching.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 font-extrabold text-lg">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified CEFR Credentials</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Pass rigorous assessments and receive tamper-proof digital certificates shareable on LinkedIn and CVs.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold text-violet-400 uppercase tracking-widest">Flexible Investment</h2>
          <p className="text-3xl font-extrabold text-white mt-2">Start Free or Unlock All 8 Languages</p>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mt-3">
            Choose individual course access or unlock the entire academy with unlimited live speaking classes.
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Starter Free</h3>
                <p className="text-xs text-slate-400 mt-1">Foundational introductory lessons</p>
                <p className="text-3xl font-extrabold text-white mt-4">$0</p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Introductory A1 previews</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Interactive vocabulary cards</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Self-paced learning</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="mt-8 w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
              >
                Sign Up Free
              </button>
            </div>

            <div className="bg-gradient-to-b from-violet-900/90 to-indigo-950 border-2 border-violet-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Pro Monthly</h3>
                <p className="text-xs text-violet-200 mt-1">Unlimited access + Live Classes</p>
                <p className="text-3xl font-extrabold text-white mt-4">$29 <span className="text-xs font-normal text-violet-300">/ month</span></p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-300" /> All 8 language curriculums (A1-C1)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-300" /> Unlimited weekly Live Zoom Classes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-300" /> Verified CEFR Certificates</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-300" /> Audio pronunciation exercises</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-8 w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                Get Pro Monthly
              </button>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="inline-block bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-1">
                  Save 30%
                </div>
                <h3 className="font-bold text-lg text-white">Pro Annual</h3>
                <p className="text-xs text-slate-400 mt-1">Full year of continuous fluency</p>
                <p className="text-3xl font-extrabold text-white mt-4">$249 <span className="text-xs font-normal text-slate-400">/ year</span></p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Pro included</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority seat booking for live labs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Downloadable course offline packs</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct instructor Q&A channel</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-8 w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition"
              >
                Get Annual Pass
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-violet-600 uppercase tracking-widest">Questions & Answers</h2>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
