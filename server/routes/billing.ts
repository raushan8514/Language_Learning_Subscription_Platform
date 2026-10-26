import { Router, Request, Response } from 'express';
import { db, User, PaymentTransaction, Enrollment } from '../db.ts';
import { authenticate } from './auth.ts';

export const billingRouter = Router();

// GET /api/billing/plans
billingRouter.get('/plans', (req: Request, res: Response) => {
  return res.json({
    plans: [
      {
        id: 'plan_free',
        name: 'Starter',
        price: 0,
        billingCycle: 'free',
        description: 'Ideal for trying out foundational lessons in any language.',
        features: [
          'Access to all introductory A1 preview lessons',
          'Basic interactive vocabulary drills',
          'Standard community forum access',
          'Self-paced learning pace'
        ],
        highlighted: false,
        buttonText: 'Current Basic Plan'
      },
      {
        id: 'plan_monthly',
        name: 'Pro Monthly',
        price: 29,
        billingCycle: 'monthly',
        description: 'Complete fluency path across all 8 languages with live speaking.',
        features: [
          'Unlimited access to all courses (A1 through C1)',
          'All interactive quizzes with instant grading',
          'Join unlimited weekly live classes (Zoom & Meet)',
          'Official verified certificates of achievement',
          'Downloadable audio dialogues & vocabulary decks',
          'Native pronunciation playback drills'
        ],
        highlighted: true,
        buttonText: 'Start Pro Monthly'
      },
      {
        id: 'plan_yearly',
        name: 'Pro Annual',
        price: 249,
        billingCycle: 'yearly',
        description: 'Best value for serious polyglots. Save 30% annually.',
        features: [
          'Everything in Pro Monthly included',
          'Save $99 compared to monthly billing ($20.75/month)',
          'Priority seat reservation in live masterclasses',
          'Downloadable course packs for offline learning',
          'Direct instructor Q&A messaging',
          'Verified LinkedIn credentials'
        ],
        highlighted: false,
        badge: 'Save 30%',
        buttonText: 'Start Pro Annual'
      }
    ]
  });
});

// POST /api/billing/checkout
billingRouter.post('/checkout', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { type, plan, courseId, cardNumber, cardExpiry, cardCvc, nameOnCard } = req.body;

  if (type === 'plan_subscription') {
    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      return res.status(400).json({ error: 'Valid plan (monthly or yearly) is required' });
    }

    const price = plan === 'monthly' ? 29 : 249;

    // Simulate verified transaction
    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      type: 'plan_subscription',
      plan,
      amount: price,
      currency: 'USD',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };

    db.update('transactions', list => [...list, newTx]);

    // Update user plan
    db.update('users', list =>
      list.map(u => (u.id === user.id ? { ...u, plan, planStatus: 'active' } : u))
    );

    const updatedUser = db.get('users').find(u => u.id === user.id);
    const { passwordHash: _, ...safeUser } = updatedUser!;

    return res.status(200).json({
      message: `Successfully upgraded to ${plan === 'monthly' ? 'Pro Monthly' : 'Pro Annual'}!`,
      transaction: newTx,
      user: safeUser,
    });
  } else if (type === 'course_purchase') {
    if (!courseId) return res.status(400).json({ error: 'courseId is required' });
    const courses = db.get('courses');
    const course = courses.find(c => c.id === courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      type: 'course_purchase',
      courseId,
      amount: course.price,
      currency: 'USD',
      status: 'succeeded',
      createdAt: new Date().toISOString(),
    };

    db.update('transactions', list => [...list, newTx]);

    // Enroll student
    const enrollments = db.get('enrollments');
    const existing = enrollments.find(e => e.userId === user.id && e.courseId === courseId);
    if (!existing) {
      const sections = db.get('sections').filter(s => s.courseId === course.id);
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
    }

    return res.status(200).json({
      message: `Course purchase verified. You are now enrolled in ${course.title}.`,
      transaction: newTx,
    });
  }

  return res.status(400).json({ error: 'Invalid checkout type' });
});

// POST /api/billing/cancel
billingRouter.post('/cancel', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  db.update('users', list =>
    list.map(u => (u.id === user.id ? { ...u, planStatus: 'cancelled' } : u))
  );

  return res.json({ message: 'Subscription marked as cancelled at period end.' });
});

// GET /api/billing/invoices
billingRouter.get('/invoices', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const txs = db.get('transactions').filter(t => t.userId === user.id);
  return res.json({ transactions: txs });
});
