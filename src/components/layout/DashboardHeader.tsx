import React from 'react';
import { Menu, Sun, Moon, Plus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { DashboardTab } from './Sidebar.tsx';

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  onOpenMobileMenu: () => void;
  onStartNewInterview: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onStartNewInterview,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useAuth();

  const tabTitles: Record<DashboardTab, string> = {
    dashboard: 'Dashboard Overview',
    new_interview: 'Configure New Interview',
    history: 'Interview History & Reports',
    analytics: 'Performance Analytics',
    profile: 'User Profile & Resume',
    settings: 'Account Settings',
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean breadcrumb trail */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 dark:text-slate-500 font-medium">Workspace</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {tabTitles[activeTab]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick New Interview CTA */}
        {activeTab !== 'new_interview' && (
          <button
            onClick={onStartNewInterview}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Interview</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User avatar indicator */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={profile?.avatar_url || '/src/assets/images/student_user_avatar_1794406151660.jpg'}
            alt={user?.full_name || 'Candidate'}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            onError={e => {
              (e.target as HTMLImageElement).src = '/src/assets/images/student_user_avatar_1794406151660.jpg';
            }}
          />
          <span className="hidden lg:inline-block text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
            {user?.full_name?.split(' ')[0] || 'Candidate'}
          </span>
        </div>
      </div>
    </header>
  );
};
