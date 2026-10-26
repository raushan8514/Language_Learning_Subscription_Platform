import { Router, Request, Response } from 'express';
import { db, User } from '../db.ts';
import { authenticate } from './auth.ts';

export const dashboardRouter = Router();

// GET /api/dashboard/summary
dashboardRouter.get('/summary', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const courses = db.get('courses');
  const sections = db.get('sections');
  const enrollments = db.get('enrollments');
  const submissions = db.get('submissions');
  const liveClasses = db.get('liveClasses');
  const certificates = db.get('certificates');

  // User's enrollments
  const userEnrollments = enrollments.filter(e => e.userId === user.id);

  const enrolledCourseCards = userEnrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    const courseSections = sections.filter(s => s.courseId === e.courseId);
    const totalLessons = courseSections.reduce((acc, s) => acc + s.lessons.length, 0);

    // Find next lesson to resume
    let nextLessonToResume: { id: string; title: string } | null = null;
    let foundCurrent = false;

    for (const sec of courseSections) {
      for (const les of sec.lessons) {
        if (!e.completedLessonIds.includes(les.id)) {
          nextLessonToResume = { id: les.id, title: les.title };
          foundCurrent = true;
          break;
        }
      }
      if (foundCurrent) break;
    }

    if (!nextLessonToResume && courseSections[0]?.lessons[0]) {
      nextLessonToResume = {
        id: courseSections[0].lessons[0].id,
        title: courseSections[0].lessons[0].title,
      };
    }

    return {
      enrollmentId: e.id,
      courseId: e.courseId,
      courseSlug: course?.slug || e.courseId,
      courseTitle: course?.title || 'Course',
      thumbnail: course?.thumbnail || '',
      language: course?.language || '',
      level: course?.level || '',
      progressPercent: e.progressPercent,
      completedLessonsCount: e.completedLessonIds.length,
      totalLessons,
      isCompleted: e.isCompleted,
      completedAt: e.completedAt,
      certificateId: e.certificateId,
      lastVisitedLessonId: e.lastVisitedLessonId,
      nextLessonToResume,
    };
  });

  // Recent quiz attempts
  const userSubmissions = submissions
    .filter(s => s.userId === user.id)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  // User's certificates
  const userCertificates = certificates.filter(c => c.userId === user.id);

  // User's upcoming live classes
  const enrolledCourseIds = userEnrollments.map(e => e.courseId);
  const now = new Date().toISOString();
  const upcomingClasses = liveClasses
    .filter(cls => {
      // User is explicitly registered OR enrolled in the parent course
      const isEligible = cls.enrolledStudentIds.includes(user.id) || enrolledCourseIds.includes(cls.courseId);
      return isEligible && cls.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Overall metrics
  const totalCompletedLessons = userEnrollments.reduce((sum, e) => sum + e.completedLessonIds.length, 0);
  const totalCertificates = userCertificates.length;
  const averageProgress = userEnrollments.length > 0
    ? Math.round(userEnrollments.reduce((sum, e) => sum + e.progressPercent, 0) / userEnrollments.length)
    : 0;

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      plan: user.plan,
      planStatus: user.planStatus,
      streak: user.streak,
    },
    metrics: {
      enrolledCoursesCount: userEnrollments.length,
      completedLessonsCount: totalCompletedLessons,
      certificatesCount: totalCertificates,
      averageProgress,
      streak: user.streak,
    },
    enrolledCourses: enrolledCourseCards,
    upcomingClasses,
    recentQuizzes: userSubmissions,
    certificates: userCertificates,
  });
});
