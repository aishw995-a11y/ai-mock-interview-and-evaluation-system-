-- AI Mock Interview and Evaluation System
-- PostgreSQL & Supabase Database Schema
-- Includes Row Level Security (RLS) policies and relational constraints

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users or custom users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college_name TEXT,
    degree TEXT,
    department TEXT,
    academic_year TEXT,
    technical_skills TEXT[] DEFAULT '{}',
    programming_languages TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    resume_url TEXT,
    resume_filename TEXT,
    resume_text TEXT,
    career_objective TEXT,
    preferred_job_role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USER SKILLS
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    category TEXT DEFAULT 'technical',
    proficiency TEXT DEFAULT 'Intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. USER PROJECTS
CREATE TABLE IF NOT EXISTS public.user_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    live_url TEXT,
    github_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. USER CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.user_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE,
    credential_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    job_role TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Technical Interview', 'HR Interview', etc.
    difficulty TEXT NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
    duration_minutes INTEGER NOT NULL DEFAULT 15,
    answer_mode TEXT NOT NULL DEFAULT 'voice', -- 'voice' or 'text'
    programming_language TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    current_question_index INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. INTERVIEW QUESTIONS
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INTERVIEW ANSWERS
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE SET NULL,
    question_index INTEGER NOT NULL,
    answer_text TEXT NOT NULL,
    answer_mode TEXT NOT NULL DEFAULT 'text',
    duration_seconds INTEGER DEFAULT 0,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. EVALUATION REPORTS
CREATE TABLE IF NOT EXISTS public.evaluation_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL UNIQUE REFERENCES public.interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    overall_score NUMERIC(5,2) NOT NULL,
    technical_score NUMERIC(5,2) NOT NULL,
    relevance_score NUMERIC(5,2) NOT NULL,
    communication_score NUMERIC(5,2) NOT NULL,
    problem_solving_score NUMERIC(5,2) NOT NULL,
    language_score NUMERIC(5,2) NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    missing_points JSONB DEFAULT '[]'::jsonb,
    question_feedback JSONB DEFAULT '[]'::jsonb,
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,
    recommended_topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interviews(status);
CREATE INDEX IF NOT EXISTS idx_questions_interview ON public.interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_answers_interview ON public.interview_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user ON public.evaluation_reports(user_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Interviews: Users can access their own interviews
CREATE POLICY "Users can manage own interviews" ON public.interviews
    FOR ALL USING (auth.uid() = user_id);

-- Questions: Users can view questions belonging to their interviews
CREATE POLICY "Users can access own interview questions" ON public.interview_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.interviews
            WHERE public.interviews.id = public.interview_questions.interview_id
            AND public.interviews.user_id = auth.uid()
        )
    );

-- Answers: Users can manage answers to their own interviews
CREATE POLICY "Users can manage own interview answers" ON public.interview_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.interviews
            WHERE public.interviews.id = public.interview_answers.interview_id
            AND public.interviews.user_id = auth.uid()
        )
    );

-- Evaluation Reports: Users can read their own evaluation reports
CREATE POLICY "Users can view own evaluations" ON public.evaluation_reports
    FOR ALL USING (auth.uid() = user_id);
