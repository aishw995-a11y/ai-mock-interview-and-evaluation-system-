import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Trash2,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Link as LinkIcon,
  Github,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { UserSkill, UserProject, UserCertification } from '../../types/index.ts';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile, refreshProfile } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [collegeName, setCollegeName] = useState(profile?.college_name || '');
  const [degree, setDegree] = useState(profile?.degree || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [academicYear, setAcademicYear] = useState(profile?.academic_year || 'Final Year');
  const [careerObjective, setCareerObjective] = useState(profile?.career_objective || '');
  const [preferredJobRole, setPreferredJobRole] = useState(profile?.preferred_job_role || 'Full Stack Developer');

  // Relational sub-lists
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [certifications, setCertifications] = useState<UserCertification[]>([]);

  // Input states for adding new items
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectGithub, setNewProjectGithub] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  const [newCertTitle, setNewCertTitle] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertDate, setNewCertDate] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.profile.get();
        if (res.profile) {
          setFullName(res.profile.full_name || '');
          setEmail(res.profile.email || '');
          setPhone(res.profile.phone || '');
          setCollegeName(res.profile.college_name || '');
          setDegree(res.profile.degree || '');
          setDepartment(res.profile.department || '');
          setAcademicYear(res.profile.academic_year || 'Final Year');
          setCareerObjective(res.profile.career_objective || '');
          setPreferredJobRole(res.profile.preferred_job_role || 'Full Stack Developer');
        }
        setSkills(res.skills || []);
        setProjects(res.projects || []);
        setCertifications(res.certifications || []);
      } catch (err) {
        console.error('Failed to load profile details:', err);
      }
    }
    loadData();
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setIsUploadingAvatar(true);
      setErrorMsg(null);
      await api.profile.uploadAvatar(file);
      await refreshProfile();
      setSuccessMsg('Profile picture updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setIsUploadingResume(true);
      setErrorMsg(null);
      await api.profile.uploadResume(file);
      await refreshProfile();
      setSuccessMsg('Resume uploaded and text extracted for AI interviews.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload resume.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg(null);
      await updateProfile({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        college_name: collegeName.trim(),
        degree: degree.trim(),
        department: department.trim(),
        academic_year: academicYear,
        career_objective: careerObjective.trim(),
        preferred_job_role: preferredJobRole,
      });
      setSuccessMsg('Profile information saved successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Skills
  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const res = await api.profile.addSkill({
        skill_name: newSkillName.trim(),
        proficiency: newSkillProficiency,
      });
      setSkills(res.all_skills);
      setNewSkillName('');
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add skill.');
    }
  };

  const handleRemoveSkill = async (id: string) => {
    try {
      const res = await api.profile.removeSkill(id);
      setSkills(res.all_skills);
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove skill.');
    }
  };

  // Projects
  const handleAddProject = async () => {
    if (!newProjectTitle.trim()) return;
    try {
      const res = await api.profile.addProject({
        title: newProjectTitle.trim(),
        description: newProjectDesc.trim(),
        tech_stack: newProjectTech.split(',').map(s => s.trim()).filter(Boolean),
        github_url: newProjectGithub.trim(),
      });
      setProjects(res.all_projects);
      setNewProjectTitle('');
      setNewProjectDesc('');
      setNewProjectTech('');
      setNewProjectGithub('');
      setShowAddProject(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add project.');
    }
  };

  const handleRemoveProject = async (id: string) => {
    try {
      const res = await api.profile.removeProject(id);
      setProjects(res.all_projects);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove project.');
    }
  };

  // Certifications
  const handleAddCert = async () => {
    if (!newCertTitle.trim() || !newCertIssuer.trim()) return;
    try {
      const res = await api.profile.addCertification({
        title: newCertTitle.trim(),
        issuer: newCertIssuer.trim(),
        issue_date: newCertDate,
      });
      setCertifications(res.all_certifications);
      setNewCertTitle('');
      setNewCertIssuer('');
      setNewCertDate('');
      setShowAddCert(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add certification.');
    }
  };

  const handleRemoveCert = async (id: string) => {
    try {
      const res = await api.profile.removeCertification(id);
      setCertifications(res.all_certifications);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove certification.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Candidate Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Your profile and resume are used by the AI engine to generate grounded, realistic interview questions.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Picture & Resume Upload Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Profile Picture Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-5">
          <div className="relative group">
            <img
              src={profile?.avatar_url || '/src/assets/images/student_user_avatar_1794406151660.jpg'}
              alt={fullName || 'Avatar'}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
              onError={e => {
                (e.target as HTMLImageElement).src = '/src/assets/images/student_user_avatar_1794406151660.jpg';
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Profile Photo
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Upload a professional headshot from your device.
            </p>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => avatarInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
            </button>
          </div>
        </div>

        {/* Resume Upload Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Resume Document
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {profile?.resume_filename ? `Active: ${profile.resume_filename}` : 'PDF format supported'}
            </p>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.txt,.doc"
              onChange={handleResumeFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingResume}
              onClick={() => resumeInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingResume ? 'Parsing...' : 'Upload Resume (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Form: Personal & Academic Details */}
      <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Academic & Personal Information</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Job Role
            </label>
            <input
              type="text"
              value={preferredJobRole}
              onChange={e => setPreferredJobRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              College / University
            </label>
            <input
              type="text"
              placeholder="e.g. Stanford University"
              value={collegeName}
              onChange={e => setCollegeName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Degree & Department
            </label>
            <input
              type="text"
              placeholder="e.g. B.S. in Computer Science"
              value={degree}
              onChange={e => setDegree(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="First Year">First Year (Freshman)</option>
              <option value="Second Year">Second Year (Sophomore)</option>
              <option value="Third Year">Third Year (Junior)</option>
              <option value="Final Year">Final Year (Senior)</option>
              <option value="Graduate / Alum">Recent Graduate / Alum</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Career Objective
            </label>
            <textarea
              rows={3}
              value={careerObjective}
              onChange={e => setCareerObjective(e.target.value)}
              placeholder="Brief summary of your career aspirations and engineering passions..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Information'}</span>
          </button>
        </div>
      </form>

      {/* Technical Skills Manager */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-600" />
          <span>Technical Skills</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add the programming languages, frameworks, and tools you want the AI to test you on.
        </p>

        {/* Add Skill Form */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <input
            type="text"
            placeholder="e.g. React, Docker, PostgreSQL"
            value={newSkillName}
            onChange={e => setNewSkillName(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newSkillProficiency}
            onChange={e => setNewSkillProficiency(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            type="button"
            onClick={handleAddSkill}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        {/* Current Skills Tags */}
        <div className="flex flex-wrap gap-2 pt-3">
          {skills.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <span className="font-medium">{s.skill_name}</span>
              <span className="text-[10px] text-slate-400">({s.proficiency})</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(s.id)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {skills.length === 0 && (
            <span className="text-xs text-slate-400">No skills added yet.</span>
          )}
        </div>
      </div>

      {/* Projects Manager */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Projects & Engineering Work</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showcase capstones, open-source repositories, and portfolio work for behavioral and technical drilling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProject(!showAddProject)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddProject ? 'Cancel' : 'Add Project'}</span>
          </button>
        </div>

        {showAddProject && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <input
              type="text"
              placeholder="Project Title"
              value={newProjectTitle}
              onChange={e => setNewProjectTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={2}
              placeholder="Description of the architecture, key algorithms, and trade-offs..."
              value={newProjectDesc}
              onChange={e => setNewProjectDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tech Stack (comma-separated, e.g. React, Node.js, Redis)"
              value={newProjectTech}
              onChange={e => setNewProjectTech(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="GitHub Repository URL (Optional)"
              value={newProjectGithub}
              onChange={e => setNewProjectGithub(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddProject}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Project
            </button>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {projects.map(p => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {p.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {p.description}
                </p>
                {p.tech_stack && p.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.tech_stack.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveProject(p.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-xs text-slate-400">No projects added yet.</p>
          )}
        </div>
      </div>

      {/* Certifications Manager */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <span>Certifications & Honors</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified certifications from AWS, Google Cloud, Meta, or academic honors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddCert(!showAddCert)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddCert ? 'Cancel' : 'Add Certification'}</span>
          </button>
        </div>

        {showAddCert && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <input
              type="text"
              placeholder="Certification Title (e.g. AWS Certified Solutions Architect)"
              value={newCertTitle}
              onChange={e => setNewCertTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Issuing Organization (e.g. Amazon Web Services)"
              value={newCertIssuer}
              onChange={e => setNewCertIssuer(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newCertDate}
              onChange={e => setNewCertDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddCert}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Save Certification
            </button>
          </div>
        )}

        <div className="space-y-2 pt-1">
          {certifications.map(c => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {c.title}
                </span>
                <span className="text-[11px] text-slate-500">
                  {c.issuer} {c.issue_date && `· Issued ${c.issue_date}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCert(c.id)}
                className="text-slate-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {certifications.length === 0 && (
            <p className="text-xs text-slate-400">No certifications added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
