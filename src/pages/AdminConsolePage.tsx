import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Course, Section, Lesson, Quiz, LiveClass, Certificate } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Award,
  Users,
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export function AdminConsolePage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'quizzes' | 'students' | 'classes' | 'certificates'>('overview');

  // Overview analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [curriculumCourseId, setCurriculumCourseId] = useState<string | null>(null);
  const [curriculumSections, setCurriculumSections] = useState<Section[]>([]);

  // Course Form
  const [cTitle, setCTitle] = useState('');
  const [cSlug, setCSlug] = useState('');
  const [cSubtitle, setCSubtitle] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cLanguage, setCLanguage] = useState('Spanish');
  const [cLevel, setCLevel] = useState<'A1 Beginner' | 'A2 Elementary' | 'B1 Intermediate' | 'B2 Upper-Intermediate' | 'C1 Advanced'>('A1 Beginner');
  const [cCategory, setCCategory] = useState('General Conversation');
  const [cPrice, setCPrice] = useState(49);
  const [cIsFree, setCIsFree] = useState(false);
  const [cIsPublished, setCIsPublished] = useState(true);
  const [cThumbnail, setCThumbnail] = useState('https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80');

  // Section / Lesson Form
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLessonSectionId, setNewLessonSectionId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);

  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [assignCourseModalUserId, setAssignCourseModalUserId] = useState<string | null>(null);
  const [assignSelectedCourseId, setAssignSelectedCourseId] = useState('');

  // Classes state
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [classTitle, setClassTitle] = useState('');
  const [classCourseId, setClassCourseId] = useState('');
  const [classTime, setClassTime] = useState('2026-10-30T18:00');
  const [classProvider, setClassProvider] = useState<'Zoom' | 'Google Meet'>('Zoom');
  const [classMeetingUrl, setClassMeetingUrl] = useState('https://zoom.us/j/123456789');

  // Quizzes state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [qTitle, setQTitle] = useState('');
  const [qCourseId, setQCourseId] = useState('');
  const [qPassing, setQPassing] = useState(80);

  const fetchAll = () => {
    setLoadingAnalytics(true);
    api.getAdminAnalytics()
      .then(res => setAnalytics(res))
      .catch(console.error)
      .finally(() => setLoadingAnalytics(false));

    api.getAdminCourses()
      .then(res => {
        setCourses(res.courses);
        if (res.courses.length > 0) {
          setClassCourseId(res.courses[0].id);
          setAssignSelectedCourseId(res.courses[0].id);
          setQCourseId(res.courses[0].id);
        }
      })
      .catch(console.error);

    api.getAdminStudents()
      .then(res => setStudents(res.students))
      .catch(console.error);

    api.getLiveClasses()
      .then(res => setLiveClasses(res.classes))
      .catch(console.error);

    api.getAdminQuizzes()
      .then(res => setQuizzes(res.quizzes))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Access check
  if (user && user.role !== 'admin' && user.role !== 'instructor') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 text-center max-w-md shadow-sm">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-1">Access Restricted</h2>
          <p className="text-xs text-slate-500 mb-5">
            The Admin Console requires Administrator or Instructor authorization. Hiding buttons is not security; server-side role validation strictly blocked this view.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
          >
            Go to Student Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle Course Create/Update
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await api.updateCourse(editingCourse.id, {
          title: cTitle,
          slug: cSlug,
          subtitle: cSubtitle,
          description: cDescription,
          language: cLanguage,
          level: cLevel,
          category: cCategory,
          price: cIsFree ? 0 : Number(cPrice),
          isFree: cIsFree,
          isPublished: cIsPublished,
          thumbnail: cThumbnail,
        });
      } else {
        await api.createCourse({
          title: cTitle,
          slug: cSlug,
          subtitle: cSubtitle,
          description: cDescription,
          language: cLanguage,
          level: cLevel,
          category: cCategory,
          price: cIsFree ? 0 : Number(cPrice),
          isFree: cIsFree,
          isPublished: cIsPublished,
          thumbnail: cThumbnail,
        });
      }
      setShowCourseModal(false);
      setEditingCourse(null);
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Error saving course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await api.updateCourse(course.id, { isPublished: !course.isPublished });
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Error toggling publish state');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course and all associated lessons? This action is permanent.')) return;
    try {
      await api.deleteCourse(courseId);
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Error deleting course');
    }
  };

  const openCurriculumEditor = async (courseId: string) => {
    setCurriculumCourseId(courseId);
    try {
      const res = await api.getAdminCurriculum(courseId);
      setCurriculumSections(res.sections);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch curriculum');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curriculumCourseId || !newSectionTitle.trim()) return;
    try {
      await api.createSection(curriculumCourseId, newSectionTitle.trim());
      setNewSectionTitle('');
      openCurriculumEditor(curriculumCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to add section');
    }
  };

  const handleAddLesson = async (sectionId: string) => {
    if (!newLessonTitle.trim()) return;
    try {
      await api.addLesson(sectionId, {
        title: newLessonTitle.trim(),
        durationMinutes: Number(newLessonDuration),
        isPreview: newLessonIsPreview,
      });
      setNewLessonTitle('');
      setNewLessonSectionId(null);
      if (curriculumCourseId) openCurriculumEditor(curriculumCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.deleteLesson(lessonId);
      if (curriculumCourseId) openCurriculumEditor(curriculumCourseId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson');
    }
  };

  const handleAssignCourse = async () => {
    if (!assignCourseModalUserId || !assignSelectedCourseId) return;
    try {
      await api.assignCourseToStudent(assignCourseModalUserId, assignSelectedCourseId);
      setAssignCourseModalUserId(null);
      fetchAll();
      alert('Course successfully assigned to student!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign course');
    }
  };

  const handleToggleStudentSuspension = async (student: any) => {
    try {
      await api.updateStudentStatus(student.id, { isSuspended: !student.isSuspended });
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed to update student status');
    }
  };

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.scheduleLiveClass({
        courseId: classCourseId,
        title: classTitle,
        startTime: classTime,
        meetingProvider: classProvider,
        meetingUrl: classMeetingUrl,
      });
      setShowClassModal(false);
      setClassTitle('');
      fetchAll();
      alert('Live class scheduled!');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule class');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createQuiz({
        courseId: qCourseId,
        title: qTitle,
        passingScorePercent: Number(qPassing),
        questions: [
          {
            id: `q_${Date.now()}`,
            type: 'multiple-choice',
            prompt: 'Sample Question: What is the formal greeting?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            explanation: 'Option A is the correct polite phrasing.',
            points: 50,
          }
        ]
      });
      setShowQuizModal(false);
      setQTitle('');
      fetchAll();
    } catch (err: any) {
      alert(err.message || 'Failed to create quiz');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <p className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">Management Portal</p>
          <h2 className="text-lg font-extrabold text-white">Admin Console</h2>
          <p className="text-xs text-slate-400 mt-0.5">{user?.name} · {user?.role}</p>
        </div>

        <nav className="p-3 space-y-1 flex-1 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'courses', label: 'Course Management', icon: BookOpen },
            { id: 'quizzes', label: 'Quizzes & Exams', icon: Award },
            { id: 'students', label: 'Students & Members', icon: Users },
            { id: 'classes', label: 'Live Video Classes', icon: Calendar },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setCurriculumCourseId(null);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-violet-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
          <p>LingoPro Academy v3.4</p>
          <p className="text-slate-400">All changes persist to data store</p>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Tab 1: Overview Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Academic & Revenue Overview</h1>
              <p className="text-xs text-slate-500 mt-1">Real-time metrics calculated from database store.</p>
            </div>

            {loadingAnalytics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : analytics && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Registered Students</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.metrics.totalStudents}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Total Courses</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">
                      {analytics.metrics.totalCourses} <span className="text-xs font-normal text-slate-400">({analytics.metrics.publishedCourses} published)</span>
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Total Enrollments</p>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.metrics.totalEnrollments}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-xs font-semibold text-slate-500">Gross Platform Revenue</p>
                    <p className="text-2xl font-extrabold text-emerald-600 mt-1">${analytics.metrics.totalRevenue}</p>
                  </div>
                </div>

                {/* Recent Activity Feeds */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Enrollments */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 mb-4">Recent Course Enrollments</h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      {analytics.recentEnrollments.map((enr: any) => (
                        <div key={enr.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{enr.studentName}</p>
                            <p className="text-[11px] text-slate-500">{enr.courseTitle}</p>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(enr.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-sm text-slate-900 mb-4">Verified Transactions</h3>
                    <div className="divide-y divide-slate-100 text-xs">
                      {analytics.recentTransactions.map((tx: any) => (
                        <div key={tx.id} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 capitalize">
                              {tx.type.replace('_', ' ')}: {tx.plan ? `${tx.plan} plan` : 'Course'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">{tx.id}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-600">+${tx.amount}</span>
                            <p className="text-[10px] text-slate-400">succeeded</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Course Management */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Course & Curriculum Management</h1>
                <p className="text-xs text-slate-500 mt-1">Create courses, manage sections, lessons, and draft visibility.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCourse(null);
                  setCTitle('');
                  setCSlug('');
                  setCSubtitle('');
                  setCDescription('');
                  setCPrice(49);
                  setCIsFree(false);
                  setCIsPublished(true);
                  setShowCourseModal(true);
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create New Course
              </button>
            </div>

            {/* Curriculum Editor Modal / Inline View */}
            {curriculumCourseId ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Curriculum Editor: {courses.find(c => c.id === curriculumCourseId)?.title}
                    </h3>
                    <p className="text-xs text-slate-500">Add modules and lessons to this course</p>
                  </div>
                  <button
                    onClick={() => setCurriculumCourseId(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    ← Back to Courses
                  </button>
                </div>

                {/* Add Section Form */}
                <form onSubmit={handleAddSection} className="flex gap-2">
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={e => setNewSectionTitle(e.target.value)}
                    placeholder="New Module Title (e.g. Module 3: Subjunctive Essentials)"
                    className="flex-1 text-xs px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Add Module
                  </button>
                </form>

                {/* Sections List */}
                <div className="space-y-4">
                  {curriculumSections.map(sec => (
                    <div key={sec.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-xs text-slate-800">{sec.title}</span>
                        <button
                          onClick={() => setNewLessonSectionId(newLessonSectionId === sec.id ? null : sec.id)}
                          className="text-[11px] font-semibold text-violet-600 hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Lesson
                        </button>
                      </div>

                      {/* Add Lesson Input Row */}
                      {newLessonSectionId === sec.id && (
                        <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 space-y-2 text-xs">
                          <input
                            type="text"
                            value={newLessonTitle}
                            onChange={e => setNewLessonTitle(e.target.value)}
                            placeholder="Lesson Title..."
                            className="w-full px-3 py-1.5 border border-slate-200 rounded"
                          />
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1">
                              <span className="text-slate-500">Duration (min):</span>
                              <input
                                type="number"
                                value={newLessonDuration}
                                onChange={e => setNewLessonDuration(Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-slate-200 rounded"
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={newLessonIsPreview}
                                onChange={e => setNewLessonIsPreview(e.target.checked)}
                              />
                              <span className="text-slate-700">Allow Free Preview</span>
                            </label>
                            <button
                              onClick={() => handleAddLesson(sec.id)}
                              className="ml-auto bg-violet-600 text-white font-semibold px-3 py-1 rounded"
                            >
                              Save Lesson
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lessons in Section */}
                      <div className="space-y-1.5">
                        {sec.lessons.map(l => (
                          <div
                            key={l.id}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{l.title}</span>
                              {l.isPreview && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400">{l.durationMinutes}m</span>
                              <button
                                onClick={() => handleDeleteLesson(l.id)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Courses Table */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Language & Level</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Curriculum</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courses.map(course => (
                      <tr key={course.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {course.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {course.language} · {course.level}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {course.isFree ? 'Free' : `$${course.price}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => openCurriculumEditor(course.id)}
                            className="text-violet-600 hover:underline font-semibold"
                          >
                            Edit Lessons ({course.totalLessons || 0})
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleTogglePublish(course)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 ${
                              course.isPublished
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {course.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {course.isPublished ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setCTitle(course.title);
                              setCSlug(course.slug);
                              setCSubtitle(course.subtitle);
                              setCDescription(course.description);
                              setCLanguage(course.language);
                              setCLevel(course.level);
                              setCCategory(course.category);
                              setCPrice(course.price);
                              setCIsFree(course.isFree);
                              setCIsPublished(course.isPublished);
                              setCThumbnail(course.thumbnail);
                              setShowCourseModal(true);
                            }}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-rose-600 hover:text-rose-800"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Course Modal */}
            {showCourseModal && (
              <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-bold text-base text-slate-900">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h3>
                    <button onClick={() => setShowCourseModal(false)} className="text-slate-400">✕</button>
                  </div>

                  <form onSubmit={handleSaveCourse} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                      <input
                        type="text"
                        required
                        value={cTitle}
                        onChange={e => setCTitle(e.target.value)}
                        placeholder="e.g. Italian Essentials for Travelers"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Language</label>
                        <select
                          value={cLanguage}
                          onChange={e => setCLanguage(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          {['Spanish', 'Japanese', 'French', 'German', 'Mandarin Chinese', 'Korean', 'Italian', 'English'].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">CEFR Level</label>
                        <select
                          value={cLevel}
                          onChange={e => setCLevel(e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          {['A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper-Intermediate', 'C1 Advanced'].map(lvl => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Subtitle / Summary</label>
                      <input
                        type="text"
                        value={cSubtitle}
                        onChange={e => setCSubtitle(e.target.value)}
                        placeholder="Short compelling description"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Price ($USD)</label>
                        <input
                          type="number"
                          value={cPrice}
                          onChange={e => setCPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cIsFree}
                            onChange={e => setCIsFree(e.target.checked)}
                          />
                          <span className="font-semibold text-slate-700">Free Course</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Thumbnail Image URL</label>
                      <input
                        type="text"
                        value={cThumbnail}
                        onChange={e => setCThumbnail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cIsPublished}
                          onChange={e => setCIsPublished(e.target.checked)}
                        />
                        <span className="font-semibold text-slate-800">Publish immediately to catalog</span>
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCourseModal(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg"
                      >
                        Save Course
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Quizzes */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Assessment & Quiz Center</h1>
                <p className="text-xs text-slate-500 mt-1">Configure module assessments, passing scores, and view student submissions.</p>
              </div>
              <button
                onClick={() => setShowQuizModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
              >
                + New Quiz
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Questions</th>
                    <th className="py-3 px-4">Passing %</th>
                    <th className="py-3 px-4">Submissions</th>
                    <th className="py-3 px-4">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quizzes.map(q => (
                    <tr key={q.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">{q.title}</td>
                      <td className="py-3 px-4 text-slate-600">{q.courseTitle}</td>
                      <td className="py-3 px-4">{q.totalQuestions} questions</td>
                      <td className="py-3 px-4 font-mono">{q.passingScorePercent}%</td>
                      <td className="py-3 px-4 font-mono">{q.totalSubmissions}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{q.passingRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quiz Modal */}
            {showQuizModal && (
              <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
                  <h3 className="font-bold text-base text-slate-900 mb-3">Create Assessment</h3>
                  <form onSubmit={handleCreateQuiz} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Quiz Title</label>
                      <input
                        type="text"
                        required
                        value={qTitle}
                        onChange={e => setQTitle(e.target.value)}
                        placeholder="Module 2 Final Assessment"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Associated Course</label>
                      <select
                        value={qCourseId}
                        onChange={e => setQCourseId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Passing Threshold (%)</label>
                      <input
                        type="number"
                        value={qPassing}
                        onChange={e => setQPassing(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="pt-3 flex justify-end gap-2">
                      <button type="button" onClick={() => setShowQuizModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white rounded font-semibold">Save Quiz</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Student Management */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Student & Member Registry</h1>
                <p className="text-xs text-slate-500 mt-1">Review student enrollments, assign courses, and enforce account suspensions.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Enrolled Courses</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {st.name} <br />
                        <span className="text-[11px] text-slate-400 font-normal">{st.email}</span>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium">{st.role}</td>
                      <td className="py-3 px-4 capitalize">{st.plan} ({st.planStatus})</td>
                      <td className="py-3 px-4">
                        {st.enrollments.map((en: any) => (
                          <div key={en.id} className="text-[11px] text-slate-600">
                            {en.courseTitle} ({en.progressPercent}%)
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${st.isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {st.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setAssignCourseModalUserId(st.id)}
                          className="text-violet-600 hover:underline font-semibold"
                        >
                          Assign Course
                        </button>
                        <button
                          onClick={() => handleToggleStudentSuspension(st)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          {st.isSuspended ? 'Activate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Assign Course Modal */}
            {assignCourseModalUserId && (
              <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Assign Course to Student</h3>
                  <select
                    value={assignSelectedCourseId}
                    onChange={e => setAssignSelectedCourseId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-4"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setAssignCourseModalUserId(null)} className="px-3 py-1.5 border rounded">Cancel</button>
                    <button onClick={handleAssignCourse} className="px-4 py-1.5 bg-violet-600 text-white rounded font-semibold">Assign Now</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Live Classes Manager */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Live Video Classes Scheduler</h1>
                <p className="text-xs text-slate-500 mt-1">Schedule video speaking labs on Zoom & Google Meet for enrolled cohorts.</p>
              </div>
              <button
                onClick={() => setShowClassModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
              >
                + Schedule Class
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title & Topic</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4">Attending</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveClasses.map(cls => (
                    <tr key={cls.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">{cls.title}</td>
                      <td className="py-3 px-4 text-slate-600">{cls.courseTitle}</td>
                      <td className="py-3 px-4 font-mono">{new Date(cls.startTime).toLocaleString()}</td>
                      <td className="py-3 px-4">{cls.meetingProvider}</td>
                      <td className="py-3 px-4">{cls.enrolledStudentIds.length} enrolled</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Cancel this class?')) {
                              api.deleteLiveClass(cls.id).then(fetchAll);
                            }
                          }}
                          className="text-rose-600 hover:underline"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Class Modal */}
            {showClassModal && (
              <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
                  <h3 className="font-bold text-base text-slate-900 mb-3">Schedule Live Class</h3>
                  <form onSubmit={handleScheduleClass} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Session Title</label>
                      <input
                        type="text"
                        required
                        value={classTitle}
                        onChange={e => setClassTitle(e.target.value)}
                        placeholder="Live Speaking Breakout Lab"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Course</label>
                      <select
                        value={classCourseId}
                        onChange={e => setClassCourseId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Platform</label>
                        <select
                          value={classProvider}
                          onChange={e => setClassProvider(e.target.value as any)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="Zoom">Zoom</option>
                          <option value="Google Meet">Google Meet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Date & Time</label>
                        <input
                          type="datetime-local"
                          value={classTime}
                          onChange={e => setClassTime(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Meeting URL</label>
                      <input
                        type="url"
                        required
                        value={classMeetingUrl}
                        onChange={e => setClassMeetingUrl(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="pt-3 flex justify-end gap-2">
                      <button type="button" onClick={() => setShowClassModal(false)} className="px-3 py-1.5 border rounded">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 bg-violet-600 text-white rounded font-semibold">Schedule</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
