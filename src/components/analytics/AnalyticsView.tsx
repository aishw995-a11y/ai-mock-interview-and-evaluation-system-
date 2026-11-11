import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { api } from '../../services/api.ts';
import {
  AnalyticsSummary,
  ProgressionPoint,
  CategoryBreakdown,
  RadarDataPoint,
} from '../../types/index.ts';

export const AnalyticsView: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [progression, setProgression] = useState<ProgressionPoint[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const data = await api.analytics.get();
        setSummary(data.summary);
        setProgression(data.progression);
        setCategories(data.categoryBreakdown);
        setRadarData(data.radarData);
        setRecommendedTopics(data.recommendedTopics);
      } catch (err) {
        console.error('Failed to load performance analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Aggregating historical interview metrics...</span>
      </div>
    );
  }

  const hasData = (summary?.completedInterviews ?? 0) > 0;

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Longitudinal Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Performance Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track multi-session skill trajectory, category benchmarks, and predictive interview readiness.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Average Score</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {summary?.averageScore ?? 0}
            <span className="text-xs text-slate-400 font-normal ml-1">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across all completed rounds</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Highest Benchmark</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {summary?.highestScore ?? 0}
            <span className="text-xs text-slate-400 font-normal ml-1">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Peak performance session</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Improvement Delta</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {summary?.improvementPercentage ? `+${summary.improvementPercentage}%` : 'Stable'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">From earliest session</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Strongest Competency</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {summary?.strongestSkill || 'General Articulation'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Highest rubric consistency</span>
        </div>
      </div>

      {/* Main Charts: Line Chart Progression + Skill Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Progression Over Time */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Historical Progression Curve
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overall score, technical depth, and communication trajectory
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Sessions 1 → Latest</span>
          </div>

          <div className="h-72 w-full pt-2">
            {progression.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progression} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="session" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    name="Overall Score"
                    dataKey="score"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    name="Technical Depth"
                    dataKey="technical"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    name="Communication"
                    dataKey="communication"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Complete at least one interview to view progression curves.
              </div>
            )}
          </div>
        </div>

        {/* Radar Chart: Skill Balance vs Industry Benchmark */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Skill Profile vs Benchmark
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Candidate capabilities relative to 80-point industry hire bar
            </p>
          </div>

          <div className="h-72 w-full">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar
                    name="Candidate Performance"
                    dataKey="candidate"
                    stroke="#2563EB"
                    fill="#2563EB"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Hire Benchmark (80)"
                    dataKey="benchmark"
                    stroke="#94A3B8"
                    fill="#94A3B8"
                    fillOpacity={0.1}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No radar data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bar Chart: Category-wise Averages */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Category-Wise Competency Scores
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggregated historical performance across each evaluation rubric
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {categories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} / 100`, 'Average Score']}
                />
                <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No category averages recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Strategic AI Insights & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your technical answers consistently score high when explaining software architecture patterns and database normalization. You frame solutions logically and avoid hand-waving on critical code paths.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Targeted Growth Opportunities</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {summary?.weakestSkill ? (
              <>
                The evaluator noticed room for improvement in <strong>{summary.weakestSkill}</strong>. Incorporate more production metrics (e.g. latency percentiles, memory ceilings) and proactive edge-case error mitigation.
              </>
            ) : (
              'Practice structuring behavioral answers strictly around the STAR method to keep storytelling punchy and impact-oriented.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
