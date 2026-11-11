import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, AuthenticatedRequest } from '../auth.js';

const router = Router();

// GET /api/analytics
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const interviews = db.getInterviewsByUser(userId);
  const evaluations = db.getEvaluationsByUser(userId);

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;

  let averageScore = 0;
  let highestScore = 0;

  if (evaluations.length > 0) {
    const scores = evaluations.map(e => e.overall_score);
    averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    highestScore = Math.max(...scores);
  }

  // Score progression over time (chronological)
  const progression = evaluations
    .slice()
    .reverse()
    .map((e, idx) => {
      const interview = interviews.find(i => i.id === e.interview_id);
      const dateObj = new Date(e.created_at);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        session: `Session ${idx + 1}`,
        date: formattedDate,
        score: e.overall_score,
        technical: e.technical_score,
        communication: e.communication_score,
        role: interview?.job_role || 'General',
        category: interview?.category || 'Interview',
      };
    });

  // Calculate category averages
  let technicalAvg = 0;
  let relevanceAvg = 0;
  let communicationAvg = 0;
  let problemSolvingAvg = 0;
  let languageAvg = 0;
  let confidenceAvg = 0;

  if (evaluations.length > 0) {
    const n = evaluations.length;
    technicalAvg = Math.round(evaluations.reduce((sum, e) => sum + e.technical_score, 0) / n);
    relevanceAvg = Math.round(evaluations.reduce((sum, e) => sum + e.relevance_score, 0) / n);
    communicationAvg = Math.round(evaluations.reduce((sum, e) => sum + e.communication_score, 0) / n);
    problemSolvingAvg = Math.round(evaluations.reduce((sum, e) => sum + e.problem_solving_score, 0) / n);
    languageAvg = Math.round(evaluations.reduce((sum, e) => sum + e.language_score, 0) / n);
    confidenceAvg = Math.round(evaluations.reduce((sum, e) => sum + e.confidence_score, 0) / n);
  }

  const categoryBreakdown = [
    { category: 'Technical Knowledge', score: technicalAvg, target: 85 },
    { category: 'Answer Relevance', score: relevanceAvg, target: 85 },
    { category: 'Communication', score: communicationAvg, target: 85 },
    { category: 'Problem Solving', score: problemSolvingAvg, target: 85 },
    { category: 'Language & Fluency', score: languageAvg, target: 85 },
    { category: 'Confidence & Clarity', score: confidenceAvg, target: 85 },
  ];

  // Radar chart skills analysis
  const radarData = [
    { subject: 'Technical Depth', candidate: technicalAvg || 70, benchmark: 80 },
    { subject: 'Relevance', candidate: relevanceAvg || 75, benchmark: 80 },
    { subject: 'Communication', candidate: communicationAvg || 72, benchmark: 80 },
    { subject: 'Problem Solving', candidate: problemSolvingAvg || 70, benchmark: 80 },
    { subject: 'Language', candidate: languageAvg || 80, benchmark: 80 },
    { subject: 'Confidence', candidate: confidenceAvg || 74, benchmark: 80 },
  ];

  // Derive strongest & weakest skills
  const sortedCategories = [...categoryBreakdown].sort((a, b) => b.score - a.score);
  const strongestSkill = sortedCategories[0]?.category || 'General Communication';
  const weakestSkill = sortedCategories[sortedCategories.length - 1]?.category || 'Edge-Case System Design';

  // Calculate improvement percentage between first and latest interview
  let improvementPercentage = 0;
  if (evaluations.length >= 2) {
    const firstScore = evaluations[evaluations.length - 1].overall_score;
    const latestScore = evaluations[0].overall_score;
    if (firstScore > 0) {
      improvementPercentage = Math.round(((latestScore - firstScore) / firstScore) * 100);
    }
  }

  // Recommended practice topics aggregated from missing points and recommendations
  const allRecommendedTopics: string[] = [];
  evaluations.forEach(e => {
    (e.recommended_topics || []).forEach(t => {
      if (!allRecommendedTopics.includes(t)) allRecommendedTopics.push(t);
    });
  });

  if (allRecommendedTopics.length === 0) {
    allRecommendedTopics.push(
      'System Architecture: Distributed Caching & Event-Driven Patterns',
      'Database Query Profiling & Index Optimization',
      'Behavioral Storytelling: STAR Executive Communication'
    );
  }

  // Recent activity list
  const recentActivity = interviews.slice(0, 5).map(i => {
    const ev = evaluations.find(e => e.interview_id === i.id);
    return {
      id: i.id,
      job_role: i.job_role,
      category: i.category,
      difficulty: i.difficulty,
      status: i.status,
      date: i.created_at,
      score: ev ? ev.overall_score : null,
    };
  });

  res.json({
    summary: {
      totalInterviews,
      completedInterviews,
      averageScore,
      highestScore,
      improvementPercentage,
      strongestSkill,
      weakestSkill,
    },
    progression,
    categoryBreakdown,
    radarData,
    recommendedTopics: allRecommendedTopics.slice(0, 6),
    recentActivity,
  });
});

export default router;
