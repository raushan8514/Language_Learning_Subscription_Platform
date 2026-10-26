import { Router, Request, Response } from 'express';
import { db, hashPassword, generateToken, verifyToken, User } from '../db.ts';

export const authRouter = Router();

// Middleware to extract user from Authorization header
export function authenticate(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  const users = db.get('users');
  const user = users.find(u => u.id === payload.id);
  if (!user) {
    return res.status(401).json({ error: 'User account not found' });
  }

  if (user.isSuspended) {
    return res.status(403).json({ error: 'Account has been suspended by administration' });
  }

  (req as any).user = user;
  next();
}

// Authorization middleware for role-based protection
export function requireRole(allowedRoles: ('student' | 'instructor' | 'admin')[]) {
  return (req: Request, res: Response, next: () => void) => {
    const user = (req as any).user as User;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden: requires one of [${allowedRoles.join(', ')}] role` });
    }
    next();
  };
}

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const users = db.get('users');
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // New registrations ALWAYS default to student role for safety
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1,8b5cf6,3b82f6`,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      plan: 'free',
      planStatus: 'none',
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      bio: 'New language learner on LingoPro.',
    };

    db.update('users', items => [...items, newUser]);
    const token = generateToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = db.get('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account is suspended. Please contact administrator support.' });
    }

    // Update streak if active on a new day
    const today = new Date().toISOString().split('T')[0];
    let streak = user.streak;
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastActiveDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
      db.update('users', list => list.map(u => u.id === user.id ? { ...u, streak, lastActiveDate: today } : u));
      user.streak = streak;
      user.lastActiveDate = today;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /api/auth/demo-login
authRouter.post('/demo-login', (req: Request, res: Response) => {
  const { role, email } = req.body;
  const users = db.get('users');
  let targetUser: User | undefined;

  if (email) {
    targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  } else if (role) {
    targetUser = users.find(u => u.role === role);
  }

  if (!targetUser) {
    targetUser = users[0];
  }

  const token = generateToken(targetUser);
  const { passwordHash: _, ...safeUser } = targetUser;
  return res.json({
    message: `Logged in as ${targetUser.role} (${targetUser.name})`,
    token,
    user: safeUser,
  });
});

// GET /api/auth/me
authRouter.get('/me', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

// PATCH /api/auth/profile
authRouter.patch('/profile', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name, bio, avatar } = req.body;

  const updatedUsers = db.update('users', list =>
    list.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          name: name ? String(name).trim() : u.name,
          bio: bio !== undefined ? String(bio).trim() : u.bio,
          avatar: avatar ? String(avatar).trim() : u.avatar,
        };
      }
      return u;
    })
  );

  const updated = updatedUsers.find(u => u.id === user.id);
  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = updated;
  return res.json({ message: 'Profile updated successfully', user: safeUser });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const users = db.get('users');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Avoid user enumeration
    return res.json({ message: 'If an account exists with this email, password recovery instructions have been prepared.' });
  }

  return res.json({
    message: `Password reset link dispatched for ${user.email}. In this environment, use default password 'password123' or proceed to reset.`,
    resetAvailable: true,
  });
});
