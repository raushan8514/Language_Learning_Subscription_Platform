import { Course, Section, Lesson, Quiz, QuizSubmission, LiveClass, Certificate, PricingPlan, User, Enrollment } from '../types';

const TOKEN_KEY = 'lingopro_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  demoLogin: (payload: { role?: string; email?: string }) =>
    request<{ token: string; user: User }>('/api/auth/demo-login', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: () =>
    request<{ user: User }>('/api/auth/me'),

  updateProfile: (payload: { name?: string; bio?: string; avatar?: string }) =>
    request<{ user: User; message: string }>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Courses
  getCourses: (params?: { q?: string; language?: string; level?: string; category?: string; priceType?: string; sort?: string }) => {
    const qry = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) qry.append(k, v);
      });
    }
    const qs = qry.toString();
    return request<{ courses: Course[] }>(`/api/courses${qs ? `?${qs}` : ''}`);
  },

  getCourseMetadata: () =>
    request<{ languages: string[]; categories: string[]; levels: string[] }>('/api/courses/meta/languages'),

  getCourseDetail: (slug: string) =>
    request<{ course: Course; sections: Section[]; isEnrolled: boolean; userProgress: Enrollment | null }>(`/api/courses/${slug}`),

  // Learning Player & Quizzes
  enrollCourse: (courseSlug: string) =>
    request<{ message: string; enrollment: Enrollment }>(`/api/learn/${courseSlug}/enroll`, { method: 'POST' }),

  getLesson: (courseSlug: string, lessonId: string) =>
    request<{
      course: { id: string; slug: string; title: string; language: string; level: string; instructorName: string };
      sections: { id: string; title: string; lessons: Array<{ id: string; title: string; durationMinutes: number; isPreview: boolean; quizId?: string; isCompleted: boolean }> }[];
      currentLesson: Lesson;
      prevLesson: { id: string; title: string } | null;
      nextLesson: { id: string; title: string } | null;
      isCompleted: boolean;
      enrollment?: Enrollment;
    }>(`/api/learn/${courseSlug}/lesson/${lessonId}`),

  markLessonComplete: (courseSlug: string, lessonId: string) =>
    request<{ message: string; enrollment: Enrollment; completed: boolean }>(`/api/learn/${courseSlug}/lesson/${lessonId}/complete`, { method: 'POST' }),

  getQuiz: (courseSlug: string, quizId: string) =>
    request<{ quiz: Quiz }>(`/api/learn/${courseSlug}/quiz/${quizId}`),

  submitQuiz: (courseSlug: string, quizId: string, answers: Record<string, string>) =>
    request<{ message: string; submission: QuizSubmission }>(`/api/learn/${courseSlug}/quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getQuizHistory: (courseSlug: string, quizId: string) =>
    request<{ submissions: QuizSubmission[] }>(`/api/learn/${courseSlug}/quiz/${quizId}/history`),

  // Dashboard
  getDashboardSummary: () =>
    request<{
      user: User;
      metrics: { enrolledCoursesCount: number; completedLessonsCount: number; certificatesCount: number; averageProgress: number; streak: number };
      enrolledCourses: Array<{
        enrollmentId: string;
        courseId: string;
        courseSlug: string;
        courseTitle: string;
        thumbnail: string;
        language: string;
        level: string;
        progressPercent: number;
        completedLessonsCount: number;
        totalLessons: number;
        isCompleted: boolean;
        completedAt?: string;
        certificateId?: string;
        lastVisitedLessonId?: string;
        nextLessonToResume: { id: string; title: string } | null;
      }>;
      upcomingClasses: LiveClass[];
      recentQuizzes: QuizSubmission[];
      certificates: Certificate[];
    }>('/api/dashboard/summary'),

  // Live Classes
  getLiveClasses: () =>
    request<{ classes: LiveClass[] }>('/api/classes'),

  joinLiveClass: (classId: string) =>
    request<{
      authorized: boolean;
      meetingUrl: string;
      meetingProvider: 'Zoom' | 'Google Meet';
      meetingId: string;
      passcode: string;
      title: string;
      instructorName: string;
      startTime: string;
    }>(`/api/classes/${classId}/join`),

  scheduleLiveClass: (data: Partial<LiveClass>) =>
    request<{ message: string; liveClass: LiveClass }>('/api/classes', { method: 'POST', body: JSON.stringify(data) }),

  deleteLiveClass: (classId: string) =>
    request<{ message: string }>(`/api/classes/${classId}`, { method: 'DELETE' }),

  // Certificates
  verifyCertificate: (id: string) =>
    request<{ status: 'valid' | 'revoked'; certificate: Certificate; revocationReason: string | null }>(`/api/certificates/verify/${id}`),

  getUserCertificates: () =>
    request<{ certificates: Certificate[] }>('/api/certificates/user'),

  revokeCertificate: (id: string, reason?: string) =>
    request<{ message: string }>((`/api/certificates/revoke/${id}`), { method: 'POST', body: JSON.stringify({ reason }) }),

  restoreCertificate: (id: string) =>
    request<{ message: string }>((`/api/certificates/restore/${id}`), { method: 'POST' }),

  // Billing & Subscriptions
  getPricingPlans: () =>
    request<{ plans: PricingPlan[] }>('/api/billing/plans'),

  checkout: (data: { type: 'plan_subscription' | 'course_purchase'; plan?: 'monthly' | 'yearly'; courseId?: string; cardNumber?: string }) =>
    request<{ message: string; transaction: any; user?: User }>('/api/billing/checkout', { method: 'POST', body: JSON.stringify(data) }),

  cancelSubscription: () =>
    request<{ message: string }>('/api/billing/cancel', { method: 'POST' }),

  // Admin Console
  getAdminAnalytics: () =>
    request<{
      metrics: {
        totalStudents: number;
        totalInstructors: number;
        totalCourses: number;
        publishedCourses: number;
        totalLessons: number;
        totalEnrollments: number;
        completedEnrollments: number;
        completionRate: number;
        totalRevenue: number;
        activeLiveClasses: number;
        issuedCertificates: number;
      };
      recentTransactions: any[];
      recentEnrollments: any[];
    }>('/api/admin/analytics'),

  getAdminCourses: () =>
    request<{ courses: Course[] }>('/api/admin/courses'),

  createCourse: (data: Partial<Course>) =>
    request<{ message: string; course: Course }>('/api/admin/courses', { method: 'POST', body: JSON.stringify(data) }),

  updateCourse: (id: string, updates: Partial<Course>) =>
    request<{ message: string; course: Course }>(`/api/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  deleteCourse: (id: string) =>
    request<{ message: string }>(`/api/admin/courses/${id}`, { method: 'DELETE' }),

  getAdminCurriculum: (courseId: string) =>
    request<{ sections: Section[] }>(`/api/admin/courses/${courseId}/curriculum`),

  createSection: (courseId: string, title: string) =>
    request<{ message: string; section: Section }>(`/api/admin/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify({ title }) }),

  addLesson: (sectionId: string, data: Partial<Lesson>) =>
    request<{ message: string; lesson: Lesson }>(`/api/admin/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),

  deleteLesson: (lessonId: string) =>
    request<{ message: string }>(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' }),

  getAdminQuizzes: () =>
    request<{ quizzes: any[] }>('/api/admin/quizzes'),

  createQuiz: (data: any) =>
    request<{ message: string; quiz: Quiz }>('/api/admin/quizzes', { method: 'POST', body: JSON.stringify(data) }),

  getAdminStudents: () =>
    request<{ students: any[] }>('/api/admin/students'),

  assignCourseToStudent: (userId: string, courseId: string) =>
    request<{ message: string; enrollment: Enrollment }>(`/api/admin/students/${userId}/assign-course`, { method: 'POST', body: JSON.stringify({ courseId }) }),

  updateStudentStatus: (userId: string, data: { isSuspended?: boolean; role?: string }) =>
    request<{ message: string; user: User }>(`/api/admin/students/${userId}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};
