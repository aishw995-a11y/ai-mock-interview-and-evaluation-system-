import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'interview_db.json');

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
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
  proficiency: string; // 'Beginner' | 'Intermediate' | 'Advanced'
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
  category: string; // 'Technical Interview', 'HR Interview', etc.
  difficulty: string; // 'Beginner', 'Intermediate', 'Advanced'
  duration_minutes: number;
  answer_mode: 'voice' | 'text';
  programming_language?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_question_index: number;
  total_questions: number;
  created_at: string;
  completed_at?: string;
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
  score: number; // 0-100
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

interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  user_skills: UserSkill[];
  user_projects: UserProject[];
  user_certifications: UserCertification[];
  interviews: Interview[];
  interview_questions: InterviewQuestion[];
  interview_answers: InterviewAnswer[];
  evaluation_reports: EvaluationReport[];
}

function getInitialDatabase(): DatabaseSchema {
  return {
    users: [],
    profiles: [],
    user_skills: [],
    user_projects: [],
    user_certifications: [],
    interviews: [],
    interview_questions: [],
    interview_answers: [],
    evaluation_reports: [],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading database file, initializing clean DB:', err);
    }
    const initial = getInitialDatabase();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // Helper ID generator
  public generateId(): string {
    return crypto.randomUUID();
  }

  // USERS
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: this.generateId(),
      ...user,
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveData();
    return this.data.users[index];
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.profiles = this.data.profiles.filter(p => p.user_id !== id);
    this.data.user_skills = this.data.user_skills.filter(s => s.user_id !== id);
    this.data.user_projects = this.data.user_projects.filter(p => p.user_id !== id);
    this.data.user_certifications = this.data.user_certifications.filter(c => c.user_id !== id);
    
    // remove interviews & cascades
    const interviewIds = this.data.interviews.filter(i => i.user_id === id).map(i => i.id);
    this.data.interviews = this.data.interviews.filter(i => i.user_id !== id);
    this.data.interview_questions = this.data.interview_questions.filter(q => !interviewIds.includes(q.interview_id));
    this.data.interview_answers = this.data.interview_answers.filter(a => !interviewIds.includes(a.interview_id));
    this.data.evaluation_reports = this.data.evaluation_reports.filter(r => r.user_id !== id);

    this.saveData();
    return this.data.users.length < initialLen;
  }

  // PROFILES
  public getProfileByUserId(userId: string): Profile | undefined {
    return this.data.profiles.find(p => p.user_id === userId);
  }

  public createProfile(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile {
    const now = new Date().toISOString();
    const newProfile: Profile = {
      id: this.generateId(),
      ...profile,
      created_at: now,
      updated_at: now,
    };
    this.data.profiles.push(newProfile);
    this.saveData();
    return newProfile;
  }

  public updateProfile(userId: string, updates: Partial<Profile>): Profile | null {
    let profile = this.getProfileByUserId(userId);
    const now = new Date().toISOString();
    if (!profile) {
      const user = this.findUserById(userId);
      profile = this.createProfile({
        user_id: userId,
        full_name: user?.full_name || 'Candidate',
        email: user?.email || '',
        phone: user?.phone || '',
        college_name: '',
        degree: '',
        department: '',
        academic_year: 'Final Year',
        technical_skills: [],
        programming_languages: [],
        ...updates,
      });
      return profile;
    }
    const index = this.data.profiles.findIndex(p => p.user_id === userId);
    this.data.profiles[index] = {
      ...this.data.profiles[index],
      ...updates,
      updated_at: now,
    };
    this.saveData();
    return this.data.profiles[index];
  }

  // USER SKILLS
  public getUserSkills(userId: string): UserSkill[] {
    return this.data.user_skills.filter(s => s.user_id === userId);
  }

  public addUserSkill(userId: string, skill_name: string, category: string = 'Technical', proficiency: string = 'Intermediate'): UserSkill {
    const existing = this.data.user_skills.find(s => s.user_id === userId && s.skill_name.toLowerCase() === skill_name.toLowerCase());
    if (existing) {
      existing.proficiency = proficiency;
      this.saveData();
      return existing;
    }
    const newSkill: UserSkill = {
      id: this.generateId(),
      user_id: userId,
      skill_name,
      category,
      proficiency,
      created_at: new Date().toISOString(),
    };
    this.data.user_skills.push(newSkill);
    this.saveData();
    return newSkill;
  }

  public removeUserSkill(id: string, userId: string): boolean {
    const initialLen = this.data.user_skills.length;
    this.data.user_skills = this.data.user_skills.filter(s => !(s.id === id && s.user_id === userId));
    this.saveData();
    return this.data.user_skills.length < initialLen;
  }

  // PROJECTS
  public getUserProjects(userId: string): UserProject[] {
    return this.data.user_projects.filter(p => p.user_id === userId);
  }

  public addUserProject(project: Omit<UserProject, 'id' | 'created_at'>): UserProject {
    const newProject: UserProject = {
      id: this.generateId(),
      ...project,
      created_at: new Date().toISOString(),
    };
    this.data.user_projects.push(newProject);
    this.saveData();
    return newProject;
  }

  public removeUserProject(id: string, userId: string): boolean {
    const initialLen = this.data.user_projects.length;
    this.data.user_projects = this.data.user_projects.filter(p => !(p.id === id && p.user_id === userId));
    this.saveData();
    return this.data.user_projects.length < initialLen;
  }

  // CERTIFICATIONS
  public getUserCertifications(userId: string): UserCertification[] {
    return this.data.user_certifications.filter(c => c.user_id === userId);
  }

  public addUserCertification(cert: Omit<UserCertification, 'id' | 'created_at'>): UserCertification {
    const newCert: UserCertification = {
      id: this.generateId(),
      ...cert,
      created_at: new Date().toISOString(),
    };
    this.data.user_certifications.push(newCert);
    this.saveData();
    return newCert;
  }

  public removeUserCertification(id: string, userId: string): boolean {
    const initialLen = this.data.user_certifications.length;
    this.data.user_certifications = this.data.user_certifications.filter(c => !(c.id === id && c.user_id === userId));
    this.saveData();
    return this.data.user_certifications.length < initialLen;
  }

  // INTERVIEWS
  public getInterviewsByUser(userId: string): Interview[] {
    return this.data.interviews.filter(i => i.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getInterviewById(id: string): Interview | undefined {
    return this.data.interviews.find(i => i.id === id);
  }

  public createInterview(interview: Omit<Interview, 'id' | 'created_at' | 'status' | 'current_question_index'>): Interview {
    const newInterview: Interview = {
      id: this.generateId(),
      ...interview,
      status: 'in_progress',
      current_question_index: 0,
      created_at: new Date().toISOString(),
    };
    this.data.interviews.push(newInterview);
    this.saveData();
    return newInterview;
  }

  public updateInterview(id: string, updates: Partial<Interview>): Interview | null {
    const index = this.data.interviews.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.interviews[index] = {
      ...this.data.interviews[index],
      ...updates,
    };
    this.saveData();
    return this.data.interviews[index];
  }

  // QUESTIONS
  public getQuestionsForInterview(interviewId: string): InterviewQuestion[] {
    return this.data.interview_questions
      .filter(q => q.interview_id === interviewId)
      .sort((a, b) => a.question_index - b.question_index);
  }

  public addQuestionsToInterview(interviewId: string, questions: Array<{ question_text: string; category?: string; rationale?: string }>): InterviewQuestion[] {
    const created: InterviewQuestion[] = [];
    const startIndex = this.getQuestionsForInterview(interviewId).length;
    
    questions.forEach((q, idx) => {
      const item: InterviewQuestion = {
        id: this.generateId(),
        interview_id: interviewId,
        question_index: startIndex + idx,
        question_text: q.question_text,
        category: q.category || 'General',
        rationale: q.rationale || '',
        created_at: new Date().toISOString(),
      };
      this.data.interview_questions.push(item);
      created.push(item);
    });
    this.saveData();
    return created;
  }

  // ANSWERS
  public getAnswersForInterview(interviewId: string): InterviewAnswer[] {
    return this.data.interview_answers
      .filter(a => a.interview_id === interviewId)
      .sort((a, b) => a.question_index - b.question_index);
  }

  public submitAnswer(answer: Omit<InterviewAnswer, 'id' | 'created_at'>): InterviewAnswer {
    // Check if answer for this question already exists and update it, or add new
    const existingIndex = this.data.interview_answers.findIndex(
      a => a.interview_id === answer.interview_id && a.question_index === answer.question_index
    );

    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      this.data.interview_answers[existingIndex] = {
        ...this.data.interview_answers[existingIndex],
        ...answer,
        created_at: now,
      };
      this.saveData();
      return this.data.interview_answers[existingIndex];
    } else {
      const newAnswer: InterviewAnswer = {
        id: this.generateId(),
        ...answer,
        created_at: now,
      };
      this.data.interview_answers.push(newAnswer);
      this.saveData();
      return newAnswer;
    }
  }

  // EVALUATION REPORTS
  public getEvaluationByInterviewId(interviewId: string): EvaluationReport | undefined {
    return this.data.evaluation_reports.find(r => r.interview_id === interviewId);
  }

  public getEvaluationsByUser(userId: string): EvaluationReport[] {
    return this.data.evaluation_reports
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public saveEvaluationReport(report: Omit<EvaluationReport, 'id' | 'created_at'>): EvaluationReport {
    const existingIndex = this.data.evaluation_reports.findIndex(r => r.interview_id === report.interview_id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      this.data.evaluation_reports[existingIndex] = {
        ...this.data.evaluation_reports[existingIndex],
        ...report,
        created_at: now,
      };
      this.saveData();
      return this.data.evaluation_reports[existingIndex];
    } else {
      const newReport: EvaluationReport = {
        id: this.generateId(),
        ...report,
        created_at: now,
      };
      this.data.evaluation_reports.push(newReport);
      this.saveData();
      return newReport;
    }
  }

  // Initial Seed for new installations so students have realistic sample benchmarks
  public seedDemoIfEmpty() {
    if (this.data.users.length > 0) return;

    console.log('Seeding demo student candidate data...');
    // Demo user
    // Password is: "Student123!" (hashed with simple hash or standard bcrypt)
    const salt = '$2a$10$W95mX7P64p2n18Y8Y0c2m.';
    // Standard mock hash
    const password_hash = '$2a$10$dY7F3y/7C2z93e0b8Cg2.eZ2xJbJgQ6u120938481239084712098'; // Fallback
    
    const userId = this.generateId();
    const now = new Date();
    const pastDate1 = new Date(now.getTime() - 4 * 86400000).toISOString();
    const pastDate2 = new Date(now.getTime() - 2 * 86400000).toISOString();

    const user: User = {
      id: userId,
      email: 'alex.rivera@example.edu',
      password_hash: '$2b$10$EPVv6i9Xm8E3d35z0oH5rOmGjP2h6L8kQh8Bf4qJk1W7iY6zGv.Ke', // bcrypt for "Password123!"
      full_name: 'Alex Rivera',
      phone: '+1 (555) 234-5678',
      created_at: pastDate1,
      updated_at: now.toISOString(),
    };
    this.data.users.push(user);

    const profile: Profile = {
      id: this.generateId(),
      user_id: userId,
      full_name: 'Alex Rivera',
      email: 'alex.rivera@example.edu',
      phone: '+1 (555) 234-5678',
      college_name: 'Institute of Technology & Computing',
      degree: 'Bachelor of Science',
      department: 'Computer Science & Engineering',
      academic_year: 'Senior (Final Year)',
      technical_skills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'RESTful APIs', 'Docker', 'Git'],
      programming_languages: ['TypeScript', 'JavaScript', 'Python', 'SQL'],
      avatar_url: '/src/assets/images/student_user_avatar_1794406151660.jpg',
      career_objective: 'Aspiring Full Stack Engineer aiming to architect scalable cloud applications, refine modern distributed systems, and excel in fast-paced software engineering teams.',
      preferred_job_role: 'Full Stack Developer',
      created_at: pastDate1,
      updated_at: now.toISOString(),
    };
    this.data.profiles.push(profile);

    // Skills
    const skillsList = [
      { name: 'React.js', category: 'Frontend', prof: 'Advanced' },
      { name: 'TypeScript', category: 'Language', prof: 'Advanced' },
      { name: 'Node.js', category: 'Backend', prof: 'Intermediate' },
      { name: 'PostgreSQL', category: 'Database', prof: 'Intermediate' },
      { name: 'REST APIs & WebSockets', category: 'Architecture', prof: 'Advanced' },
      { name: 'System Design', category: 'Engineering', prof: 'Intermediate' },
    ];
    skillsList.forEach(s => {
      this.data.user_skills.push({
        id: this.generateId(),
        user_id: userId,
        skill_name: s.name,
        category: s.category,
        proficiency: s.prof,
        created_at: pastDate1,
      });
    });

    // Projects
    this.data.user_projects.push({
      id: this.generateId(),
      user_id: userId,
      title: 'Real-Time Collaborative Code Playground',
      description: 'Engineered a WebRTC & WebSocket powered multi-user browser code editor with syntax highlighting, AST parsing, and sandboxed test execution.',
      tech_stack: ['React', 'TypeScript', 'Node.js', 'WebSockets', 'Tailwind CSS'],
      github_url: 'https://github.com/example/collaborative-editor',
      live_url: 'https://playground-demo.example.com',
      created_at: pastDate1,
    });
    this.data.user_projects.push({
      id: this.generateId(),
      user_id: userId,
      title: 'Microservices Distributed Cache & Rate Limiter',
      description: 'Implemented token-bucket rate limiting and distributed caching with Redis pub/sub and Redis cluster failover resilience.',
      tech_stack: ['Node.js', 'Express', 'Redis', 'Docker'],
      github_url: 'https://github.com/example/rate-limiter-service',
      created_at: pastDate1,
    });

    // Sample completed interview 1
    const interview1Id = this.generateId();
    this.data.interviews.push({
      id: interview1Id,
      user_id: userId,
      job_role: 'Full Stack Developer',
      category: 'Technical Interview',
      difficulty: 'Intermediate',
      duration_minutes: 15,
      answer_mode: 'voice',
      programming_language: 'TypeScript',
      status: 'completed',
      current_question_index: 3,
      total_questions: 3,
      created_at: pastDate1,
      completed_at: pastDate1,
    });

    const q1 = {
      id: this.generateId(),
      interview_id: interview1Id,
      question_index: 0,
      question_text: 'Can you explain the Virtual DOM in React and describe how React 18 handles concurrent batching and hydration?',
      category: 'Frontend Core',
      rationale: 'Tests deep knowledge of React rendering lifecycle and modern concurrency.',
      created_at: pastDate1,
    };
    const q2 = {
      id: this.generateId(),
      interview_id: interview1Id,
      question_index: 1,
      question_text: 'How do you design a database schema and indexing strategy for a high-throughput user activity feed with pagination?',
      category: 'Database & Systems',
      rationale: 'Evaluates practical data modeling and performance bottleneck awareness.',
      created_at: pastDate1,
    };
    const q3 = {
      id: this.generateId(),
      interview_id: interview1Id,
      question_index: 2,
      question_text: 'Describe an instance where you identified and resolved a memory leak or rendering bottleneck in a web application.',
      category: 'Debugging & Performance',
      rationale: 'Verifies real hands-on troubleshooting experience.',
      created_at: pastDate1,
    };
    this.data.interview_questions.push(q1, q2, q3);

    this.data.interview_answers.push(
      {
        id: this.generateId(),
        interview_id: interview1Id,
        question_id: q1.id,
        question_index: 0,
        answer_text: 'The Virtual DOM is an in-memory lightweight JavaScript tree representation of the real DOM. When component state changes, React constructs a new virtual tree, diffs it against the previous tree using a heuristic reconciliation algorithm, and calculates minimal actual DOM mutations. In React 18, automatic batching aggregates state updates across promises, timeouts, and native event handlers into a single render pass, avoiding redundant diffing cycles.',
        answer_mode: 'voice',
        duration_seconds: 78,
        created_at: pastDate1,
      },
      {
        id: this.generateId(),
        interview_id: interview1Id,
        question_id: q2.id,
        question_index: 1,
        answer_text: 'For a high-volume activity feed, I avoid traditional OFFSET/LIMIT pagination because performance degrades as the offset grows. Instead, I use keyset/cursor-based pagination indexing on (user_id, created_at DESC, id). For massive scale, I would separate fan-out on write versus fan-out on read depending on the follower distribution, storing cached precomputed timelines in Redis.',
        answer_mode: 'voice',
        duration_seconds: 92,
        created_at: pastDate1,
      },
      {
        id: this.generateId(),
        interview_id: interview1Id,
        question_id: q3.id,
        question_index: 2,
        answer_text: 'In our real-time editor project, we noticed browser memory growing steadily during long sessions. Using Chrome DevTools Memory Heap Snapshot comparison, we identified unremoved window resize and WebSocket event listeners in custom React hooks that retained closures to stale state. Refactoring them with proper cleanup functions inside useEffect resolved the leak.',
        answer_mode: 'voice',
        duration_seconds: 84,
        created_at: pastDate1,
      }
    );

    this.data.evaluation_reports.push({
      id: this.generateId(),
      interview_id: interview1Id,
      user_id: userId,
      overall_score: 88,
      technical_score: 92,
      relevance_score: 90,
      communication_score: 86,
      problem_solving_score: 87,
      language_score: 88,
      confidence_score: 85,
      strengths: [
        'Precise understanding of React 18 automatic batching and reconciliation mechanics.',
        'Strong database engineering instinct: correctly identified flaws of OFFSET/LIMIT and proposed cursor-based indexing.',
        'Clear, methodical storytelling during real-world debugging scenarios using DevTools snapshots.',
      ],
      weaknesses: [
        'Could have briefly touched on server components (RSC) and selective hydration streaming.',
        'Could have discussed write fan-out costs for celebrity users in activity feed design.',
      ],
      missing_points: [
        'Transition APIs (useTransition / startTransition) for non-urgent render priority.',
        'Database connection pool starvation considerations under high concurrent load.',
      ],
      question_feedback: [
        {
          questionIndex: 0,
          question: q1.question_text,
          answer: 'The Virtual DOM is an in-memory lightweight JavaScript tree...',
          score: 91,
          strengths: 'Clear explanation of diffing reconciliation and automatic batching behavior.',
          improvements: 'Mention React Fiber architecture and concurrency lanes.',
          missingPoints: ['Fiber scheduler priority lanes', 'Suspense boundaries'],
          idealAnswer: 'The Virtual DOM serves as an abstraction layer where React computes tree diffs in user space. React 18 introduces concurrent scheduling via Fiber lanes, enabling non-blocking interrupts, and extends automatic batching to asynchronous boundaries.',
        },
        {
          questionIndex: 1,
          question: q2.question_text,
          answer: 'For a high-volume activity feed, I avoid traditional OFFSET/LIMIT...',
          score: 89,
          strengths: 'Cursor-based pagination reasoning was spot-on.',
          improvements: 'Elaborate on database partitioning or sharding strategies.',
          missingPoints: ['Time-series table partitioning', 'Cache invalidation stampede mitigation'],
          idealAnswer: 'Implement cursor-based pagination backed by composite b-tree index (user_id, created_at DESC, id). Supplement with hybrid fan-out architecture using message queues and distributed caching.',
        },
        {
          questionIndex: 2,
          question: q3.question_text,
          answer: 'In our real-time editor project, we noticed browser memory growing steadily...',
          score: 85,
          strengths: 'Practical use of Chrome DevTools heap snapshots and hook cleanup.',
          improvements: 'Specify retained size metrics or automated profiling in CI.',
          missingPoints: ['Detached DOM nodes profiling', 'WeakMap/WeakRef usage'],
          idealAnswer: 'Utilized allocation timeline and heap snapshot comparisons to trace detached listeners and circular reference closures retained in memory, adding automated leak tests.',
        },
      ],
      improvement_suggestions: [
        'Practice articulating trade-offs between push and pull architectures under peak write conditions.',
        'Incorporate measurable business or latency impacts when recounting past engineering accomplishments.',
      ],
      recommended_topics: [
        'React Fiber Lanes & Concurrent Scheduling',
        'Distributed Cache Consistency & Write-Behind Patterns',
        'Database B-Tree Index Optimization & Query EXPLAIN Plans',
      ],
      created_at: pastDate1,
    });

    // Sample completed interview 2 (HR & Behavioral)
    const interview2Id = this.generateId();
    this.data.interviews.push({
      id: interview2Id,
      user_id: userId,
      job_role: 'Full Stack Developer',
      category: 'HR Interview',
      difficulty: 'Intermediate',
      duration_minutes: 10,
      answer_mode: 'text',
      status: 'completed',
      current_question_index: 2,
      total_questions: 2,
      created_at: pastDate2,
      completed_at: pastDate2,
    });

    const hrQ1 = {
      id: this.generateId(),
      interview_id: interview2Id,
      question_index: 0,
      question_text: 'Tell me about a time you had a technical disagreement with a teammate. How did you handle it and what was the outcome?',
      category: 'Conflict Resolution & Teamwork',
      rationale: 'Evaluates emotional intelligence, constructive communication, and alignment.',
      created_at: pastDate2,
    };
    const hrQ2 = {
      id: this.generateId(),
      interview_id: interview2Id,
      question_index: 1,
      question_text: 'Where do you see yourself professionally in the next 3 to 5 years, and what specific engineering competencies are you focusing on developing?',
      category: 'Career Vision & Growth',
      rationale: 'Assesses career motivation, continuous learning mindset, and self-awareness.',
      created_at: pastDate2,
    };
    this.data.interview_questions.push(hrQ1, hrQ2);

    this.data.interview_answers.push(
      {
        id: this.generateId(),
        interview_id: interview2Id,
        question_id: hrQ1.id,
        question_index: 0,
        answer_text: 'During our capstone project, our backend teammate wanted to build everything in pure Go from scratch, while I advocated for Node.js TypeScript given our tight 8-week timeline and team familiarity. Rather than debating opinions, I created a quick matrix comparing dev velocity, library ecosystem, and deployment overhead, and proposed a prototype. We agreed on Node.js for core services and built a small Go worker for data-heavy tasks. We launched on schedule with high team camaraderie.',
        answer_mode: 'text',
        duration_seconds: 90,
        created_at: pastDate2,
      },
      {
        id: this.generateId(),
        interview_id: interview2Id,
        question_id: hrQ2.id,
        question_index: 1,
        answer_text: 'In the next 3 to 5 years, I aim to grow into a Senior Full Stack Engineer capable of designing resilient distributed systems and mentoring junior developers. Currently, I am actively sharpening my expertise in cloud-native microservices, observability with OpenTelemetry, and advanced SQL optimization.',
        answer_mode: 'text',
        duration_seconds: 65,
        created_at: pastDate2,
      }
    );

    this.data.evaluation_reports.push({
      id: this.generateId(),
      interview_id: interview2Id,
      user_id: userId,
      overall_score: 91,
      technical_score: 88,
      relevance_score: 94,
      communication_score: 93,
      problem_solving_score: 90,
      language_score: 92,
      confidence_score: 89,
      strengths: [
        'Used the STAR (Situation, Task, Action, Result) method effectively in resolving the technical disagreement.',
        'Demonstrated objective decision-making through proof-of-concept prototyping rather than emotional argument.',
        'Clear, realistic 3-5 year growth roadmap with specific technical disciplines mentioned.',
      ],
      weaknesses: [
        'Could mention how feedback was solicited post-launch from the teammate.',
      ],
      missing_points: [
        'Long-term engineering leadership or team mentorship aspirations.',
      ],
      question_feedback: [
        {
          questionIndex: 0,
          question: hrQ1.question_text,
          answer: 'During our capstone project, our backend teammate wanted to build everything...',
          score: 93,
          strengths: 'Excellent focus on data-driven compromise and team unity.',
          improvements: 'Add a sentence on retrospective takeaways.',
          missingPoints: ['Post-mortem reflection'],
          idealAnswer: 'Structured the discussion around team velocity and risk matrices, validated via rapid prototyping, resulting in a hybrid solution that respected both viewpoints.',
        },
        {
          questionIndex: 1,
          question: hrQ2.question_text,
          answer: 'In the next 3 to 5 years, I aim to grow into a Senior Full Stack Engineer...',
          score: 89,
          strengths: 'Actionable focus on specific skills (OpenTelemetry, distributed systems).',
          improvements: 'Connect your growth back to company business impact.',
          missingPoints: ['Organizational business alignment'],
          idealAnswer: 'Articulate a balanced vision covering technical architecture mastery, product impact, and collaborative team stewardship.',
        },
      ],
      improvement_suggestions: [
        'Highlight measurable organizational outcomes when answering behavioral questions.',
      ],
      recommended_topics: [
        'STAR Method Framing for Executive Interviews',
        'Cross-Functional Stakeholder Communication',
        'Engineering Mentorship & Technical Leadership',
      ],
      created_at: pastDate2,
    });

    this.saveData();
    console.log('Demo student candidate successfully seeded!');
  }
}

export const db = new Database();
// Seed demo on startup
db.seedDemoIfEmpty();
