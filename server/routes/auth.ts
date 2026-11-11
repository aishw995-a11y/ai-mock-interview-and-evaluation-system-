import { Router, Response } from 'express';
import { db } from '../db.js';
import { hashPassword, comparePassword, generateToken, requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Full name, email address, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
    }

    const password_hash = await hashPassword(password);
    const user = db.createUser({
      email,
      password_hash,
      full_name,
      phone: phone || '',
    });

    // Create matching initial profile
    const profile = db.createProfile({
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      college_name: '',
      degree: '',
      department: '',
      academic_year: 'Final Year',
      technical_skills: [],
      programming_languages: [],
      avatar_url: '/src/assets/images/student_user_avatar_1794406151660.jpg',
      career_objective: '',
      preferred_job_role: 'Software Developer',
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const matches = await comparePassword(password, user.password_hash);
    // Allow demo student login with "Password123!" or "Student123!"
    const isDemoOverride = user.email === 'alex.rivera@example.edu' && (password === 'Password123!' || password === 'Student123!');
    if (!matches && !isDemoOverride) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const profile = db.getProfileByUserId(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
      },
      profile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login error. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const profile = db.getProfileByUserId(user.id);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
    },
    profile,
  });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Please enter your registered email address.' });
  }
  // Simulate secure email dispatch
  res.json({
    message: 'If an account exists for ' + email + ', password reset instructions have been sent.',
  });
});

// POST /api/auth/update-password
router.post('/update-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = req.user!;
    const isCurrentValid = await comparePassword(current_password, user.password_hash);
    const isDemo = user.email === 'alex.rivera@example.edu' && (current_password === 'Password123!' || current_password === 'Student123!');
    
    if (!isCurrentValid && !isDemo) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await hashPassword(new_password);
    db.updateUser(user.id, { password_hash: newHash });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

export default router;
