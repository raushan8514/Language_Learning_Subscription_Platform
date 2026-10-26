import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Globe2, ShieldCheck, Award, Users, BookOpen, CheckCircle2 } from 'lucide-react';

export function AboutPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 py-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            Our Mission & Pedagogical Philosophy
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            About LingoPro Academy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We bridge the gap between static vocabulary flashcard apps and rigorous real-world fluency.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. The Common European Framework of Reference (CEFR)</h2>
            <p>
              Every course on LingoPro adheres strictly to international CEFR benchmarks from A1 Beginner up to C1 Advanced Fluency. Unlike gimmicky gamified apps that test word matching in isolation, our students engage with authentic contextual dialogues, audio phonetics drills, and spontaneous speaking breakout classes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Native-Led Live Masterclasses</h2>
            <p>
              Language is fundamentally social. That's why every enrolled learner and Pro subscriber has weekly access to live video sessions conducted over authorized Zoom and Google Meet rooms. Guided by certified native instructors from Madrid, Tokyo, Paris, Munich, and Beijing, you practice real communicative exchanges in supportive cohorts.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Cryptographically Verifiable Credentials</h2>
            <p>
              Upon completing 100% of curriculum modules and meeting the passing thresholds on course assessments, students are awarded official certificates of achievement. Each credential carries a distinct verification identifier accessible publicly at /verify, offering instant credential verification for university admissions and employer background checks.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Ready to start speaking?</p>
              <p className="text-xs text-slate-500">Explore introductory preview lessons with zero commitment.</p>
            </div>
            <button
              onClick={() => navigate('/courses')}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-sm transition"
            >
              Browse Course Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
