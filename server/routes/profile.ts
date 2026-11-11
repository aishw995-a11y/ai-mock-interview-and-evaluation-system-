import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Uploads directories setup
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');
const AVATARS_DIR = path.join(UPLOADS_ROOT, 'avatars');
const RESUMES_DIR = path.join(UPLOADS_ROOT, 'resumes');

[UPLOADS_ROOT, AVATARS_DIR, RESUMES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage for avatars
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATARS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

// Multer storage for resumes
const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, RESUMES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    cb(null, `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed.'));
    }
  },
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Simple text extractor for uploaded files
function extractTextFromFile(filePath: string, originalName: string): string {
  try {
    const buffer = fs.readFileSync(filePath);
    // If text file or markdown, read directly
    if (originalName.endsWith('.txt') || originalName.endsWith('.md')) {
      return buffer.toString('utf-8');
    }
    // For PDFs, extract printable text sequences from buffer
    const rawString = buffer.toString('latin1');
    const matches = rawString.match(/[A-Za-z0-9,.:;()/'" -]{4,}/g);
    if (matches && matches.length > 0) {
      return matches.join(' ').slice(0, 8000);
    }
    return `Uploaded Resume: ${originalName} (Processed text summary)`;
  } catch (err) {
    console.error('Error extracting resume text:', err);
    return `Resume: ${originalName}`;
  }
}

// GET /api/profile
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  let profile = db.getProfileByUserId(userId);
  if (!profile) {
    profile = db.createProfile({
      user_id: userId,
      full_name: req.user?.full_name || 'Candidate',
      email: req.user?.email || '',
      phone: req.user?.phone || '',
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
  }

  const skills = db.getUserSkills(userId);
  const projects = db.getUserProjects(userId);
  const certifications = db.getUserCertifications(userId);

  res.json({
    profile,
    skills,
    projects,
    certifications,
  });
});

// PUT /api/profile
router.put('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const updates = req.body;

  // Protect sensitive fields from arbitrary override
  delete updates.id;
  delete updates.user_id;
  delete updates.created_at;

  const updatedProfile = db.updateProfile(userId, updates);
  if (updates.full_name && req.user) {
    db.updateUser(userId, { full_name: updates.full_name, phone: updates.phone });
  }

  res.json({ profile: updatedProfile });
});

// POST /api/profile/avatar
router.post('/avatar', requireAuth, uploadAvatar.single('avatar'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please choose an image file to upload.' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = db.updateProfile(req.userId!, { avatar_url: avatarUrl });

    res.json({
      message: 'Profile picture uploaded successfully.',
      avatar_url: avatarUrl,
      profile: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload profile picture.' });
  }
});

// POST /api/profile/resume
router.post('/resume', requireAuth, uploadResume.single('resume'), (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file (PDF or text document).' });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const extractedText = extractTextFromFile(req.file.path, req.file.originalname);

    const updated = db.updateProfile(req.userId!, {
      resume_url: resumeUrl,
      resume_filename: req.file.originalname,
      resume_text: extractedText,
    });

    res.json({
      message: 'Resume parsed and uploaded successfully.',
      resume_url: resumeUrl,
      resume_filename: req.file.originalname,
      extracted_preview: extractedText.slice(0, 300) + '...',
      profile: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process resume.' });
  }
});

// SKILLS CRUD
router.post('/skills', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { skill_name, category, proficiency } = req.body;
  if (!skill_name) {
    return res.status(400).json({ error: 'Skill name is required.' });
  }
  const skill = db.addUserSkill(req.userId!, skill_name.trim(), category || 'Technical', proficiency || 'Intermediate');
  
  // Also sync to profile array
  const currentSkills = db.getUserSkills(req.userId!).map(s => s.skill_name);
  db.updateProfile(req.userId!, { technical_skills: currentSkills });

  res.status(201).json({ skill, all_skills: db.getUserSkills(req.userId!) });
});

router.delete('/skills/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.removeUserSkill(req.params.id, req.userId!);
  const currentSkills = db.getUserSkills(req.userId!).map(s => s.skill_name);
  db.updateProfile(req.userId!, { technical_skills: currentSkills });
  res.json({ success: true, all_skills: db.getUserSkills(req.userId!) });
});

// PROJECTS CRUD
router.post('/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title, description, tech_stack, live_url, github_url } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required.' });
  }
  const project = db.addUserProject({
    user_id: req.userId!,
    title: title.trim(),
    description: description || '',
    tech_stack: Array.isArray(tech_stack) ? tech_stack : (typeof tech_stack === 'string' ? tech_stack.split(',').map(s => s.trim()) : []),
    live_url,
    github_url,
  });
  res.status(201).json({ project, all_projects: db.getUserProjects(req.userId!) });
});

router.delete('/projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.removeUserProject(req.params.id, req.userId!);
  res.json({ success: true, all_projects: db.getUserProjects(req.userId!) });
});

// CERTIFICATIONS CRUD
router.post('/certifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title, issuer, issue_date, credential_url } = req.body;
  if (!title || !issuer) {
    return res.status(400).json({ error: 'Title and issuing organization are required.' });
  }
  const cert = db.addUserCertification({
    user_id: req.userId!,
    title: title.trim(),
    issuer: issuer.trim(),
    issue_date,
    credential_url,
  });
  res.status(201).json({ cert, all_certifications: db.getUserCertifications(req.userId!) });
});

router.delete('/certifications/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.removeUserCertification(req.params.id, req.userId!);
  res.json({ success: true, all_certifications: db.getUserCertifications(req.userId!) });
});

export default router;
