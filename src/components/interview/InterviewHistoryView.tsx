import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { Interview } from '../../types/index.ts';

interface InterviewHistoryProps {
  onViewReport: (interviewId: string) => void;
  onStartNewInterview: () => void;
}

export const InterviewHistoryView: React.FC<InterviewHistoryProps> = ({
  onViewReport,
  onStartNewInterview,
}) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    async function loadInterviews() {
      try {
        setIsLoading(true);
        const res = await api.interviews.list({
          search: searchQuery || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        });
        setInterviews(res.interviews);
      } catch (err) {
        console.error('Failed to load interview history:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInterviews();
  }, [searchQuery, categoryFilter, difficultyFilter]);

  // Client-side sort
  const sortedInterviews = [...interviews].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.overall_score || 0) - (a.overall_score || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Interview History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access and review your recorded sessions, evaluation scores, and personalized model answers.
          </p>
        </div>
        <button
          onClick={onStartNewInterview}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm self-start sm:self-center"
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Mock Session</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by job role or track..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Tracks</option>
            <option value="Technical Interview">Technical</option>
            <option value="HR Interview">HR & Culture</option>
            <option value="Behavioral Interview">Behavioral</option>
            <option value="Programming Interview">Programming</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={e => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
      </div>

      {/* Interview List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-slate-400">Loading history...</span>
        </div>
      ) : sortedInterviews.length > 0 ? (
        <div className="space-y-3">
          {sortedInterviews.map(item => {
            const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.job_role}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.duration_minutes} min duration</span>
                    </span>
                    <span>Level: {item.difficulty}</span>
                    <span>Mode: {item.answer_mode === 'voice' ? 'Voice' : 'Text'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  {item.overall_score !== null && item.overall_score !== undefined ? (
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                          {item.overall_score}
                        </span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Evaluated Score</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      In Progress
                    </span>
                  )}

                  <button
                    onClick={() => onViewReport(item.id)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No Interview Records Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all'
              ? 'No sessions match your search or filter criteria. Try resetting filters.'
              : 'You have not attended any mock interviews yet. Launch your first interview to establish your benchmark.'}
          </p>
          <button
            onClick={onStartNewInterview}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Start Your First Interview
          </button>
        </div>
      )}
    </div>
  );
};
