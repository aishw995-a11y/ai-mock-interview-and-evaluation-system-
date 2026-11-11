import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  showGrade?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Overall Score',
  showGrade = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = '#2563EB'; // Royal blue
  let gradeText = 'Developing';

  if (clampedScore >= 85) {
    colorClass = '#16A34A'; // Emerald green
    gradeText = 'Interview Ready';
  } else if (clampedScore >= 70) {
    colorClass = '#2563EB'; // Royal blue
    gradeText = 'Strong Candidate';
  } else if (clampedScore >= 55) {
    colorClass = '#D97706'; // Amber
    gradeText = 'Moderate Readiness';
  } else {
    colorClass = '#DC2626'; // Red
    gradeText = 'Needs Practice';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />
          {/* Animated score circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {clampedScore}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      {showGrade && (
        <div className="mt-3 text-center">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{gradeText}</div>
        </div>
      )}
    </div>
  );
};
