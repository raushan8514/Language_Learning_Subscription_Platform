import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Course, Section } from '../types';
import {
  Globe2,
  BookOpen,
  Calendar,
  Award,
  CheckCircle2,
  Star,
  Clock,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function CourseDetailPage() {
  const { path, navigate } = useRouter();
  const { user } = useAuth();

  // Extract slug from path `/courses/:slug`
  const slug = path.split('/courses/')[1]?.split('?')[0];

  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getCourseDetail(slug)
      .then(res => {
        setCourse(res.course);
        setSections(res.sections);
        setIsEnrolled(res.isEnrolled);
        setUserProgress(res.userProgress);
        if (res.sections.length > 0) {
          setOpenSectionId(res.sections[0].id);
        }
      })
      .catch(err => {
        setError(err.message || 'Course not found');
      })
      .finally(() => setLoading(false));
  }, [slug, user]);

  const toggleSection = (id: string) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };

  const handleEnrollOrStart = async () => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(path));
      return;
    }

    if (isEnrolled) {
      // Find first lesson or resume
      const targetLessonId = userProgress?.lastVisitedLessonId || sections[0]?.lessons[0]?.id;
      if (targetLessonId) {
        navigate(`/learn/${course?.slug}/${targetLessonId}`);
      }
      return;
    }

    // Attempt enrollment
    setEnrolling(true);
    try {
      if (course?.isFree || user.planStatus === 'active') {
        await api.enrollCourse(course!.slug);
        setIsEnrolled(true);
        const firstLessonId = sections[0]?.lessons[0]?.id;
        if (firstLessonId) {
          navigate(`/learn/${course!.slug}/${firstLessonId}`);
        }
      } else {
        // Redirect to pricing or checkout for premium purchase
        navigate(`/pricing?courseId=${course!.id}&price=${course!.price}`);
      }
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-40 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-96 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Course Not Available</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This course could not be located.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-lg text-xs"
          >
            Back to Course Catalog
          </button>
        </div>
      </div>
    );
  }

  const firstLessonId = sections[0]?.lessons[0]?.id;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Course Header Banner */}
      <div className="bg-slate-900 text-white py-12 lg:py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              {/* Unboxed breadcrumb metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <button onClick={() => navigate('/courses')} className="hover:text-white transition">Courses</button>
                <span aria-hidden="true">/</span>
                <span>{course.language}</span>
                <span aria-hidden="true">/</span>
                <span className="text-violet-400">{course.level}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
                {course.subtitle || course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{course.rating}</span>
                  <span className="text-slate-400">({course.totalReviews} verified ratings)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.durationHours} hours total</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{course.totalLessons} lessons in {course.totalSections} modules</span>
                </div>
              </div>

              {/* Instructor snippet */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <img
                  src={course.instructorAvatar}
                  alt={course.instructorName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30"
                />
                <div>
                  <p className="text-xs text-slate-400">Taught by</p>
                  <p className="text-sm font-semibold text-white">{course.instructorName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Overview, Outcomes, Curriculum */}
          <div className="lg:col-span-2 space-y-10">
            {/* What you'll learn */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">What You Will Master</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-snug">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Accordion */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Curriculum Breakdown</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {course.totalSections} sections · {course.totalLessons} lessons · Self-paced with native audio
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {sections.map(section => {
                  const isOpen = openSectionId === section.id;
                  return (
                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full bg-slate-50 hover:bg-slate-100/80 px-5 py-4 text-left flex items-center justify-between transition"
                      >
                        <span className="text-sm font-bold text-slate-900">{section.title}</span>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{section.lessons.length} lessons</span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {section.lessons.map(lesson => (
                            <div
                              key={lesson.id}
                              className="px-5 py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60 transition"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.isPreview || isEnrolled ? (
                                  <Play className="w-3.5 h-3.5 text-violet-600" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className={`font-medium ${lesson.isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="text-slate-400">{lesson.durationMinutes} min</span>
                                {lesson.isPreview && (
                                  <button
                                    onClick={() => navigate(`/learn/${course.slug}/${lesson.id}`)}
                                    className="text-violet-600 hover:text-violet-700 font-semibold text-[11px] underline"
                                  >
                                    Free Preview
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Prerequisites & Requirements</h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 list-disc list-inside">
                {course.prerequisites.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Instructor Bio */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start gap-6">
              <img
                src={course.instructorAvatar}
                alt={course.instructorName}
                className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 flex-shrink-0"
              />
              <div className="space-y-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{course.instructorName}</h3>
                  <p className="text-xs text-violet-600 font-medium">{course.instructorTitle}</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Certified native linguist with extensive background designing immersive speaking curricula, preparing candidates for formal CEFR, DELE, JLPT, and Goethe certifications.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Action Card */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg p-6 space-y-6">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    const previewLesson = sections.flatMap(s => s.lessons).find(l => l.isPreview);
                    if (previewLesson) {
                      navigate(`/learn/${course.slug}/${previewLesson.id}`);
                    }
                  }}
                  className="absolute inset-0 bg-slate-950/40 hover:bg-slate-950/30 transition flex items-center justify-center text-white"
                >
                  <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 ml-0.5" />
                  </div>
                </button>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {course.isFree ? 'Free' : `$${course.price}`}
                  </span>
                  <span className="text-xs text-slate-500">
                    {course.isFree ? 'Full access included' : 'Lifetime Course Access'}
                  </span>
                </div>
                {user?.planStatus === 'active' && (
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    ✓ Included in your Pro Membership
                  </p>
                )}
              </div>

              <button
                onClick={handleEnrollOrStart}
                disabled={enrolling}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-violet-200 transition flex items-center justify-center gap-2 text-sm"
              >
                {enrolling ? 'Enrolling...' : isEnrolled ? 'Continue Learning' : course.isFree ? 'Enroll For Free' : `Enroll for $${course.price}`}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">This Program Includes:</h4>
                <div className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-violet-600" />
                  <span>{course.durationHours} hours of on-demand HD video</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-violet-600" />
                  <span>Interactive dialogues with native audio pronunciation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-violet-600" />
                  <span>Weekly live breakout speaking practice on Zoom</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-violet-600" />
                  <span>Official verifiable certificate of completion</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
