import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { api } from '../services/api';
import { Quiz, QuizSubmission } from '../types';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ArrowRight,
  Award,
  Sparkles,
} from 'lucide-react';

export function QuizPlayerPage() {
  const { path, navigate } = useRouter();

  // Route: /learn/:courseSlug/quiz/:quizId
  const parts = path.split('/learn/')[1]?.split('/') || [];
  const courseSlug = parts[0];
  const quizId = parts[2];

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);

  useEffect(() => {
    if (!courseSlug || !quizId) return;
    setLoading(true);
    api.getQuiz(courseSlug, quizId)
      .then(res => {
        setQuiz(res.quiz);
        setTimeLeftSeconds(res.quiz.timeLimitMinutes * 60);
      })
      .catch(err => {
        setError(err.message || 'Unable to load assessment.');
      })
      .finally(() => setLoading(false));
  }, [courseSlug, quizId]);

  // Countdown timer
  useEffect(() => {
    if (submissionResult || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [submissionResult, timeLeftSeconds]);

  const handleOptionSelect = (questionId: string, option: string) => {
    if (submissionResult) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    if (submissionResult) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    if (!quiz || submitting || submissionResult) return;
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(courseSlug, quiz.id, userAnswers);
      setSubmissionResult(res.submission);

      if (res.submission.passed) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSubmissionResult(null);
    setUserAnswers({});
    if (quiz) {
      setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading module assessment...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Assessment Unavailable</h2>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/courses/${courseSlug}`)}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
          >
            Return to Course
          </button>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k].trim() !== '').length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(`/courses/${courseSlug}`)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" />
            Exit Assessment
          </button>

          {!submissionResult && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-700 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {/* Assessment Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 mb-8">
          <div className="border-b border-slate-100 pb-5 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
              Module Proficiency Exam
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{quiz.title}</h1>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{quiz.instructions}</p>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-50">
              <span>{quiz.questions.length} Questions</span>
              <span>·</span>
              <span>Passing Threshold: {quiz.passingScorePercent}%</span>
              <span>·</span>
              <span>Answered: {answeredCount} of {quiz.questions.length}</span>
            </div>
          </div>

          {/* Submission Result Banner */}
          {submissionResult && (
            <div
              className={`p-6 rounded-xl border mb-8 ${
                submissionResult.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {submissionResult.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600" />
                    )}
                    <h3 className="text-lg font-bold">
                      {submissionResult.passed ? 'Assessment Passed!' : 'Did Not Meet Passing Threshold'}
                    </h3>
                  </div>
                  <p className="text-xs mt-1.5 opacity-90">
                    You scored <strong className="text-sm">{submissionResult.score} / {submissionResult.totalPoints}</strong> points ({submissionResult.scorePercent}%). Passing score requirement: {quiz.passingScorePercent}%.
                  </p>
                </div>

                <div className="flex gap-2">
                  {!submissionResult.passed && (
                    <button
                      onClick={handleRetake}
                      className="px-3 py-1.5 bg-white border border-rose-300 text-rose-700 text-xs font-semibold rounded-lg hover:bg-rose-100 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retake
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/courses/${courseSlug}`)}
                    className="px-4 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition"
                  >
                    Continue Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-8">
            {quiz.questions.map((q, idx) => {
              const currentAns = userAnswers[q.id] || '';
              const feedback = submissionResult?.feedback[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border transition ${
                    feedback
                      ? feedback.correct
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-rose-50/40 border-rose-200'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs font-bold text-violet-600">Question {idx + 1}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{q.points} Points</span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-snug">{q.prompt}</p>

                  {/* Context snippet if any */}
                  {q.contextSnippet && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 font-mono">
                      {q.contextSnippet}
                    </p>
                  )}

                  {/* Multiple Choice Options */}
                  {q.type === 'multiple-choice' && q.options && (
                    <div className="mt-4 space-y-2">
                      {q.options.map(option => {
                        const isSelected = currentAns === option;
                        let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';

                        if (feedback) {
                          if (option.toLowerCase() === feedback.correctAnswer.toLowerCase()) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                          } else if (isSelected && !feedback.correct) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                          } else {
                            optionStyle = 'border-slate-200 opacity-60';
                          }
                        } else if (isSelected) {
                          optionStyle = 'border-violet-600 bg-violet-50 text-violet-900 font-semibold shadow-sm';
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={!!submissionResult}
                            onClick={() => handleOptionSelect(q.id, option)}
                            className={`w-full text-left px-4 py-3 rounded-lg border text-xs flex items-center justify-between transition ${optionStyle}`}
                          >
                            <span>{option}</span>
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-violet-600 bg-violet-600' : 'border-slate-300'}`}>
                              {isSelected && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer Input */}
                  {q.type === 'short-answer' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        disabled={!!submissionResult}
                        value={currentAns}
                        onChange={e => handleTextAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-80"
                      />
                    </div>
                  )}

                  {/* Feedback Explanation */}
                  {feedback && (
                    <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        {feedback.correct ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                        <span className="text-slate-500 font-normal">
                          · Correct Answer: <strong className="text-slate-800">{feedback.correctAnswer}</strong>
                        </span>
                      </div>
                      <p className="text-slate-600 italic leading-relaxed">{feedback.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!submissionResult && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Ensure all questions are answered before submitting.
              </span>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-xs shadow-sm transition flex items-center gap-2"
              >
                {submitting ? 'Grading Assessment...' : 'Submit Assessment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
