import React, { useState } from 'react';
import {
  Mic,
  BrainCircuit,
  FileText,
  BarChart2,
  ChevronDown,
  Check,
  Play,
  ArrowRight,
  ShieldCheck,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../layout/Navbar.tsx';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onNavigateToDashboard }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AI interviewer adjust question difficulty in real time?',
      a: 'The engine analyzes your previous answer length, keyword depth, and architectural nuance. If you deliver an exemplary answer, it presents deeper situational follow-ups and edge-case dilemmas just like a principal tech interviewer.',
    },
    {
      q: 'Can I practice with both speech (microphone) and text typing?',
      a: 'Yes. You can toggle between Full Voice Mode (powered by the Web Speech API and Text-to-Speech) and Focused Text Mode with real-time character counters and instant submission.',
    },
    {
      q: 'How does the system evaluate my answers?',
      a: 'After completing the interview session, our AI model evaluates your responses across 6 core industry criteria: Technical Knowledge, Answer Relevance, Communication, Problem-Solving, Language Fluency, and Confidence & Clarity. You receive specific strengths, weaknesses, and a model ideal answer for each question.',
    },
    {
      q: 'Does it parse my uploaded resume?',
      a: 'Yes. When you upload a resume or fill your student profile, questions are personalized to your actual projects, internships, and stated skills instead of generic trivia.',
    },
    {
      q: 'Is my interview history and performance private?',
      a: 'Absolutely. Every interview session, recording, and evaluation report is locked strictly to your authenticated candidate profile with Row-Level Security isolation.',
    },
  ];

  const testimonials = [
    {
      quote:
        'Practicing with InterviewAI gave me the confidence I needed for my Amazon System Design round. The specific feedback on where my database indexing explanation fell short was identical to what my interviewer probed.',
      name: 'Elena Rostova',
      role: 'Associate Software Engineer',
      company: 'Cloudflare',
      score: '94/100 Readiness',
    },
    {
      quote:
        'As a college graduate transitioning from non-CS to frontend, the behavioral and technical voice drills completely removed my interview stutter. I received two full-time offers in 3 weeks.',
      name: 'Marcus Chen',
      role: 'Frontend Developer',
      company: 'Stripe',
      score: '91/100 Readiness',
    },
    {
      quote:
        'The question-by-question model answers taught me how to apply the STAR method under pressure. My HR and hiring manager rounds felt effortless.',
      name: 'Priya Sharma',
      role: 'Data Analyst & ML Specialist',
      company: 'Datadog',
      score: '89/100 Readiness',
    },
  ];

  return (
    <div id="home" className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onOpenAuth={onOpenAuth} onNavigateToDashboard={onNavigateToDashboard} />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-6 space-y-6">
              {/* Unboxed natural kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">
                <span>Enterprise AI Mock Platform</span>
                <span aria-hidden="true">·</span>
                <span>For Students & Job Seekers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                Practice Smarter. Interview Better. <span className="text-blue-600 dark:text-blue-400">Get Hired.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Prepare for top-tier software and HR interviews with an adaptive AI hiring lead. Receive real-time voice questioning, personalized resume probing, and actionable rubric evaluations with model answers.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20"
                >
                  <span>Start Free Mock Interview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4 text-blue-600" />
                  <span>Try Demo Account</span>
                </button>
              </div>

              {/* Quiet Social Proof Adjacency */}
              <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Real AI Rubric Scoring</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-blue-500" />
                  <span>Live Speech-to-Text</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <span>Resume-Tailored Q&A</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
                <img
                  src="/src/assets/images/ai_interview_hero_1794406150746.jpg"
                  alt="Candidate practicing AI mock interview on laptop"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover aspect-16/9"
                  onError={e => {
                    (e.target as HTMLImageElement).src = '/src/assets/images/interview_prep_bento_1794406151959.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-xs uppercase tracking-wider text-blue-300 font-semibold mb-1">
                      Live Simulation Active
                    </p>
                    <p className="text-sm font-medium">
                      Simulated Tech Lead: &quot;Walk me through your database indexing strategy for high throughput.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 lg:py-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Complete Preparation Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Engineered for Genuine Interview Mastery
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Every mock session mirrors the rigor of actual technical and behavioral hiring loops at top tier technology companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Adaptive AI Question Engine
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Questions are generated specifically for your selected role—Software Engineering, Frontend, Backend, AI/ML, or HR. Follow-ups dig into your claims dynamically.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span>Multi-turn context memory</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Dual Voice & Text Mode
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Practice natural speech delivery using the built-in browser Web Speech API with real-time transcription, or opt for structured text writing when polishing concise phrasing.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span>Natural text-to-speech audio</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Resume-Grounded Questions
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload your PDF resume. The system parses your coursework, internships, and repos to grill you on your actual claimed stack—just like an engineering manager.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <span>Zero generic pop-quiz trivia</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  6-Dimensional Evaluation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every answer is graded across Technical Depth, Relevance, Communication, Problem-Solving, Language, and Confidence with clear actionable improvement tips.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span>Scored out of 100 with rubric</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Senior Model Answers
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Do not just see what you did wrong—review how a Senior Staff Engineer would formulate the ideal answer with appropriate trade-offs, metrics, and architecture.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <span>Instant comparative study</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Progression Analytics & PDF Export
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track your scores across sessions with Recharts trends, identify persistent weak topics, and download formatted PDF evaluation reports for mentors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span>Printable PDF evaluation reports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Clear 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              How InterviewAI Prepares You
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              A frictionless workflow designed to take you from initial anxiety to interview mastery in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">01</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Configure Target Track
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose your job role (e.g. Full Stack, AI/ML), track (Technical, HR, Behavioral), difficulty level, duration, and optionally sync your resume and saved skills.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">02</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Attend Live AI Interview
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Engage directly with the AI interviewer avatar via speech or text. Answer open-ended architectural and situational questions under timed conditions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">03</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Receive Deep Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Immediately inspect your 6-dimension score, strengths, missing points, question-by-question model answers, and targeted learning recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-choose-us" className="py-20 lg:py-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
                Why Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                Built by Engineers for Aspiring Engineers
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Unlike generic quiz apps that test flashcard trivia, InterviewAI evaluates how you reason through systems, handle trade-offs, and express thoughts under real conversational constraints.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  'Zero pre-scripted static questions — dynamic prompts tailored to your profile',
                  'Honest rubric grading that highlights exactly what was missing',
                  'Dual voice input with browser speech recognition & text-to-speech audio',
                  'Comprehensive historical analytics tracking your improvement curve over time',
                  'Completely private data isolation backed by Row Level Security',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <img
                  src="/src/assets/images/interview_prep_bento_1794406151959.jpg"
                  alt="Modern tech workspace and code evaluation studio"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover aspect-4/3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Candidate Success
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Proven Results in Real Technical Loops
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              See how candidates utilized our AI interview drills to secure top engineering roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6"
              >
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.role} · {t.company}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                    {t.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 lg:py-28 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
              AI
            </div>
            <span>AI Mock Interview and Evaluation System</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600">Workflow</a>
            <a href="#faq" className="hover:text-blue-600">FAQ</a>
            <span>·</span>
            <span>&copy; {new Date().getFullYear()} InterviewAI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
