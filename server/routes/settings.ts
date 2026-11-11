import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// In-memory/persisted user settings cache
interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  micSensitivity: number;
  autoPlayAudio: boolean;
  emailNotifications: boolean;
  interviewReminders: boolean;
  privacyShowScoreInLeaderboard: boolean;
}

const settingsMap = new Map<string, UserSettings>();

function getDefaultSettings(userId: string): UserSettings {
  return {
    userId,
    theme: 'light',
    micSensitivity: 80,
    autoPlayAudio: true,
    emailNotifications: true,
    interviewReminders: true,
    privacyShowScoreInLeaderboard: false,
  };
}

// GET /api/settings
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const current = settingsMap.get(userId) || getDefaultSettings(userId);
  res.json({ settings: current });
});

// POST /api/settings
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const current = settingsMap.get(userId) || getDefaultSettings(userId);
  const updated: UserSettings = {
    ...current,
    ...req.body,
    userId,
  };
  settingsMap.set(userId, updated);
  res.json({ message: 'Settings saved successfully.', settings: updated });
});

// DELETE /api/settings/account - Delete user account
router.delete('/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const success = db.deleteUser(userId);
  settingsMap.delete(userId);
  res.json({ success, message: 'Account and all associated interview data have been permanently deleted.' });
});

export default router;
