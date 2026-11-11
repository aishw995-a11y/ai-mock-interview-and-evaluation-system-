import React from 'react';
import {
  LayoutDashboard,
  PlayCircle,
  History,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bot,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export type DashboardTab = 'dashboard' | 'new_interview' | 'history' | 'analytics' | 'profile' | 'settings';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user, profile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as DashboardTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new_interview' as DashboardTab, label: 'Start New Interview', icon: PlayCircle },
    { id: 'history' as DashboardTab, label: 'Interview History', icon: History },
    { id: 'analytics' as DashboardTab, label: 'Performance Analytics', icon: BarChart3 },
    { id: 'profile' as DashboardTab, label: 'My Profile', icon: User },
    { id: 'settings' as DashboardTab, label: 'Settings', icon: Settings },
  ];

  const handleNav = (id: DashboardTab) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo brand */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900 dark:text-white leading-none">
                  InterviewAI
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Evaluation System
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Nav items */}
          <nav className="p-4 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User preview & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 mb-3 px-2">
            <img
              src={profile?.avatar_url || '/src/assets/images/student_user_avatar_1794406151660.jpg'}
              alt={user?.full_name || 'Candidate'}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              onError={e => {
                (e.target as HTMLImageElement).src = '/src/assets/images/student_user_avatar_1794406151660.jpg';
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.full_name || 'Candidate'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
