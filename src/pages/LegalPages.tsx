import React from 'react';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'refund';
}

export function LegalPages({ type }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-14 shadow-sm space-y-8 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {type === 'terms' && (
            <>
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Legal Terms</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Terms of Service</h1>
                <p className="text-xs text-slate-400 mt-1">Effective Date: January 1, 2026</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
                <p>
                  By accessing or registering with LingoPro Academy ("LingoPro", "we", "us"), you agree to abide by these Terms of Service. If you disagree with any portion of these terms, you may not use our services.
                </p>

                <h2 className="text-base font-bold text-slate-900">2. User Accounts & Academic Integrity</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials. You agree that all coursework, assessment answers, and interactive speaking exercises submitted are your own genuine work. Sharing quiz answer keys or unauthorized reproduction of course media is strictly prohibited.
                </p>

                <h2 className="text-base font-bold text-slate-900">3. Live Video Cohort Code of Conduct</h2>
                <p>
                  Our live classes conducted via Zoom and Google Meet are safe, respectful learning spaces. Harassment, disruptive behavior, or unauthorized recording of other students will result in immediate session dismissal and account termination.
                </p>

                <h2 className="text-base font-bold text-slate-900">4. Intellectual Property</h2>
                <p>
                  All curriculum materials, audio recordings, downloadable PDF worksheets, and video lectures are the proprietary property of LingoPro Academy Inc. and its licensed instructors.
                </p>
              </div>
            </>
          )}

          {type === 'privacy' && (
            <>
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Privacy & Security</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Privacy Policy</h1>
                <p className="text-xs text-slate-400 mt-1">Effective Date: January 1, 2026</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
                <p>
                  We collect account identifiers (name, email address), learning progress records (completed lessons, quiz attempts, module timestamps), and billing receipts. We never store raw credit card numbers directly on our servers; all transactions are processed via secure PCI-DSS compliant providers.
                </p>

                <h2 className="text-base font-bold text-slate-900">2. How We Use Learning Data</h2>
                <p>
                  Your learning data is used strictly to power your personalized student dashboard, compute lesson completion percentages, issue verified digital certificates, and calculate active study streaks. We do not sell your personal information to third-party data brokers.
                </p>

                <h2 className="text-base font-bold text-slate-900">3. Public Certificate Verification Registry</h2>
                <p>
                  When you earn an accredited certificate, the certificate ID, your name, course title, and issue date are stored in our public verification database (/verify) so institutions can verify credentials. You may contact privacy@lingopro.com to request pseudonymization of published credentials.
                </p>
              </div>
            </>
          )}

          {type === 'refund' && (
            <>
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Customer Assurance</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Refund & Cancellation Policy</h1>
                <p className="text-xs text-slate-400 mt-1">Effective Date: January 1, 2026</p>
              </div>

              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">1. 30-Day Money-Back Guarantee</h2>
                <p>
                  We want you to be completely satisfied with your language-learning experience. If you purchase an individual course or an annual subscription and determine within 30 days that the program is not a fit for your learning goals, contact refunds@lingopro.com for a full, prompt refund.
                </p>

                <h2 className="text-base font-bold text-slate-900">2. Monthly Subscription Cancellation</h2>
                <p>
                  Monthly subscriptions can be cancelled at any time directly through your Student Dashboard billing settings. Once cancelled, your card will not be charged again, and you will maintain full Pro access through the conclusion of your current paid billing period.
                </p>

                <h2 className="text-base font-bold text-slate-900">3. Non-Refundable Items</h2>
                <p>
                  Issued and claimed digital certificates where the student has received formal CEFR credential verification and official transcript records are non-refundable once the credential hash is issued to third-party verification registries.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
