import React, { useEffect, useState } from 'react';
import {
  PlayCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Code,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { AnalyticsSummary, ProgressionPoint } from '../../types/index.ts';

interface DashboardViewProps {
  onStartNewInterview: () => void;
  onViewReport: (interviewId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartNewInterview,
  onViewReport,
  onNavigateToTab,
}) => {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [progression, setProgression] = useState<ProgressionPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await api.analytics.get();
        setSummary(data.summary);
        setProgression(data.progression);
        setRecentActivity(data.recentActivity);
        setRecommendedTopics(data.recommendedTopics);
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalInterviews = summary?.totalInterviews ?? 0;
  const avgScore = summary?.averageScore ?? 0;
  const highestScore = summary?.highestScore ?? 0;
  const completedCount = summary?.completedInterviews ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <span>Interview Preparation Portal</span>
            <span>·</span>
            <span>{profile?.preferred_job_role || 'Software Engineering'} Track</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.full_name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            {totalInterviews > 0
              ? `You have completed ${completedCount} mock interviews. Keep sharpening your answers to reach peak interview readiness.`
              : 'You have not attended any mock interviews yet. Start your first session to receive personalized AI evaluation.'}
          </p>
        </div>
        <button
          onClick={onStartNewInterview}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-blue-950 bg-white hover:bg-blue-50 rounded-xl transition-all shadow-sm shrink-0"
        >
          <PlayCircle className="w-4 h-4 text-blue-600" />
          <span>Quick Start Interview</span>
        </button>
      </div>

      {/* 4 KPI Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Interviews */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Interviews</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {isLoading ? '...' : totalInterviews}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Recorded in session history
          </p>
        </div>

        {/* Card 2: Average Score */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-medium">Average Score</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {isLoading ? '...' : avgScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across 6 evaluation categories
          </p>
        </div>

        {/* Card 3: Highest Score */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-medium">Highest Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {isLoading ? '...' : highestScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Best performance benchmark
          </p>
        </div>

        {/* Card 4: Completed Interviews */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {isLoading ? '...' : completedCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            With comprehensive reports
          </p>
        </div>
      </div>

      {/* Main Grid: Chart & Skills / Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Progression Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Performance Progress
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Score progression across consecutive mock sessions
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('analytics')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            {progression.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="session"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[40, 100]}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any) => [`${val} / 100`, 'Overall Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs">No interview score progression recorded yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Complete your first mock interview to generate your trend line.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Technical Skills & Improvement Focus */}
        <div className="lg:col-span-4 space-y-6">
          {/* Areas to Improve */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Areas for Improvement</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {summary?.weakestSkill ? (
                <>Identified lower confidence in: <strong className="text-slate-900 dark:text-white">{summary.weakestSkill}</strong></>
              ) : (
                'Focus on articulating quantitative trade-offs and edge cases under pressure.'
              )}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                Recommended Practice Topics:
              </span>
              <div className="space-y-1.5">
                {recommendedTopics.slice(0, 3).map((topic, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stated Candidate Skills Snapshot */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Code className="w-4 h-4 text-blue-600" />
                <span>Active Profile Skills</span>
              </div>
              <button
                onClick={() => onNavigateToTab('profile')}
                className="text-[11px] text-blue-600 hover:underline"
              >
                Manage
              </button>
            </div>
            {profile?.technical_skills && profile.technical_skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.technical_skills.slice(0, 8).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No skills listed yet. Add your technical stack in the profile to customize questions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Interview Activity */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Interview Activity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review completed sessions and re-examine feedback
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('history')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All History
          </button>
        </div>

        {recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentActivity.map(item => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {item.job_role}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {item.category} · {item.difficulty} · {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  {item.score !== null ? (
                    <div className="text-right">
                      <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
                        {item.score}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">/ 100</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      In Progress
                    </span>
                  )}
                  <button
                    onClick={() => onViewReport(item.id)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No interview sessions on record. Click &quot;Quick Start Interview&quot; to begin.
          </div>
        )}
      </div>
    </div>
  );
};
