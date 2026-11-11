import React, { useState, useRef } from 'react';
import {
  Briefcase,
  Layers,
  Gauge,
  Clock,
  Mic,
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

interface InterviewConfigProps {
  onInterviewStarted: (interviewId: string) => void;
  onCancel?: () => void;
}

export const InterviewConfigModal: React.FC<InterviewConfigProps> = ({
  onInterviewStarted,
  onCancel,
}) => {
  const { profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [category, setCategory] = useState<string>('Technical Interview');
  const [jobRole, setJobRole] = useState<string>(profile?.preferred_job_role || 'Full Stack Developer');
  const [customRole, setCustomRole] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('Intermediate');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [answerMode, setAnswerMode] = useState<'voice' | 'text'>('voice');
  const [programmingLanguage, setProgrammingLanguage] = useState<string>('TypeScript');
  const [useProfileSkills, setUseProfileSkills] = useState<boolean>(true);
  const [useUploadedResume, setUseUploadedResume] = useState<boolean>(true);

  // Resume upload state
  const [isUploadingResume, setIsUploadingResume] = useState<boolean>(false);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState<string | null>(null);

  // Loading state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    { id: 'Technical Interview', label: 'Technical Interview', desc: 'Architecture, system design, coding paradigms, debugging' },
    { id: 'HR Interview', label: 'HR & Cultural Fit', desc: 'Career goals, team chemistry, conflict resolution, values' },
    { id: 'Behavioral Interview', label: 'Behavioral (STAR)', desc: 'Situational judgment, leadership, overcoming setbacks' },
    { id: 'Communication Skills', label: 'Communication Skills', desc: 'Articulation, technical storytelling, executive summaries' },
    { id: 'Programming Interview', label: 'Programming & Logic', desc: 'Algorithms, data structures, edge cases, language syntax' },
  ];

  const standardRoles = [
    'Software Developer',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Data Analyst',
    'AI/ML Engineer',
    'Python Developer',
    'Java Developer',
    'Custom Role',
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const durations = [5, 10, 15, 30];
  const languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'SQL', 'Rust'];

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setIsUploadingResume(true);
      setErrorMsg(null);
      const res = await api.profile.uploadResume(file);
      setResumeUploadSuccess(res.resume_filename);
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload resume.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const finalRole = jobRole === 'Custom Role' ? customRole.trim() : jobRole;
    if (!finalRole) {
      setErrorMsg('Please enter or select a job role.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.interviews.create({
        job_role: finalRole,
        category,
        difficulty,
        duration_minutes: durationMinutes,
        answer_mode: answerMode,
        programming_language: programmingLanguage,
        use_profile_skills: useProfileSkills,
        use_uploaded_resume: useUploadedResume,
      });

      onInterviewStarted(res.interview.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate interview. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Simulation Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Configure Your Mock Interview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Customize your role, difficulty level, and conversational mode. Our AI interviewer will formulate tailored questions designed to challenge and sharpen your responses.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Interview Category */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>1. Select Interview Track</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map(c => {
                const selected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`p-3.5 text-left rounded-xl border transition-all ${
                      selected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>{c.label}</span>
                      {selected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {c.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Job Role */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>2. Target Job Role</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {standardRoles.map(role => {
                const selected = jobRole === role;
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => setJobRole(role)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
            {jobRole === 'Custom Role' && (
              <div className="pt-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Solutions Architect / Mobile Engineer"
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Section 3: Difficulty, Duration, and Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Gauge className="w-4 h-4 text-blue-600" />
                <span>Difficulty Level</span>
              </label>
              <div className="flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800">
                {difficulties.map(d => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      difficulty === d
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Target Duration</span>
              </label>
              <div className="flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800">
                {durations.map(m => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setDurationMinutes(m)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      durationMinutes === m
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Programming Language */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Primary Language</span>
              </label>
              <select
                value={programmingLanguage}
                onChange={e => setProgrammingLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Answer Mode (Voice vs Text) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
              <Mic className="w-4 h-4 text-blue-600" />
              <span>3. Candidate Response Mode</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAnswerMode('voice')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  answerMode === 'voice'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <span>Voice Interview (Speech-to-Text)</span>
                  </div>
                  {answerMode === 'voice' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Speak your answers naturally using the microphone. The browser transcribes your speech live with editable text before submission.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAnswerMode('text')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  answerMode === 'text'
                    ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-900/20 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Text Interview (Typed Input)</span>
                  </div>
                  {answerMode === 'text' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Type your answers directly into a distraction-free text editor with character counting and clean formatting.
                </p>
              </button>
            </div>
          </div>

          {/* Section 5: Profile Context & Resume Upload */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Personalization Context
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useProfileSkills}
                  onChange={e => setUseProfileSkills(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Ground questions in my saved technical skills ({profile?.technical_skills?.length || 0} skills listed)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useUploadedResume}
                  onChange={e => setUseUploadedResume(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include my parsed resume context in question prompts</span>
              </label>
            </div>

            {/* Quick Resume Upload / Status */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {profile?.resume_filename ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Resume: {profile.resume_filename}</span>
                  </span>
                ) : (
                  <span>No resume uploaded yet. You can upload a PDF to extract your projects and work history.</span>
                )}
                {resumeUploadSuccess && (
                  <span className="text-xs text-emerald-600 block mt-0.5">
                    Uploaded: {resumeUploadSuccess}
                  </span>
                )}
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc"
                  onChange={handleResumeFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingResume}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingResume ? 'Parsing...' : 'Upload PDF Resume'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-all shadow-md shadow-blue-600/20"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Tailored Interview Questions...</span>
                </>
              ) : (
                <>
                  <span>Start Interview Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
