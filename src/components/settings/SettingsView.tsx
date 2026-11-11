import React, { useState, useEffect } from 'react';
import {
  Lock,
  Sun,
  Moon,
  Mic,
  Volume2,
  Bell,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { api } from '../../services/api.ts';

export const SettingsView: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preference states
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState<number>(0);

  // Status feedback
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load current settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.settings.get();
        if (res.settings) {
          setAutoPlayAudio(res.settings.autoPlayAudio !== false);
          setEmailNotifications(res.settings.emailNotifications !== false);
          setInterviewReminders(res.settings.interviewReminders !== false);
        }
      } catch (err) {
        console.warn('Failed to fetch settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.auth.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Password has been updated securely.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await api.settings.save({
        theme,
        autoPlayAudio,
        emailNotifications,
        interviewReminders,
      });
      setSettingsSuccess('Preferences saved successfully.');
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  };

  const testMicrophone = async () => {
    try {
      setIsTestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let counter = 0;
      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let values = 0;
        for (let i = 0; i < bufferLength; i++) {
          values += dataArray[i];
        }
        const average = values / bufferLength;
        setMicVolumeLevel(Math.min(100, Math.round(average * 2)));
        counter++;
        if (counter < 60) {
          requestAnimationFrame(checkVolume);
        } else {
          stream.getTracks().forEach(t => t.stop());
          setIsTestingMic(false);
          setMicVolumeLevel(0);
        }
      };
      checkVolume();
    } catch (err) {
      alert('Could not access microphone. Please check your browser audio permissions.');
      setIsTestingMic(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await api.settings.deleteAccount();
      logout();
    } catch (err: any) {
      alert(err.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Account Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure security, system theme, audio input devices, and notifications.
        </p>
      </div>

      {settingsSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{settingsSuccess}</span>
        </div>
      )}

      {/* Theme & Display Mode */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-blue-600" />
          <span>Appearance & Theme</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select your preferred interface color mode for distraction-free practice.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold">Light Mode</span>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      </div>

      {/* Audio & Speech Synthesizer Settings */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-blue-600" />
          <span>Microphone & Voice Settings</span>
        </h2>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Auto-play AI Interviewer Voice
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically speak new questions aloud using browser speech synthesis
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={e => setAutoPlayAudio(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Microphone Input Test
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Speak to test input audio levels before joining a live mock session
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isTestingMic && (
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-75"
                    style={{ width: `${micVolumeLevel}%` }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={testMicrophone}
                disabled={isTestingMic}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {isTestingMic ? 'Listening...' : 'Test Microphone'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          <span>Security & Password</span>
        </h2>

        {passwordSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-300">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-300">
            {passwordError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={e => setConfirmNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            {isChangingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>

      {/* Save general preferences button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSavePreferences}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 sm:p-8 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          <span>Danger Zone: Delete Candidate Account</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Permanently erase your candidate profile, uploaded resumes, recorded interview answers, and historical performance reports. This action cannot be reversed.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-300 dark:border-red-800 rounded-lg transition-colors"
        >
          Delete Account & All Data
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Permanently Delete Your Account?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This will completely delete your account ({user?.email}) and all interview history, audio records, and analytics. Are you sure you want to proceed?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
