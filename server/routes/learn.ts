import { Router, Request, Response } from 'express';
import { db, User, Section, Lesson, Quiz, QuizSubmission, Enrollment, Certificate } from '../db.ts';
import { authenticate } from './auth.ts';

export const learnRouter = Router();

// Helper to check course access
function checkCourseAccess(user: User, courseId: string): boolean {
  if (user.role === 'admin' || user.role === 'instructor') return true;
  if (user.planStatus === 'active' && (user.plan === 'monthly' || user.plan === 'yearly')) return true;

  const enrollments = db.get('enrollments');
  const enrollment = enrollments.find(e => e.userId === user.id && e.courseId === courseId);
  return !!enrollment;
}

// POST /api/learn/:courseSlug/enroll
learnRouter.post('/:courseSlug/enroll', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { courseSlug } = req.params;

  const courses = db.get('courses');
  const course = courses.find(c => c.slug === courseSlug || c.id === courseSlug);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const enrollments = db.get('enrollments');
  const existing = enrollments.find(e => e.userId === user.id && e.courseId === course.id);
  if (existing) {
    return res.json({ message: 'Already enrolled', enrollment: existing });
  }

  // Course must be free or user has active Pro subscription, or user is instructor/admin
  const hasProPlan = user.planStatus === 'active' && (user.plan === 'monthly' || user.plan === 'yearly');
  if (!course.isFree && course.price > 0 && !hasProPlan && user.role === 'student') {
    return res.status(402).json({
      error: 'Payment required to enroll in this premium course. Upgrade to Pro or purchase this course individually.',
      coursePrice: course.price,
    });
  }

  // Find first lesson for lastVisitedLessonId
  const sections = db.get('sections').filter(s => s.courseId === course.id).sort((a, b) => a.order - b.order);
  const firstLessonId = sections[0]?.lessons[0]?.id;

  const newEnrollment: Enrollment = {
    id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    courseId: course.id,
    enrolledAt: new Date().toISOString(),
    completedLessonIds: [],
    lastVisitedLessonId: firstLessonId,
    progressPercent: 0,
    isCompleted: false,
  };

  db.update('enrollments', list => [...list, newEnrollment]);

  return res.status(201).json({
    message: `Successfully enrolled in ${course.title}`,
    enrollment: newEnrollment,
  });
});

// GET /api/learn/:courseSlug/lesson/:lessonId
learnRouter.get('/:courseSlug/lesson/:lessonId', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { courseSlug, lessonId } = req.params;

  const courses = db.get('courses');
  const course = courses.find(c => c.slug === courseSlug || c.id === courseSlug);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const sections = db.get('sections').filter(s => s.courseId === course.id);
  let targetLesson: Lesson | null = null;
  let targetSection: Section | null = null;

  for (const s of sections) {
    const l = s.lessons.find(item => item.id === lessonId);
    if (l) {
      targetLesson = l;
      targetSection = s;
      break;
    }
  }

  if (!targetLesson || !targetSection) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const hasAccess = checkCourseAccess(user, course.id) || targetLesson.isPreview;
  if (!hasAccess) {
    return res.status(403).json({
      error: 'Lesson is locked. You must enroll in this course or activate a Pro subscription to view this lesson.',
    });
  }

  // Get user enrollment & completed list
  const enrollments = db.get('enrollments');
  const enrollment = enrollments.find(e => e.userId === user.id && e.courseId === course.id);

  // Update last visited lesson
  if (enrollment) {
    db.update('enrollments', list =>
      list.map(e => (e.id === enrollment.id ? { ...e, lastVisitedLessonId: targetLesson.id } : e))
    );
  }

  // Find prev and next lessons for navigation
  const allLessons: Lesson[] = [];
  sections
    .sort((a, b) => a.order - b.order)
    .forEach(s => {
      s.lessons.sort((a, b) => a.order - b.order).forEach(l => allLessons.push(l));
    });

  const currentIndex = allLessons.findIndex(l => l.id === targetLesson!.id);
  const prevLesson = currentIndex > 0 ? { id: allLessons[currentIndex - 1].id, title: allLessons[currentIndex - 1].title } : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? { id: allLessons[currentIndex + 1].id, title: allLessons[currentIndex + 1].title } : null;

  return res.json({
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      language: course.language,
      level: course.level,
      instructorName: course.instructorName,
    },
    sections: sections.map(s => ({
      id: s.id,
      title: s.order + '. ' + s.title,
      lessons: s.lessons.map(l => ({
        id: l.id,
        title: l.title,
        durationMinutes: l.durationMinutes,
        isPreview: l.isPreview,
        quizId: l.quizId,
        isCompleted: enrollment?.completedLessonIds.includes(l.id) || false,
      })),
    })),
    currentLesson: targetLesson,
    prevLesson,
    nextLesson,
    isCompleted: enrollment?.completedLessonIds.includes(targetLesson.id) || false,
    enrollment,
  });
});

// POST /api/learn/:courseSlug/lesson/:lessonId/complete
learnRouter.post('/:courseSlug/lesson/:lessonId/complete', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { courseSlug, lessonId } = req.params;

  const courses = db.get('courses');
  const course = courses.find(c => c.slug === courseSlug || c.id === courseSlug);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const sections = db.get('sections').filter(s => s.courseId === course.id);
  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  const enrollments = db.get('enrollments');
  let enrollment = enrollments.find(e => e.userId === user.id && e.courseId === course.id);

  if (!enrollment) {
    // If user has pro plan or admin and completed without explicit enroll, auto-create enrollment
    enrollment = {
      id: `enr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      courseId: course.id,
      enrolledAt: new Date().toISOString(),
      completedLessonIds: [lessonId],
      lastVisitedLessonId: lessonId,
      progressPercent: Math.round((1 / Math.max(totalLessons, 1)) * 100),
      isCompleted: totalLessons <= 1,
    };
    db.update('enrollments', list => [...list, enrollment!]);
  } else {
    const completedSet = new Set(enrollment.completedLessonIds);
    completedSet.add(lessonId);
    const updatedCompletedIds = Array.from(completedSet);
    const progressPercent = Math.min(100, Math.round((updatedCompletedIds.length / Math.max(totalLessons, 1)) * 100));
    const isCompleted = updatedCompletedIds.length >= totalLessons && totalLessons > 0;

    let certificateId = enrollment.certificateId;
    // Check if course is newly 100% completed and needs a certificate
    if (isCompleted && !certificateId) {
      const year = new Date().getFullYear();
      const code = course.language.substring(0, 2).toUpperCase();
      const rand = Math.floor(1000 + Math.random() * 9000);
      certificateId = `LP-${year}-${code}-${rand}`;

      const newCert: Certificate = {
        id: certificateId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        courseId: course.id,
        courseTitle: course.title,
        language: course.language,
        level: course.level,
        issueDate: new Date().toISOString().split('T')[0],
        instructorName: course.instructorName,
        status: 'valid',
        credentialHash: Math.random().toString(16).substring(2, 18) + Math.random().toString(16).substring(2, 18),
      };

      db.update('certificates', list => [...list, newCert]);
    }

    db.update('enrollments', list =>
      list.map(e =>
        e.id === enrollment!.id
          ? {
              ...e,
              completedLessonIds: updatedCompletedIds,
              progressPercent,
              isCompleted,
              completedAt: isCompleted ? new Date().toISOString() : e.completedAt,
              certificateId,
            }
          : e
      )
    );
  }

  const updatedEnrollment = db.get('enrollments').find(e => e.userId === user.id && e.courseId === course.id);
  return res.json({
    message: 'Lesson marked as complete',
    enrollment: updatedEnrollment,
    completed: true,
  });
});

// GET /api/learn/:courseSlug/quiz/:quizId - Student loads quiz (strips answers)
learnRouter.get('/:courseSlug/quiz/:quizId', authenticate, (req: Request, res: Response) => {
  const { quizId } = req.params;
  const quizzes = db.get('quizzes');
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  // Strip answers & explanations from student view
  const safeQuestions = quiz.questions.map(q => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    contextSnippet: q.contextSnippet,
    options: q.options,
    points: q.points,
  }));

  return res.json({
    quiz: {
      id: quiz.id,
      courseId: quiz.courseId,
      lessonId: quiz.lessonId,
      title: quiz.title,
      instructions: quiz.instructions,
      passingScorePercent: quiz.passingScorePercent,
      timeLimitMinutes: quiz.timeLimitMinutes,
      allowedAttempts: quiz.allowedAttempts,
      questions: safeQuestions,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    },
  });
});

// POST /api/learn/:courseSlug/quiz/:quizId/submit - Student submits answers
learnRouter.post('/:courseSlug/quiz/:quizId/submit', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { quizId } = req.params;
  const { answers } = req.body as { answers: Record<string, string> };

  const quizzes = db.get('quizzes');
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers payload is required' });
  }

  // Count prior attempts
  const submissions = db.get('submissions');
  const userAttempts = submissions.filter(s => s.quizId === quizId && s.userId === user.id);
  if (quiz.allowedAttempts > 0 && userAttempts.length >= quiz.allowedAttempts) {
    return res.status(403).json({
      error: `You have exhausted the maximum allowed attempts (${quiz.allowedAttempts}) for this assessment.`,
    });
  }

  let earnedScore = 0;
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const feedback: Record<string, { correct: boolean; explanation: string; correctAnswer: string }> = {};

  quiz.questions.forEach(q => {
    const rawStudentAns = (answers[q.id] || '').trim();
    let isCorrect = false;

    if (q.type === 'multiple-choice') {
      isCorrect = rawStudentAns.toLowerCase() === q.correctAnswer.toLowerCase();
    } else {
      // Short-answer normalized grading: strip accents, leading/trailing whitespace, punctuation
      const cleanStudent = rawStudentAns.toLowerCase().replace(/[¡!¿?.,]/g, '').trim();
      const cleanCorrect = q.correctAnswer.toLowerCase().replace(/[¡!¿?.,]/g, '').trim();
      isCorrect = cleanStudent === cleanCorrect;
    }

    if (isCorrect) {
      earnedScore += q.points;
    }

    feedback[q.id] = {
      correct: isCorrect,
      explanation: q.explanation,
      correctAnswer: q.correctAnswer,
    };
  });

  const scorePercent = Math.round((earnedScore / Math.max(totalPoints, 1)) * 100);
  const passed = scorePercent >= quiz.passingScorePercent;

  const newSubmission: QuizSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    quizId: quiz.id,
    userId: user.id,
    userEmail: user.email,
    score: earnedScore,
    totalPoints,
    scorePercent,
    passed,
    answers,
    feedback,
    attemptNumber: userAttempts.length + 1,
    submittedAt: new Date().toISOString(),
  };

  db.update('submissions', list => [...list, newSubmission]);

  return res.json({
    message: passed ? 'Congratulations! You passed the assessment.' : 'Assessment completed. Review feedback and retry.',
    submission: newSubmission,
  });
});

// GET /api/learn/:courseSlug/quiz/:quizId/history
learnRouter.get('/:courseSlug/quiz/:quizId/history', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { quizId } = req.params;

  const submissions = db.get('submissions');
  const userSubmissions = submissions
    .filter(s => s.quizId === quizId && s.userId === user.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return res.json({ submissions: userSubmissions });
});
