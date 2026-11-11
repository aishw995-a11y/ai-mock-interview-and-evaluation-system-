import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  Bot,
  RefreshCw,
  LogOut,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { Interview, InterviewQuestion, InterviewAnswer } from '../../types/index.ts';

interface InterviewRoomProps {
  interviewId: string;
  onInterviewCompleted: (interviewId: string) => void;
  onExitInterview: () => void;
}

export const InterviewRoomView: React.FC<InterviewRoomProps> = ({
  interviewId,
  onInterviewCompleted,
  onExitInterview,
}) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answerText, setAnswerText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState<number>(0);

  // Voice Speech-To-Text states
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Audio Text-To-Speech states
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Adaptive follow-up question
  const [activeFollowUp, setActiveFollowUp] = useState<string | null>(null);

  // Exit dialog
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Load interview details
  useEffect(() => {
    async function loadInterview() {
      try {
        setIsLoading(true);
        const data = await api.interviews.getById(interviewId);
        setInterview(data.interview);
        setQuestions(data.questions);
        setAnswers(data.answers);
        setCurrentIndex(data.interview.current_question_index || 0);

        // Pre-fill existing answer if already submitted
        const existingAns = data.answers.find(a => a.question_index === (data.interview.current_question_index || 0));
        if (existingAns) {
          setAnswerText(existingAns.answer_text);
        }

        // Initialize timer based on remaining duration
        const durationSec = (data.interview.duration_minutes || 15) * 60;
        setSecondsRemaining(durationSec);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load interview room.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInterview();
  }, [interviewId]);

  // Overall countdown timer
  useEffect(() => {
    if (isEvaluating || isLoading) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
      setQuestionElapsedSeconds(q => q + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isEvaluating, isLoading]);

  // Web Speech API speech recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechRecognitionSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setAnswerText(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions or switch to Text mode.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition setup failed:', err);
      setSpeechRecognitionSupported(false);
    }
  }, []);

  // Text-To-Speech for current question
  const speakCurrentQuestion = (text: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS playback failed:', err);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  // Speak question whenever question index changes
  useEffect(() => {
    if (questions.length > 0 && questions[currentIndex]) {
      setQuestionElapsedSeconds(0);
      const textToSpeak = questions[currentIndex].question_text;
      speakCurrentQuestion(textToSpeak);
    }
    return () => stopSpeaking();
  }, [currentIndex, questions]);

  const toggleRecording = () => {
    if (!speechRecognitionSupported || !recognitionRef.current) {
      setErrorMsg('Speech recognition is not supported in this browser. Please type your answers directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setErrorMsg(null);
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start microphone:', err);
      }
    }
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    if (answerText.trim().length === 0) {
      setErrorMsg('Please speak or type an answer before proceeding.');
      return;
    }

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await api.interviews.submitAnswer(interviewId, {
        question_id: currentQuestion.id,
        question_index: currentIndex,
        answer_text: answerText.trim(),
        answer_mode: interview?.answer_mode || 'voice',
        duration_seconds: questionElapsedSeconds,
      });

      // Show follow-up question if generated
      if (res.follow_up) {
        setActiveFollowUp(res.follow_up);
        speakCurrentQuestion(`Follow-up: ${res.follow_up}`);
        setIsSubmitting(false);
        return;
      }

      // Move to next question or trigger completion
      if (isLastQuestion) {
        await triggerEvaluation();
      } else {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        // Load answer if already present
        const nextAns = answers.find(a => a.question_index === nextIdx);
        setAnswerText(nextAns?.answer_text || '');
        setActiveFollowUp(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerEvaluation = async () => {
    try {
      setIsEvaluating(true);
      stopSpeaking();
      await api.interviews.complete(interviewId);
      onInterviewCompleted(interviewId);
    } catch (err: any) {
      setErrorMsg(err.message || 'Evaluation generation failed. Please try again.');
      setIsEvaluating(false);
    }
  };

  // Format timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Preparing AI Interview Room...</span>
      </div>
    );
  }

  if (isEvaluating) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Evaluating Interview Responses
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Our AI evaluation engine is analyzing your technical depth, question relevance, problem-solving structure, and communication clarity against industry benchmarks...
          </p>
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Synthesizing rubric scoring & model answers...</span>
        </div>
      </div>
    );
  }

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const charCount = answerText.length;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Top Bar: Role badge, countdown timer, end button */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {interview?.job_role}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {interview?.category} · {interview?.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Audio toggle */}
          <button
            onClick={() => {
              if (isAiSpeaking) stopSpeaking();
              setIsAudioMuted(!isAudioMuted);
            }}
            title={isAudioMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
          </button>

          {/* Session Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          {/* End Interview */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Interviewer Avatar & Speech Waveform */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src="/src/assets/images/interviewer_avatar_1794406152108.jpg"
              alt="AI Interviewer"
              className={`w-28 h-28 rounded-full object-cover border-3 transition-all duration-300 ${
                isAiSpeaking
                  ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105 ring-4 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
              onError={e => {
                (e.target as HTMLImageElement).src = '/src/assets/images/student_user_avatar_1794406151660.jpg';
              }}
            />
            {isAiSpeaking && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 animate-pulse" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sarah Jenkins
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lead Technical Hiring Partner
            </p>
          </div>

          {/* AI Voice State Indicator */}
          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs">
            {isAiSpeaking ? (
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Interviewer speaking...</span>
              </div>
            ) : (
              <button
                onClick={() => currentQuestion && speakCurrentQuestion(currentQuestion.question_text)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replay Question Audio</span>
              </button>
            )}
          </div>

          {/* Progress dots */}
          <div className="w-full pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>Progress</span>
              <span className="font-mono">
                {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / (questions.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Question Display & Answer Box */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Question {currentIndex + 1}
              </span>
              <span>{currentQuestion?.category || 'Core Question'}</span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion?.question_text}
            </h2>

            {currentQuestion?.rationale && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Interviewer Rationale:</strong> {currentQuestion.rationale}</span>
              </div>
            )}

            {/* Active follow-up banner */}
            {activeFollowUp && (
              <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Adaptive Follow-up:</span>
                </div>
                <p>{activeFollowUp}</p>
              </div>
            )}
          </div>

          {/* Answer Workspace */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Your Answer ({interview?.answer_mode === 'voice' ? 'Voice & Text' : 'Text Input'})
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono tabular-nums">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            {/* Voice Control Bar (if voice mode) */}
            {interview?.answer_mode === 'voice' && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isRecording
                        ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-600/20'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Stop Speaking</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Start Microphone</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {isRecording ? 'Listening live... speak clearly into your mic.' : 'Click to dictate your answer aloud.'}
                  </span>
                </div>

                {answerText && (
                  <button
                    onClick={() => setAnswerText('')}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            )}

            {/* Textarea for answer input/review */}
            <textarea
              rows={6}
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder={
                interview?.answer_mode === 'voice'
                  ? 'Your recognized speech will appear here. You can edit, format, or supplement it manually...'
                  : 'Type your thorough answer here. Elaborate on your architectural reasoning, edge cases, and design choices...'
              }
              className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed resize-y"
            />

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                Tip: Use concrete engineering keywords and metrics to boost your evaluation score.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || answerText.trim().length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Answer...</span>
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit & Finish Interview</span>
                    </>
                  ) : (
                    <>
                      <span>Next Question</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              End Interview Early?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to exit? You can either submit the answers you have completed so far for an AI evaluation, or return to the dashboard.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Resume Interview
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  triggerEvaluation();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Evaluate Completed Answers
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitInterview();
                }}
                className="px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                Discard & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
