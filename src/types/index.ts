export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  college_name: string;
  degree: string;
  department: string;
  academic_year: string;
  technical_skills: string[];
  programming_languages: string[];
  avatar_url?: string;
  resume_url?: string;
  resume_filename?: string;
  resume_text?: string;
  career_objective?: string;
  preferred_job_role?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_name: string;
  category: string;
  proficiency: string;
  created_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  created_at: string;
}

export interface UserCertification {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date?: string;
  credential_url?: string;
  created_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  job_role: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  answer_mode: 'voice' | 'text';
  programming_language?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_question_index: number;
  total_questions: number;
  created_at: string;
  completed_at?: string;
  overall_score?: number | null;
  evaluation_id?: string | null;
}

export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question_index: number;
  question_text: string;
  category?: string;
  rationale?: string;
  created_at: string;
}

export interface InterviewAnswer {
  id: string;
  interview_id: string;
  question_id: string;
  question_index: number;
  answer_text: string;
  answer_mode: 'voice' | 'text';
  duration_seconds: number;
  audio_url?: string;
  created_at: string;
}

export interface QuestionFeedbackItem {
  questionIndex: number;
  question: string;
  answer: string;
  score: number;
  strengths: string;
  improvements: string;
  missingPoints: string[];
  idealAnswer: string;
}

export interface EvaluationReport {
  id: string;
  interview_id: string;
  user_id: string;
  overall_score: number;
  technical_score: number;
  relevance_score: number;
  communication_score: number;
  problem_solving_score: number;
  language_score: number;
  confidence_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_points: string[];
  question_feedback: QuestionFeedbackItem[];
  improvement_suggestions: string[];
  recommended_topics: string[];
  created_at: string;
}

export interface AnalyticsSummary {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  highestScore: number;
  improvementPercentage: number;
  strongestSkill: string;
  weakestSkill: string;
}

export interface ProgressionPoint {
  session: string;
  date: string;
  score: number;
  technical: number;
  communication: number;
  role: string;
  category: string;
}

export interface CategoryBreakdown {
  category: string;
  score: number;
  target: number;
}

export interface RadarDataPoint {
  subject: string;
  candidate: number;
  benchmark: number;
}
