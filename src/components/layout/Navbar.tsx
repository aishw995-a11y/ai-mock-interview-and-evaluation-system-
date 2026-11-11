import React from 'react';
import { Bot, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onNavigateToDashboard }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a href="#home" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <span>InterviewAI</span>
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Features</a>
          <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">How It Works</a>
          <a href="#why-choose-us" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Why Choose Us</a>
          <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">Testimonials</a>
          <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">FAQ</a>
        </nav>

        {/* Zone 3: 1 primary action & theme switch */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <button
              onClick={onNavigateToDashboard}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
