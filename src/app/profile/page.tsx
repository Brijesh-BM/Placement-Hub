'use client';

import { useEffect, useState } from 'react';
import { 
  User, 
  Building, 
  BookOpen, 
  Calendar, 
  Award, 
  FileUp, 
  Plus, 
  X, 
  Check, 
  Loader2, 
  Database,
  FileCheck,
  Bookmark,
  ChevronRight,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface Skill {
  id: string;
  name: string;
}

interface BadgeItem {
  badge: {
    name: string;
    description: string;
    icon: string;
  };
}

interface College {
  id: string;
  name: string;
}

interface BookmarkItem {
  id: string;
  questionId: string | null;
  question: { id: string; text: string; difficulty: string; subCategory: { name: string } } | null;
  noteId: string | null;
  note: { id: string; title: string; category: string } | null;
  roadmapId: string | null;
  roadmap: { id: string; title: string; description: string } | null;
  experienceId: string | null;
  experience: { id: string; company: { name: string }; role: string; difficulty: string } | null;
}

interface UserProfile {
  name: string;
  email: string;
  profile: {
    collegeId: string | null;
    college: { id: string; name: string } | null;
    branch: string | null;
    gradYear: number | null;
    cgpa: number | null;
    skills: Skill[];
    resumeUrl: string | null;
    resumeName: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    streak: number;
    targetRole: string;
    badges: BadgeItem[];
  } | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookmarks'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [branch, setBranch] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [cgpa, setCgpa] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [targetRole, setTargetRole] = useState('SOFTWARE_ENGINEER');
  
  // Skills Tags
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  // Upload State
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name || '');
          const p = data.user.profile;
          if (p) {
            setCollegeId(p.collegeId || '');
            setBranch(p.branch || '');
            setGradYear(p.gradYear?.toString() || '2026');
            setCgpa(p.cgpa?.toString() || '');
            setLinkedinUrl(p.linkedinUrl || '');
            setGithubUrl(p.githubUrl || '');
            setTargetRole(p.targetRole || 'SOFTWARE_ENGINEER');
            setSkills(p.skills.map((s: Skill) => s.name) || []);
            setResumeName(p.resumeName);
            setResumeUrl(p.resumeUrl);
          }
        }
      }

      const collegeRes = await fetch('/api/colleges');
      if (collegeRes.ok) {
        const colData = await collegeRes.json();
        setColleges(colData.colleges || []);
      }

      const bookmarksRes = await fetch('/api/bookmarks');
      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData.bookmarks || []);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          collegeId: collegeId || null,
          branch,
          gradYear: parseInt(gradYear, 10),
          cgpa: cgpa ? parseFloat(cgpa) : null,
          linkedinUrl,
          githubUrl,
          targetRole,
          skills,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccessMsg('Profile updated successfully!');
      window.dispatchEvent(new Event('auth-change'));
      fetchProfile();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBookmark = async (item: BookmarkItem) => {
    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: item.questionId,
          noteId: item.noteId,
          roadmapId: item.roadmapId,
          experienceId: item.experienceId,
        })
      });
      if (res.ok) {
        setBookmarks(bookmarks.filter(b => b.id !== item.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResumeName(data.resumeName);
      setResumeUrl(data.resumeUrl);
      setSuccessMsg('Resume uploaded successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 min-h-screen flex flex-col items-center justify-center p-8">
        <div className="h-8 w-8 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-550 mt-4 text-sm font-semibold">Fetching profile details...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Keep your credentials up to date for recruiters and mock assessments.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap gap-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3.5 text-sm font-extrabold border-b-2 transition ${
            activeTab === 'profile' ? 'border-indigo-600 text-indigo-705' : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          My Profile Card
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-5 py-3.5 text-sm font-extrabold border-b-2 transition ${
            activeTab === 'bookmarks' ? 'border-indigo-600 text-indigo-705' : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          Saved Content ({bookmarks.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Profile Card & Badges */}
        <div className="space-y-6">
          {/* Card 1: Avatar Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white uppercase mx-auto shadow-sm">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">{name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">{profile?.email}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-around text-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Streak</span>
                <span className="text-lg font-extrabold text-slate-800 mt-1 block">
                  {profile?.profile?.streak || 0} days
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Target Role</span>
                <span className="text-xs font-extrabold text-indigo-650 mt-1 block uppercase">
                  {targetRole.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Badges */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
            <span className="font-bold text-slate-800 block">Earned Badges & Achievements</span>
            
            {profile?.profile?.badges && profile.profile.badges.length > 0 ? (
              <div className="space-y-3">
                {profile.profile.badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-150">
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{b.badge.name}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{b.badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <span className="text-slate-400 text-xs italic">Complete assessments to unlock achievement badges!</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'profile' ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center gap-2 font-bold text-left">
                  <Check className="h-4 w-4" />
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm flex items-center gap-2 font-bold text-left">
                  <X className="h-4 w-4" />
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6 text-left">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                      College Selection
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={collegeId}
                        onChange={(e) => setCollegeId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition appearance-none text-sm font-semibold"
                      >
                        <option value="">Select College</option>
                        {colleges.map((col) => (
                          <option key={col.id} value={col.id}>{col.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-2">
                      Target Role
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition appearance-none text-sm font-semibold"
                      >
                        <option value="SOFTWARE_ENGINEER">Software Engineer</option>
                        <option value="FRONTEND_DEVELOPER">Frontend Developer</option>
                        <option value="BACKEND_DEVELOPER">Backend Developer</option>
                        <option value="DATA_ANALYST">Data Analyst</option>
                        <option value="DATA_ENGINEER">Data Engineer</option>
                        <option value="QA_ENGINEER">QA Engineer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                      Branch Name
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                        Graduation Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                          value={gradYear}
                          onChange={(e) => setGradYear(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition appearance-none text-sm font-semibold"
                        >
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                        CGPA
                      </label>
                      <div className="relative">
                        <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          placeholder="8.45"
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                      LinkedIn URL
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                      GitHub URL
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills interactive tag inputs */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                    Skills & Technologies
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                    {skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg text-xs font-bold"
                      >
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => removeSkill(index)} 
                          className="text-indigo-650 hover:text-indigo-900 rounded-full hover:bg-indigo-100 p-0.5 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-slate-450 text-xs italic font-semibold">No skills listed. Type a skill below to add.</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="e.g. React, Python, SQL, C++"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-4 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Resume File Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">
                    Resume Upload
                  </label>
                  <div className="border border-dashed border-slate-250 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center gap-3">
                    {resumeName ? (
                      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl max-w-sm w-full">
                        <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-lg">
                          <FileCheck className="h-6 w-6" />
                        </div>
                        <div className="text-left truncate flex-1">
                          <span className="text-sm font-bold text-slate-800 block truncate">{resumeName}</span>
                          {resumeUrl && (
                            <a 
                              href={resumeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-850 transition hover:underline font-bold"
                            >
                              View Resume
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white border border-slate-200 rounded-full text-slate-450 shadow-sm">
                          <FileUp className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-700 block">Upload PDF or DOCX file</span>
                          <span className="text-xs text-slate-500 font-semibold">Max size allowed is 5MB</span>
                        </div>
                      </>
                    )}

                    <label className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition active:scale-98 shadow-sm">
                      {uploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>{resumeName ? 'Replace Resume' : 'Browse File'}</>
                      )}
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        disabled={uploading}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-750 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 active:scale-98 shadow-sm"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </form>
            </div>
          ) : (
            /* Bookmarked content lists */
            <div className="space-y-4 animate-in fade-in duration-150 text-left">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-indigo-600" />
                Bookmarked Content
              </h3>

              {bookmarks.length > 0 ? (
                <div className="space-y-3">
                  {bookmarks.map((item) => {
                    let title = 'Saved Item';
                    let type = 'Item';
                    let category = '';
                    let link = '#';

                    if (item.question) {
                      title = item.question.text;
                      type = 'Assessment Question';
                      category = item.question.subCategory.name;
                      link = '/tests';
                    } else if (item.note) {
                      title = item.note.title;
                      type = 'Revision Note';
                      category = item.note.category;
                      link = '/notes';
                    } else if (item.roadmap) {
                      title = item.roadmap.title;
                      type = 'Learning Roadmap';
                      category = 'Roadmap';
                      link = '/roadmaps';
                    } else if (item.experience) {
                      title = `${item.experience.company.name} (${item.experience.role})`;
                      type = 'Interview Experience';
                      category = item.experience.difficulty;
                      link = '/interview-experiences';
                    }

                    return (
                      <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 hover:shadow-sm transition">
                        <div className="space-y-1 truncate text-left">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full w-fit block">
                            {type}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug truncate pr-6">{title}</h4>
                          <span className="text-[10px] text-slate-450 font-bold uppercase">{category}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={link}
                            className="p-2 bg-white border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-650 rounded-lg text-slate-500 transition"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleRemoveBookmark(item)}
                            className="p-2 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-150 text-slate-450 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-slate-250 rounded-2xl bg-white">
                  <span className="text-slate-450 text-sm italic font-semibold">You have no bookmarked questions, revision notes, or roadmaps.</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
