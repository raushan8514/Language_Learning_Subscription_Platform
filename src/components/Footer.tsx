import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Globe2, ShieldCheck, Award, Heart } from 'lucide-react';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
                <Globe2 className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Lingo<span className="text-violet-400">Pro</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The premier online language learning academy. Master global languages through immersion, native dialogues, weekly live breakout classes, and CEFR-accredited verifiable certificates.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                CEFR Standard Aligned
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-violet-400" />
                Verifiable Credentials
              </span>
            </div>
          </div>

          {/* Languages */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Languages</h4>
            <ul className="space-y-2.5 text-sm">
              {['Spanish', 'Japanese', 'French', 'German', 'Mandarin Chinese', 'Korean', 'Italian'].map(lang => (
                <li key={lang}>
                  <button
                    onClick={() => navigate(`/courses?language=${encodeURIComponent(lang)}`)}
                    className="hover:text-white transition"
                  >
                    Learn {lang}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-white transition">
                  Course Catalog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/classes')} className="hover:text-white transition">
                  Live Masterclasses
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-white transition">
                  Membership & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/verify')} className="hover:text-white transition">
                  Verify Certificate
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="hover:text-white transition">
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition">
                  About LingoPro
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-white transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/refund')} className="hover:text-white transition">
                  Refund & Cancellation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 LingoPro Academy Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted for language learners worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
