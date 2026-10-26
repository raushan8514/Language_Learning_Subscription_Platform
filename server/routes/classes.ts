import { Router, Request, Response } from 'express';
import { db, User, LiveClass } from '../db.ts';
import { authenticate, requireRole } from './auth.ts';

export const classesRouter = Router();

// GET /api/classes - List all upcoming and recent classes
classesRouter.get('/', (req: Request, res: Response) => {
  const classes = db.get('liveClasses');
  const sorted = [...classes].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  return res.json({ classes: sorted });
});

// GET /api/classes/:id - Get details of a single class
classesRouter.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const classes = db.get('liveClasses');
  const found = classes.find(c => c.id === id);
  if (!found) return res.status(404).json({ error: 'Live class not found' });
  return res.json({ liveClass: found });
});

// GET /api/classes/:id/join - Access private meeting link for authorized students
classesRouter.get('/:id/join', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  const classes = db.get('liveClasses');
  const targetClass = classes.find(c => c.id === id);
  if (!targetClass) return res.status(404).json({ error: 'Live class not found' });

  // Check authorization: admin, instructor, or enrolled student
  let isAuthorized = user.role === 'admin' || user.role === 'instructor';
  if (!isAuthorized) {
    if (user.planStatus === 'active' && (user.plan === 'monthly' || user.plan === 'yearly')) {
      isAuthorized = true;
    } else {
      const enrollments = db.get('enrollments');
      const hasEnrollment = enrollments.some(e => e.userId === user.id && e.courseId === targetClass.courseId);
      const isExplicitlyRegistered = targetClass.enrolledStudentIds.includes(user.id);
      isAuthorized = hasEnrollment || isExplicitlyRegistered;
    }
  }

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'Access restricted: You must be enrolled in the course or hold an active Pro plan to enter this live class session.',
    });
  }

  // Auto-register user in attendance list if not already present
  if (!targetClass.enrolledStudentIds.includes(user.id)) {
    db.update('liveClasses', list =>
      list.map(c => (c.id === id ? { ...c, enrolledStudentIds: [...c.enrolledStudentIds, user.id] } : c))
    );
  }

  return res.json({
    authorized: true,
    meetingUrl: targetClass.meetingUrl,
    meetingProvider: targetClass.meetingProvider,
    meetingId: targetClass.meetingId,
    passcode: targetClass.passcode,
    title: targetClass.title,
    instructorName: targetClass.instructorName,
    startTime: targetClass.startTime,
    status: targetClass.status,
  });
});

// POST /api/classes - Schedule a new live class (admin or instructor)
classesRouter.post('/', authenticate, requireRole(['admin', 'instructor']), (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const {
    courseId,
    title,
    description,
    startTime,
    endTime,
    timezone,
    capacity,
    meetingUrl,
    meetingProvider,
    meetingId,
    passcode,
  } = req.body;

  if (!title || !startTime || !meetingUrl) {
    return res.status(400).json({ error: 'Title, start time, and meeting URL are required' });
  }

  const courses = db.get('courses');
  const course = courses.find(c => c.id === courseId) || courses[0];

  const newClass: LiveClass = {
    id: `class_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    courseId: course.id,
    courseTitle: course.title,
    instructorId: user.id,
    instructorName: user.name,
    title: title.trim(),
    description: description ? description.trim() : 'Live interactive speaking and Q&A masterclass.',
    startTime: new Date(startTime).toISOString(),
    endTime: endTime ? new Date(endTime).toISOString() : new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString(),
    timezone: timezone || 'UTC-5 (EST)',
    capacity: capacity ? Number(capacity) : 30,
    enrolledStudentIds: [],
    meetingUrl: meetingUrl.trim(),
    meetingProvider: meetingProvider === 'Google Meet' ? 'Google Meet' : 'Zoom',
    meetingId: meetingId ? String(meetingId).trim() : '482-930-192',
    passcode: passcode ? String(passcode).trim() : 'LingoPro2026',
    status: 'scheduled',
  };

  db.update('liveClasses', list => [...list, newClass]);

  return res.status(201).json({
    message: 'Live class scheduled successfully',
    liveClass: newClass,
  });
});

// PATCH /api/classes/:id - Update class
classesRouter.patch('/:id', authenticate, requireRole(['admin', 'instructor']), (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const classes = db.get('liveClasses');
  const existing = classes.find(c => c.id === id);
  if (!existing) return res.status(404).json({ error: 'Live class not found' });

  db.update('liveClasses', list =>
    list.map(c => (c.id === id ? { ...c, ...updates } : c))
  );

  const updated = db.get('liveClasses').find(c => c.id === id);
  return res.json({ message: 'Live class updated', liveClass: updated });
});

// DELETE /api/classes/:id - Delete class
classesRouter.delete('/:id', authenticate, requireRole(['admin', 'instructor']), (req: Request, res: Response) => {
  const { id } = req.params;
  const classes = db.get('liveClasses');
  const existing = classes.find(c => c.id === id);
  if (!existing) return res.status(404).json({ error: 'Live class not found' });

  db.update('liveClasses', list => list.filter(c => c.id !== id));
  return res.json({ message: 'Live class deleted' });
});
