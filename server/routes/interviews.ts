import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { generateInterviewQuestions, generateFollowUpQuestion, evaluateInterviewAnswers } from '../ai.js';

const router = Router();

// GET /api/interviews - List user's interviews
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  let interviews = db.getInterviewsByUser(userId);

  const { search, category, difficulty, status } = req.query;

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    interviews = interviews.filter(
      i => i.job_role.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    interviews = interviews.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
    interviews = interviews.filter(i => i.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (status && typeof status === 'string' && status !== 'all') {
    interviews = interviews.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }

  // Attach evaluation score overview to each interview
  const results = interviews.map(i => {
    const evalReport = db.getEvaluationByInterviewId(i.id);
    return {
      ...i,
      overall_score: evalReport ? evalReport.overall_score : null,
      evaluation_id: evalReport ? evalReport.id : null,
    };
  });

  res.json({ interviews: results });
});

// POST /api/interviews - Start/configure new interview
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      job_role,
      category,
      difficulty,
      duration_minutes,
      answer_mode,
      programming_language,
      use_profile_skills,
      use_uploaded_resume,
    } = req.body;

    if (!job_role || !category) {
      return res.status(400).json({ error: 'Job role and interview category are required.' });
    }

    const duration = parseInt(duration_minutes, 10) || 15;
    const mode = answer_mode === 'voice' ? 'voice' : 'text';
    const diff = difficulty || 'Intermediate';

    // Retrieve candidate profile context if opted in
    const profile = db.getProfileByUserId(userId);
    let skillsForPrompt: string[] = [];
    let resumeTextForPrompt: string | undefined;

    if (use_profile_skills !== false && profile) {
      skillsForPrompt = profile.technical_skills || [];
    }

    if (use_uploaded_resume !== false && profile?.resume_text) {
      resumeTextForPrompt = profile.resume_text;
    }

    // Call AI to generate customized interview questions
    const generatedQuestions = await generateInterviewQuestions({
      jobRole: job_role,
      category,
      difficulty: diff,
      durationMinutes: duration,
      skills: skillsForPrompt,
      resumeText: resumeTextForPrompt,
      programmingLanguage: programming_language,
    });

    // Create interview record
    const interview = db.createInterview({
      user_id: userId,
      job_role,
      category,
      difficulty: diff,
      duration_minutes: duration,
      answer_mode: mode,
      programming_language: programming_language || '',
      total_questions: generatedQuestions.length,
    });

    // Save questions in db
    const questions = db.addQuestionsToInterview(
      interview.id,
      generatedQuestions.map(q => ({
        question_text: q.question_text,
        category: q.category,
        rationale: q.rationale,
      }))
    );

    res.status(201).json({
      interview,
      questions,
    });
  } catch (err: any) {
    console.error('Failed to create interview:', err);
    res.status(500).json({ error: 'Failed to initialize interview. Please try again.' });
  }
});

// GET /api/interviews/:id - Fetch single interview session
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const interview = db.getInterviewById(req.params.id);
  if (!interview) {
    return res.status(404).json({ error: 'Interview session not found.' });
  }

  // Row Level Security check
  if (interview.user_id !== req.userId!) {
    return res.status(403).json({ error: 'Access denied to this interview session.' });
  }

  const questions = db.getQuestionsForInterview(interview.id);
  const answers = db.getAnswersForInterview(interview.id);
  const evaluation = db.getEvaluationByInterviewId(interview.id);

  res.json({
    interview,
    questions,
    answers,
    evaluation: evaluation || null,
  });
});

// POST /api/interviews/:id/answer - Submit answer for a question
router.post('/:id/answer', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = db.getInterviewById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    if (interview.user_id !== req.userId!) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { question_id, question_index, answer_text, answer_mode, duration_seconds } = req.body;
    if (question_index === undefined || !answer_text) {
      return res.status(400).json({ error: 'Question index and answer text are required.' });
    }

    // Save answer
    const savedAnswer = db.submitAnswer({
      interview_id: interview.id,
      question_id: question_id || '',
      question_index: parseInt(question_index, 10),
      answer_text: answer_text.trim(),
      answer_mode: answer_mode === 'voice' ? 'voice' : 'text',
      duration_seconds: parseInt(duration_seconds, 10) || 0,
    });

    // Update current question index progress
    const nextIndex = Math.max(interview.current_question_index, parseInt(question_index, 10) + 1);
    db.updateInterview(interview.id, { current_question_index: nextIndex });

    // Optional follow-up check (only if answer is rich and questions remain)
    const questions = db.getQuestionsForInterview(interview.id);
    const currQ = questions.find(q => q.question_index === parseInt(question_index, 10));
    let followUp: string | null = null;
    if (currQ && answer_text.length > 80 && Math.random() > 0.6) {
      followUp = await generateFollowUpQuestion({
        jobRole: interview.job_role,
        currentQuestion: currQ.question_text,
        candidateAnswer: answer_text,
      });
    }

    res.json({
      saved_answer: savedAnswer,
      next_question_index: nextIndex,
      is_last_question: nextIndex >= questions.length,
      follow_up: followUp,
    });
  } catch (err: any) {
    console.error('Submit answer error:', err);
    res.status(500).json({ error: 'Failed to record answer.' });
  }
});

// POST /api/interviews/:id/complete - Conclude interview and run AI evaluation
router.post('/:id/complete', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const interview = db.getInterviewById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: 'Interview session not found.' });
    }

    if (interview.user_id !== req.userId!) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const questions = db.getQuestionsForInterview(interview.id);
    const answers = db.getAnswersForInterview(interview.id);

    // Run AI Evaluation
    const evaluation = await evaluateInterviewAnswers({
      jobRole: interview.job_role,
      category: interview.category,
      difficulty: interview.difficulty,
      questions: questions.map(q => ({ index: q.question_index, text: q.question_text, category: q.category })),
      answers: answers.map(a => ({ index: a.question_index, text: a.answer_text, mode: a.answer_mode, duration: a.duration_seconds })),
    });

    // Save evaluation report
    const savedReport = db.saveEvaluationReport({
      interview_id: interview.id,
      user_id: interview.user_id,
      overall_score: evaluation.overall_score,
      technical_score: evaluation.technical_score,
      relevance_score: evaluation.relevance_score,
      communication_score: evaluation.communication_score,
      problem_solving_score: evaluation.problem_solving_score,
      language_score: evaluation.language_score,
      confidence_score: evaluation.confidence_score,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      missing_points: evaluation.missing_points,
      question_feedback: evaluation.question_feedback,
      improvement_suggestions: evaluation.improvement_suggestions,
      recommended_topics: evaluation.recommended_topics,
    });

    // Mark interview completed
    db.updateInterview(interview.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    res.json({
      interview: db.getInterviewById(interview.id),
      evaluation: savedReport,
    });
  } catch (err: any) {
    console.error('Complete interview evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate interview answers. Please try again.' });
  }
});

export default router;
