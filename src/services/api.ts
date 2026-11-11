import {
  User,
  Profile,
  UserSkill,
  UserProject,
  UserCertification,
  Interview,
  InterviewQuestion,
  InterviewAnswer,
  EvaluationReport,
  AnalyticsSummary,
  ProgressionPoint,
  CategoryBreakdown,
  RadarDataPoint,
} from '../types/index.ts';

const TOKEN_KEY = 'ai_mock_interview_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // AUTH
  auth: {
    register: (payload: { email: string; password: string; full_name: string; phone?: string }) =>
      request<{ token: string; user: User; profile: Profile }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    login: (payload: { email: string; password: string }) =>
      request<{ token: string; user: User; profile: Profile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    me: () => request<{ user: User; profile: Profile }>('/api/auth/me'),
    forgotPassword: (email: string) =>
      request<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    updatePassword: (payload: { current_password: string; new_password: string }) =>
      request<{ message: string }>('/api/auth/update-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // PROFILE
  profile: {
    get: () =>
      request<{
        profile: Profile;
        skills: UserSkill[];
        projects: UserProject[];
        certifications: UserCertification[];
      }>('/api/profile'),
    update: (updates: Partial<Profile>) =>
      request<{ profile: Profile }>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return request<{ message: string; avatar_url: string; profile: Profile }>('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
    },
    uploadResume: (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      return request<{
        message: string;
        resume_url: string;
        resume_filename: string;
        extracted_preview: string;
        profile: Profile;
      }>('/api/profile/resume', {
        method: 'POST',
        body: formData,
      });
    },
    addSkill: (payload: { skill_name: string; category?: string; proficiency?: string }) =>
      request<{ skill: UserSkill; all_skills: UserSkill[] }>('/api/profile/skills', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    removeSkill: (id: string) =>
      request<{ success: boolean; all_skills: UserSkill[] }>(`/api/profile/skills/${id}`, {
        method: 'DELETE',
      }),
    addProject: (payload: {
      title: string;
      description: string;
      tech_stack: string[];
      live_url?: string;
      github_url?: string;
    }) =>
      request<{ project: UserProject; all_projects: UserProject[] }>('/api/profile/projects', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    removeProject: (id: string) =>
      request<{ success: boolean; all_projects: UserProject[] }>(`/api/profile/projects/${id}`, {
        method: 'DELETE',
      }),
    addCertification: (payload: {
      title: string;
      issuer: string;
      issue_date?: string;
      credential_url?: string;
    }) =>
      request<{ cert: UserCertification; all_certifications: UserCertification[] }>('/api/profile/certifications', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    removeCertification: (id: string) =>
      request<{ success: boolean; all_certifications: UserCertification[] }>(`/api/profile/certifications/${id}`, {
        method: 'DELETE',
      }),
  },

  // INTERVIEWS
  interviews: {
    list: (params?: { search?: string; category?: string; difficulty?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.category) q.set('category', params.category);
      if (params?.difficulty) q.set('difficulty', params.difficulty);
      if (params?.status) q.set('status', params.status);
      const qs = q.toString();
      return request<{ interviews: Interview[] }>(`/api/interviews${qs ? `?${qs}` : ''}`);
    },
    create: (payload: {
      job_role: string;
      category: string;
      difficulty: string;
      duration_minutes: number;
      answer_mode: 'voice' | 'text';
      programming_language?: string;
      use_profile_skills?: boolean;
      use_uploaded_resume?: boolean;
    }) =>
      request<{ interview: Interview; questions: InterviewQuestion[] }>('/api/interviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getById: (id: string) =>
      request<{
        interview: Interview;
        questions: InterviewQuestion[];
        answers: InterviewAnswer[];
        evaluation: EvaluationReport | null;
      }>(`/api/interviews/${id}`),
    submitAnswer: (
      id: string,
      payload: {
        question_id: string;
        question_index: number;
        answer_text: string;
        answer_mode: 'voice' | 'text';
        duration_seconds: number;
      }
    ) =>
      request<{
        saved_answer: InterviewAnswer;
        next_question_index: number;
        is_last_question: boolean;
        follow_up: string | null;
      }>(`/api/interviews/${id}/answer`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    complete: (id: string) =>
      request<{ interview: Interview; evaluation: EvaluationReport }>(`/api/interviews/${id}/complete`, {
        method: 'POST',
      }),
  },

  // ANALYTICS
  analytics: {
    get: () =>
      request<{
        summary: AnalyticsSummary;
        progression: ProgressionPoint[];
        categoryBreakdown: CategoryBreakdown[];
        radarData: RadarDataPoint[];
        recommendedTopics: string[];
        recentActivity: Array<{
          id: string;
          job_role: string;
          category: string;
          difficulty: string;
          status: string;
          date: string;
          score: number | null;
        }>;
      }>('/api/analytics'),
  },

  // SETTINGS
  settings: {
    get: () => request<{ settings: any }>('/api/settings'),
    save: (payload: any) =>
      request<{ message: string; settings: any }>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    deleteAccount: () =>
      request<{ success: boolean; message: string }>('/api/settings/account', {
        method: 'DELETE',
      }),
  },
};
