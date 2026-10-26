import { Router, Request, Response } from 'express';
import { db, verifyToken, User, Course, Section, Lesson } from '../db.ts';

export const coursesRouter = Router();

// Helper to optionally get user if Authorization header is present
function getOptionalUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return null;
  const users = db.get('users');
  return users.find(u => u.id === payload.id) || null;
}

// GET /api/courses - Public course catalog
coursesRouter.get('/', (req: Request, res: Response) => {
  const courses = db.get('courses');
  const sections = db.get('sections');

  // Filter to published courses for public visitors
  const user = getOptionalUser(req);
  const isAdmin = user && (user.role === 'admin' || user.role === 'instructor');

  let list = isAdmin ? courses : courses.filter(c => c.isPublished);

  // Search query
  const query = (req.query.q as string || '').toLowerCase().trim();
  if (query) {
    list = list.filter(c =>
      c.title.toLowerCase().includes(query) ||
      c.subtitle.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.language.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  }

  // Language filter
  const language = (req.query.language as string || '').trim();
  if (language && language !== 'All') {
    list = list.filter(c => c.language.toLowerCase() === language.toLowerCase());
  }

  // Level filter
  const level = (req.query.level as string || '').trim();
  if (level && level !== 'All') {
    list = list.filter(c => c.level.toLowerCase().startsWith(level.toLowerCase()));
  }

  // Category filter
  const category = (req.query.category as string || '').trim();
  if (category && category !== 'All') {
    list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  // Price filter
  const priceType = req.query.priceType as string;
  if (priceType === 'free') {
    list = list.filter(c => c.isFree || c.price === 0);
  } else if (priceType === 'paid') {
    list = list.filter(c => !c.isFree && c.price > 0);
  }

  // Sort
  const sort = req.query.sort as string;
  if (sort === 'popular') {
    list.sort((a, b) => b.totalReviews - a.totalReviews);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else {
    // Default newest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Enrich with lesson and section counts
  const enriched = list.map(c => {
    const courseSections = sections.filter(s => s.courseId === c.id);
    const totalLessons = courseSections.reduce((acc, s) => acc + s.lessons.length, 0);
    return {
      ...c,
      totalSections: courseSections.length,
      totalLessons,
    };
  });

  return res.json({ courses: enriched });
});

// GET /api/courses/languages
coursesRouter.get('/meta/languages', (req: Request, res: Response) => {
  const courses = db.get('courses');
  const languages = Array.from(new Set(courses.map(c => c.language)));
  const categories = Array.from(new Set(courses.map(c => c.category)));
  const levels = ['A1 Beginner', 'A2 Elementary', 'B1 Intermediate', 'B2 Upper-Intermediate', 'C1 Advanced'];
  return res.json({ languages, categories, levels });
});

// GET /api/courses/:slug - Detailed public course page
coursesRouter.get('/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const courses = db.get('courses');
  const sections = db.get('sections');
  const user = getOptionalUser(req);
  const enrollments = db.get('enrollments');

  const course = courses.find(c => c.slug === slug || c.id === slug);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'instructor');
  if (!course.isPublished && !isAdmin) {
    return res.status(404).json({ error: 'Course not published or unavailable' });
  }

  // Check enrollment status of user
  let isEnrolled = false;
  let userProgress = null;
  if (user) {
    const userEnrollment = enrollments.find(e => e.userId === user.id && e.courseId === course.id);
    if (userEnrollment) {
      isEnrolled = true;
      userProgress = userEnrollment;
    } else if (user.planStatus === 'active' && (user.plan === 'monthly' || user.plan === 'yearly')) {
      // Pro members have all-access
      isEnrolled = true;
    } else if (isAdmin) {
      isEnrolled = true;
    }
  }

  // Sanitize curriculum preview for un-enrolled students
  const courseSections = sections
    .filter(s => s.courseId === course.id)
    .sort((a, b) => a.order - b.order)
    .map(s => ({
      ...s,
      lessons: s.lessons
        .sort((a, b) => a.order - b.order)
        .map(lesson => {
          // If user is not enrolled and this is not a preview lesson, strip protected content
          if (!isEnrolled && !lesson.isPreview) {
            const { content: _c, dialogue: _d, vocabulary: _v, downloadableResources: _r, videoUrl: _u, ...cleanLesson } = lesson;
            return {
              ...cleanLesson,
              isLocked: true,
            };
          }
          return {
            ...lesson,
            isLocked: false,
          };
        }),
    }));

  const totalLessons = courseSections.reduce((acc, s) => acc + s.lessons.length, 0);

  return res.json({
    course: {
      ...course,
      totalLessons,
      totalSections: courseSections.length,
    },
    sections: courseSections,
    isEnrolled,
    userProgress,
  });
});
