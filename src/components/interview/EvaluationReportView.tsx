import React, { useEffect, useState, useRef } from 'react';
import {
  Download,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  BookOpen,
  Code,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '../../services/api.ts';
import { EvaluationReport, Interview } from '../../types/index.ts';
import { ScoreGauge } from '../common/ScoreGauge.tsx';

interface EvaluationReportProps {
  interviewId: string;
  onBackToDashboard: () => void;
  onRetakeInterview: () => void;
}

export const EvaluationReportView: React.FC<EvaluationReportProps> = ({
  interviewId,
  onBackToDashboard,
  onRetakeInterview,
}) => {
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({ 0: true });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        const data = await api.interviews.getById(interviewId);
        setInterview(data.interview);
        setReport(data.evaluation);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load evaluation report.');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [interviewId]);

  const toggleQuestionExpand = (index: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Generating Performance Evaluation Report...</span>
      </div>
    );
  }

  if (errorMsg || !report) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Evaluation Report Unavailable
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {errorMsg || 'Could not find a completed evaluation for this interview session.'}
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Categories chart data
  const categoryScores = [
    { name: 'Technical Depth', score: report.technical_score },
    { name: 'Relevance', score: report.relevance_score },
    { name: 'Communication', score: report.communication_score },
    { name: 'Problem Solving', score: report.problem_solving_score },
    { name: 'Language & Fluency', score: report.language_score },
    { name: 'Confidence & Clarity', score: report.confidence_score },
  ];

  return (
    <div ref={printRef} className="max-w-5xl mx-auto pb-16 space-y-8">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Evaluation Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {interview?.job_role} Interview Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {interview?.category} · {interview?.difficulty} Track · Completed {new Date(report.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetakeInterview}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Interview</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Gauge Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
          <ScoreGauge score={report.overall_score} size={150} label="Overall Candidate Score" />
          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Based on holistic analysis of technical precision, behavioral structure, and domain knowledge.
          </div>
        </div>

        {/* Right: 6-Dimension Category Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Evaluation Dimensions Breakdown
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Benchmark: 80+ for Hire</span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryScores} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
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
                  formatter={(val: any) => [`${val} / 100`, 'Score']}
                />
                <Bar dataKey="score" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6 Category Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoryScores.map(item => (
          <div
            key={item.name}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
          >
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block line-clamp-1 mb-1">
              {item.name}
            </span>
            <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {item.score}
            </span>
            <span className="text-[10px] text-slate-400 ml-0.5">/100</span>
          </div>
        ))}
      </div>

      {/* Strengths, Weaknesses, and Missing Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Candidate Strengths</span>
          </div>
          <ul className="space-y-2 pt-1">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-emerald-500 font-bold">·</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Areas to Improve</span>
          </div>
          <ul className="space-y-2 pt-1">
            {report.weaknesses.map((weak, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-amber-500 font-bold">·</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Points */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Lightbulb className="w-4 h-4" />
            <span>Missing Important Points</span>
          </div>
          <ul className="space-y-2 pt-1">
            {report.missing_points.map((pt, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                <span className="text-blue-500 font-bold">·</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-Wise Evaluation with Ideal Answers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Question-by-Question Deep Dive
          </h2>
          <span className="text-xs text-slate-500">
            {report.question_feedback.length} questions evaluated
          </span>
        </div>

        <div className="space-y-4">
          {report.question_feedback.map((item, idx) => {
            const isExpanded = !!expandedQuestions[idx];
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden"
              >
                {/* Collapsible Question Bar */}
                <button
                  type="button"
                  onClick={() => toggleQuestionExpand(idx)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {item.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {item.score}
                      </span>
                      <span className="text-[11px] text-slate-400">/100</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 pt-0 space-y-4 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Candidate Answer */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Your Submitted Response
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        &quot;{item.answer}&quot;
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* What was done well */}
                      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Strengths in this answer</span>
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.strengths}
                        </p>
                      </div>

                      {/* How to improve */}
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-1">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Actionable improvement</span>
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.improvements}
                        </p>
                      </div>
                    </div>

                    {/* Model Ideal Answer */}
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 space-y-1.5">
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recommended Model Answer (Senior Engineer Benchmark)</span>
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                        {item.idealAnswer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Learning Topics */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          <BookOpen className="w-4 h-4" />
          <span>Personalized Practice & Study Recommendations</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          To accelerate your readiness for real hiring rounds, review these targeted topics derived from your mock transcript:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {report.recommended_topics.map((topic, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2"
            >
              <Code className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>{topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
