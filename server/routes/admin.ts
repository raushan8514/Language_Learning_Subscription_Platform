import { Router, Request, Response } from 'express';
import { db, Course, Section, Lesson, Quiz, QuizQuestion, Enrollment } from '../db.ts';
import { authenticate, requireRole } from './auth.ts';

export const adminRouter = Router();

// Protect ALL routes in adminRouter to admin or instructor (restricted)
adminRouter.use(authenticate, requireRole(['admin', 'instructor']));

// GET /api/admin/analytics - Real metrics computed from DB
adminRouter.get('/analytics', (req: Request, res: Response) => {
  const courses = db.get('courses');
  const sections = db.get('sections');
  const users = db.get('users');
  const enrollments = db.get('enrollments');
  const transactions = db.get('transactions');
  const liveClasses = db.get('liveClasses');
  const certificates = db.get('certificates');

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);
  const totalEnrollments = enrollments.length;
  const completedEnrollments = enrollments.filter(e => e.isCompleted).length;
  const totalRevenue = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const recentEnrollments = [...enrollments]
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, 6)
    .map(e => {
      const u = users.find(user => user.id === e.userId);
      const c = courses.find(course => course.id === e.courseId);
      return {
        ...e,
        studentName: u?.name || 'Unknown Student',
        studentEmail: u?.email || 'Unknown Email',
        courseTitle: c?.title || 'Unknown Course',
      };
    });

  return res.json({
    metrics: {
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalLessons,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      totalRevenue,
      activeLiveClasses: liveClasses.filter(c => c.status === 'scheduled').length,
      issuedCertificates: certificates.filter(c => c.status === 'valid').length,
    },
    recentTransactions,
    recentEnrollments,
  });
});

// GET /api/admin/courses - List all courses (including drafts)
adminRouter.get('/courses', (req: Request, res: Response) => {
  const courses = db.get('courses');
  const sections = db.get('sections');
  const enrollments = db.get('enrollments');

  const enriched = courses.map(c => {
    const cSections = sections.filter(s => s.courseId === c.id);
    const lessonCount = cSections.reduce((sum, s) => sum + s.lessons.length, 0);
    const enrCount = enrollments.filter(e => e.courseId === c.id).length;
    return {
      ...c,
      sectionCount: cSections.length,
      lessonCount,
      enrollmentCount: enrCount,
    };
  });

  return res.json({ courses: enriched });
});

// POST /api/admin/courses - Create course
adminRouter.post('/courses', (req: Request, res: Response) => {
  const user = (req as any).user;
  const {
    title,
    slug,
    subtitle,
    description,
    language,
    level,
    category,
    price,
    isFree,
    thumbnail,
    durationHours,
    prerequisites,
    learningOutcomes,
    isPublished,
  } = req.body;

  if (!title || !language || !level) {
    return res.status(400).json({ error: 'Title, language, and level are required' });
  }

  const generatedSlug = (slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newCourse: Course = {
    id: `course_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    slug: generatedSlug,
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : '',
    description: description ? description.trim() : '',
    language: language.trim(),
    level: level || 'A1 Beginner',
    category: category || 'General Conversation',
    instructorId: user.id,
    instructorName: user.name,
    instructorTitle: user.bio || 'LingoPro Instructor',
    instructorAvatar: user.avatar,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80',
    price: isFree ? 0 : Number(price) || 0,
    isFree: Boolean(isFree || Number(price) === 0),
    isPublished: Boolean(isPublished),
    durationHours: Number(durationHours) || 8,
    rating: 5.0,
    totalReviews: 1,
    prerequisites: Array.isArray(prerequisites) ? prerequisites : ['Curiosity and commitment'],
    learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : ['Gain practical fluency in the target language'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.update('courses', list => [newCourse, ...list]);

  // Create initial section
  const initialSection: Section = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    courseId: newCourse.id,
    title: 'Module 1: Orientation & Core Fundamentals',
    order: 1,
    lessons: [
      {
        id: `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sectionId: '',
        courseId: newCourse.id,
        title: 'Introduction & Course Roadmap',
        durationMinutes: 12,
        order: 1,
        isPreview: true,
        content: `### Welcome to ${newCourse.title}!\nGet ready to start your learning journey. In this module we will cover the key building blocks.`,
        vocabulary: [
          { term: 'Welcome', translation: 'Bienvenido / ようこそ / Bienvenue', example: 'Welcome to class!', partOfSpeech: 'Expression' }
        ]
      }
    ]
  };
  initialSection.lessons[0].sectionId = initialSection.id;
  db.update('sections', list => [...list, initialSection]);

  return res.status(201).json({ message: 'Course created successfully', course: newCourse });
});

// PATCH /api/admin/courses/:id - Update course
adminRouter.patch('/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const courses = db.get('courses');
  const existing = courses.find(c => c.id === id);
  if (!existing) return res.status(404).json({ error: 'Course not found' });

  db.update('courses', list =>
    list.map(c => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
  );

  const updated = db.get('courses').find(c => c.id === id);
  return res.json({ message: 'Course updated successfully', course: updated });
});

// DELETE /api/admin/courses/:id - Delete course
adminRouter.delete('/courses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const courses = db.get('courses');
  const existing = courses.find(c => c.id === id);
  if (!existing) return res.status(404).json({ error: 'Course not found' });

  db.update('courses', list => list.filter(c => c.id !== id));
  db.update('sections', list => list.filter(s => s.courseId !== id));

  return res.json({ message: 'Course and associated curriculum sections deleted successfully' });
});

// GET /api/admin/courses/:id/curriculum - Get curriculum tree for editing
adminRouter.get('/courses/:id/curriculum', (req: Request, res: Response) => {
  const { id } = req.params;
  const sections = db.get('sections').filter(s => s.courseId === id).sort((a, b) => a.order - b.order);
  return res.json({ sections });
});

// POST /api/admin/courses/:id/sections - Create section
adminRouter.post('/courses/:id/sections', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Section title is required' });

  const existingSections = db.get('sections').filter(s => s.courseId === id);
  const newSection: Section = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    courseId: id,
    title: title.trim(),
    order: existingSections.length + 1,
    lessons: [],
  };

  db.update('sections', list => [...list, newSection]);
  return res.status(201).json({ message: 'Section created', section: newSection });
});

// POST /api/admin/sections/:sectionId/lessons - Add lesson
adminRouter.post('/sections/:sectionId/lessons', (req: Request, res: Response) => {
  const { sectionId } = req.params;
  const { title, durationMinutes, isPreview, content, videoUrl, vocabulary, dialogue, quizId } = req.body;
  if (!title) return res.status(400).json({ error: 'Lesson title is required' });

  const sections = db.get('sections');
  const sec = sections.find(s => s.id === sectionId);
  if (!sec) return res.status(404).json({ error: 'Section not found' });

  const newLesson: Lesson = {
    id: `les_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sectionId,
    courseId: sec.courseId,
    title: title.trim(),
    durationMinutes: Number(durationMinutes) || 15,
    order: sec.lessons.length + 1,
    isPreview: Boolean(isPreview),
    content: content || 'Lesson explanation and exercises.',
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    vocabulary: Array.isArray(vocabulary) ? vocabulary : [],
    dialogue: Array.isArray(dialogue) ? dialogue : [],
    quizId: quizId || undefined,
  };

  db.update('sections', list =>
    list.map(s => (s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s))
  );

  return res.status(201).json({ message: 'Lesson added', lesson: newLesson });
});

// PATCH /api/admin/lessons/:lessonId - Edit lesson
adminRouter.patch('/lessons/:lessonId', (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const updates = req.body;

  let found = false;
  db.update('sections', list =>
    list.map(s => {
      const idx = s.lessons.findIndex(l => l.id === lessonId);
      if (idx !== -1) {
        found = true;
        const updatedLessons = [...s.lessons];
        updatedLessons[idx] = { ...updatedLessons[idx], ...updates };
        return { ...s, lessons: updatedLessons };
      }
      return s;
    })
  );

  if (!found) return res.status(404).json({ error: 'Lesson not found' });
  return res.json({ message: 'Lesson updated successfully' });
});

// DELETE /api/admin/lessons/:lessonId - Delete lesson
adminRouter.delete('/lessons/:lessonId', (req: Request, res: Response) => {
  const { lessonId } = req.params;

  db.update('sections', list =>
    list.map(s => ({
      ...s,
      lessons: s.lessons.filter(l => l.id !== lessonId),
    }))
  );

  return res.json({ message: 'Lesson deleted' });
});

// GET /api/admin/quizzes - List quizzes
adminRouter.get('/quizzes', (req: Request, res: Response) => {
  const quizzes = db.get('quizzes');
  const courses = db.get('courses');
  const submissions = db.get('submissions');

  const enriched = quizzes.map(q => {
    const c = courses.find(course => course.id === q.courseId);
    const subList = submissions.filter(s => s.quizId === q.id);
    const passCount = subList.filter(s => s.passed).length;
    return {
      ...q,
      courseTitle: c?.title || 'Unknown Course',
      totalQuestions: q.questions.length,
      totalSubmissions: subList.length,
      passingRate: subList.length > 0 ? Math.round((passCount / subList.length) * 100) : 0,
    };
  });

  return res.json({ quizzes: enriched });
});

// POST /api/admin/quizzes - Create quiz
adminRouter.post('/quizzes', (req: Request, res: Response) => {
  const { courseId, lessonId, title, instructions, passingScorePercent, timeLimitMinutes, allowedAttempts, questions } = req.body;
  if (!courseId || !title) return res.status(400).json({ error: 'Course and quiz title are required' });

  const newQuiz: Quiz = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    courseId,
    lessonId: lessonId || undefined,
    title: title.trim(),
    instructions: instructions || 'Read each question carefully and select the best answer.',
    passingScorePercent: Number(passingScorePercent) || 80,
    timeLimitMinutes: Number(timeLimitMinutes) || 15,
    allowedAttempts: Number(allowedAttempts) || 3,
    questions: Array.isArray(questions) ? questions : [],
  };

  db.update('quizzes', list => [...list, newQuiz]);

  // If associated with a lesson, update lesson's quizId
  if (lessonId) {
    db.update('sections', list =>
      list.map(s => ({
        ...s,
        lessons: s.lessons.map(l => (l.id === lessonId ? { ...l, quizId: newQuiz.id } : l)),
      }))
    );
  }

  return res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
});

// GET /api/admin/students - List students and enrollment progress
adminRouter.get('/students', (req: Request, res: Response) => {
  const users = db.get('users');
  const enrollments = db.get('enrollments');
  const courses = db.get('courses');

  const safeStudents = users.map(u => {
    const { passwordHash: _, ...safe } = u;
    const userEnrollments = enrollments.filter(e => e.userId === u.id);
    const enrichedEnr = userEnrollments.map(e => {
      const c = courses.find(course => course.id === e.courseId);
      return {
        ...e,
        courseTitle: c?.title || 'Unknown Course',
      };
    });
    return {
      ...safe,
      enrollments: enrichedEnr,
    };
  });

  return res.json({ students: safeStudents });
});

// POST /api/admin/students/:userId/assign-course - Manually assign course to student
adminRouter.post('/students/:userId/assign-course', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ error: 'courseId is required' });

  const users = db.get('users');
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const courses = db.get('courses');
  const course = courses.find(c => c.id === courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const enrollments = db.get('enrollments');
  const existing = enrollments.find(e => e.userId === userId && e.courseId === courseId);
  if (existing) {
    return res.json({ message: 'Student is already enrolled in this course', enrollment: existing });
  }

  const sections = db.get('sections').filter(s => s.courseId === course.id);
  const firstLessonId = sections[0]?.lessons[0]?.id;

  const newEnrollment: Enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    courseId,
    enrolledAt: new Date().toISOString(),
    completedLessonIds: [],
    lastVisitedLessonId: firstLessonId,
    progressPercent: 0,
    isCompleted: false,
  };

  db.update('enrollments', list => [...list, newEnrollment]);

  return res.status(201).json({
    message: `Assigned ${course.title} to ${user.name}`,
    enrollment: newEnrollment,
  });
});

// PATCH /api/admin/students/:userId/status - Toggle suspension or change role
adminRouter.patch('/students/:userId/status', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isSuspended, role } = req.body;

  const users = db.get('users');
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.update('users', list =>
    list.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          isSuspended: isSuspended !== undefined ? Boolean(isSuspended) : u.isSuspended,
          role: role && ['student', 'instructor', 'admin'].includes(role) ? role : u.role,
        };
      }
      return u;
    })
  );

  const updated = db.get('users').find(u => u.id === userId);
  const { passwordHash: _, ...safeUser } = updated!;
  return res.json({ message: 'User updated', user: safeUser });
});
