import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { api } from '../services/api';
import { Certificate } from '../types';
import {
  Award,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Printer,
  Copy,
  ExternalLink,
  Globe2,
} from 'lucide-react';

export function CertificateVerifyPage() {
  const { path, navigate } = useRouter();

  // Extract ID from /verify/:id or query
  const pathId = path.split('/verify/')[1]?.split('?')[0];
  const [searchId, setSearchId] = useState(pathId || '');
  const [searchedCert, setSearchedCert] = useState<Certificate | null>(null);
  const [certStatus, setCertStatus] = useState<'valid' | 'revoked' | 'not_found' | null>(null);
  const [revocationReason, setRevocationReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const performLookup = (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setSearchedCert(null);
    setCertStatus(null);

    api.verifyCertificate(id.trim())
      .then(res => {
        setSearchedCert(res.certificate);
        setCertStatus(res.status);
        setRevocationReason(res.revocationReason);
      })
      .catch(() => {
        setCertStatus('not_found');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (pathId) {
      setSearchId(pathId);
      performLookup(pathId);
    }
  }, [pathId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${searchId.trim()}`);
      performLookup(searchId.trim());
    }
  };

  const copyShareLink = () => {
    if (!searchedCert) return;
    const url = window.location.origin + `/verify/${searchedCert.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Verification Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
            <Award className="w-3.5 h-3.5" />
            Official Credential Registry
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Verify a LingoPro Certificate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Enter a student's certificate identifier to verify their CEFR-accredited qualification, issue timestamp, and official accreditation status.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder="e.g. LP-2026-ES01-9842"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>

          {/* Quick test sample buttons */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <span>Try sample credentials:</span>
            <button
              onClick={() => {
                setSearchId('LP-2026-ES01-9842');
                navigate('/verify/LP-2026-ES01-9842');
              }}
              className="text-violet-600 hover:underline font-mono"
            >
              LP-2026-ES01-9842
            </button>
            <span>·</span>
            <button
              onClick={() => {
                setSearchId('LP-2026-JA01-4419');
                navigate('/verify/LP-2026-JA01-4419');
              }}
              className="text-violet-600 hover:underline font-mono"
            >
              LP-2026-JA01-4419
            </button>
          </div>
        </div>

        {/* Not Found State */}
        {certStatus === 'not_found' && (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Certificate Not Found</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              No record matches identifier <strong className="font-mono text-slate-800">{searchId}</strong> in our database. Please double check the ID.
            </p>
          </div>
        )}

        {/* Certificate Display Card */}
        {searchedCert && (
          <div className="space-y-6">
            {/* Status Alert Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                searchedCert.status === 'valid'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {searchedCert.status === 'valid' ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                )}
                <span>
                  {searchedCert.status === 'valid'
                    ? 'Verified Official Credential — Currently Active'
                    : `Certificate Revoked: ${revocationReason || 'Administrative audit'}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save
                </button>
              </div>
            </div>

            {/* High-Fidelity Printable Certificate Canvas */}
            <div
              id="printable-certificate"
              className="bg-white rounded-3xl border-8 border-slate-900/5 p-8 sm:p-14 shadow-2xl relative overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(#f1f5f9 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Outer decorative certificate border */}
              <div className="border-2 border-amber-600/30 rounded-2xl p-6 sm:p-10 relative">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-slate-900">
                      Lingo<span className="text-violet-600">Pro</span> Academy
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                    Certificate of Competence & Achievement
                  </p>
                </div>

                {/* Recipient */}
                <div className="text-center my-8 space-y-2">
                  <p className="text-xs text-slate-500">This is to certify that</p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif italic">
                    {searchedCert.userName}
                  </h2>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed pt-2">
                    has successfully fulfilled all curriculum requirements, oral pronunciation assessments, and module examinations for:
                  </p>
                </div>

                {/* Course Name */}
                <div className="text-center my-6 bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-xl mx-auto">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {searchedCert.courseTitle}
                  </h3>
                  <p className="text-xs font-semibold text-violet-700 mt-1">
                    Language: {searchedCert.language} · CEFR Level: {searchedCert.level}
                  </p>
                </div>

                {/* Footer Signatures & Integrity */}
                <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-xs">
                  <div>
                    <p className="font-serif italic text-base text-slate-800">{searchedCert.instructorName}</p>
                    <div className="w-32 h-0.5 bg-slate-400 my-1" />
                    <p className="text-slate-500 text-[11px]">Academic Course Director</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center text-amber-700 shadow-inner">
                      <Award className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-mono text-amber-800 font-bold mt-1 uppercase">Official Seal</p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-slate-500">Issue Date: <strong className="text-slate-800">{searchedCert.issueDate}</strong></p>
                    <p className="font-mono text-[11px] text-violet-600 font-bold">ID: {searchedCert.id}</p>
                    <p className="font-mono text-[9px] text-slate-400 truncate max-w-xs ml-auto">
                      Hash: {searchedCert.credentialHash}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
