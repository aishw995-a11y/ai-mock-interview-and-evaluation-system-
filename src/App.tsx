/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar, DashboardTab } from './components/layout/Sidebar.tsx';
import { DashboardHeader } from './components/layout/DashboardHeader.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { InterviewConfigModal } from './components/interview/InterviewConfigModal.tsx';
import { InterviewRoomView } from './components/interview/InterviewRoomView.tsx';
import { EvaluationReportView } from './components/interview/EvaluationReportView.tsx';
import { InterviewHistoryView } from './components/interview/InterviewHistoryView.tsx';
import { AnalyticsView } from './components/analytics/AnalyticsView.tsx';
import { ProfileView } from './components/profile/ProfileView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';

function MainApp() {
  const { user, isLoading } = useAuth();

  // Navigation states
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auth modal states for public visitors
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Active interview / evaluation mode
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'dashboard' | 'interview_room' | 'evaluation_report'>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Initializing InterviewAI Platform...</span>
      </div>
    );
  }

  // Not authenticated: Render Landing Page with Auth Modal
  if (!user) {
    return (
      <>
        <LandingPage
          onOpenAuth={mode => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onNavigateToDashboard={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  // Live Interview Room Mode
  if (activeViewMode === 'interview_room' && activeInterviewId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors">
        <InterviewRoomView
          interviewId={activeInterviewId}
          onInterviewCompleted={id => {
            setActiveInterviewId(id);
            setActiveViewMode('evaluation_report');
          }}
          onExitInterview={() => {
            setActiveInterviewId(null);
            setActiveViewMode('dashboard');
            setActiveTab('dashboard');
          }}
        />
      </div>
    );
  }

  // Evaluation Report View Mode
  if (activeViewMode === 'evaluation_report' && activeInterviewId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 transition-colors">
        <EvaluationReportView
          interviewId={activeInterviewId}
          onBackToDashboard={() => {
            setActiveInterviewId(null);
            setActiveViewMode('dashboard');
            setActiveTab('dashboard');
          }}
          onRetakeInterview={() => {
            setActiveInterviewId(null);
            setActiveViewMode('dashboard');
            setActiveTab('new_interview');
          }}
        />
      </div>
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={tab => setActiveTab(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onStartNewInterview={() => setActiveTab('new_interview')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onStartNewInterview={() => setActiveTab('new_interview')}
              onViewReport={interviewId => {
                setActiveInterviewId(interviewId);
                setActiveViewMode('evaluation_report');
              }}
              onNavigateToTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'new_interview' && (
            <InterviewConfigModal
              onInterviewStarted={interviewId => {
                setActiveInterviewId(interviewId);
                setActiveViewMode('interview_room');
              }}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'history' && (
            <InterviewHistoryView
              onViewReport={interviewId => {
                setActiveInterviewId(interviewId);
                setActiveViewMode('evaluation_report');
              }}
              onStartNewInterview={() => setActiveTab('new_interview')}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'profile' && <ProfileView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
