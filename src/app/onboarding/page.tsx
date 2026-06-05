'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Target, 
  Building2, 
  Sliders, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';

const TARGET_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Engineer',
  'QA Engineer',
  'DevOps Engineer',
  'Cybersecurity Engineer'
];

const ACADEMIC_STAGES = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Graduate'
];

const TIMELINES = [
  'Within 3 Months',
  'Within 6 Months',
  'Within 12 Months',
  'Just Exploring'
];

const OBJECTIVES = [
  'Placement Preparation',
  'Internship Preparation',
  'Career Switch',
  'Higher Studies'
];

const COMPANIES = [
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Capgemini',
  'Cognizant',
  'Deloitte',
  'IBM',
  'Amazon',
  'Microsoft',
  'Google'
];

const SKILL_DOMAINS = [
  'Aptitude',
  'Reasoning',
  'Verbal',
  'DSA',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
  'SQL',
  'Communication'
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Form states
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [academicStage, setAcademicStage] = useState('4th Year');
  const [timeline, setTimeline] = useState('Within 6 Months');
  const [objective, setObjective] = useState('Placement Preparation');
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<{ [skill: string]: number }>(
    SKILL_DOMAINS.reduce((acc, skill) => ({ ...acc, [skill]: 5 }), {})
  );

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.user) {
          router.push('/login');
          return;
        }
        if (data.user.profile?.onboardingProfile?.completedOnboarding) {
          router.push('/dashboard');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingSession(false);
      }
    };
    checkUser();
  }, [router]);

  const handleCompanyToggle = (company: string) => {
    setTargetCompanies(prev => 
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const handleConfidenceChange = (skill: string, val: number) => {
    setConfidence(prev => ({
      ...prev,
      [skill]: val
    }));
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          academicStage,
          timeline,
          objective,
          targetCompanies,
          confidence
        })
      });

      if (res.ok) {
        router.push('/baseline-info');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save onboarding details');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const stepIcons = [
    <Briefcase className="h-5 w-5" />,
    <GraduationCap className="h-5 w-5" />,
    <Calendar className="h-5 w-5" />,
    <Target className="h-5 w-5" />,
    <Building2 className="h-5 w-5" />,
    <Sliders className="h-5 w-5" />
  ];

  const stepTitles = [
    "Target Career Role",
    "Academic Stage",
    "Placement Timeline",
    "Career Objective",
    "Target Companies",
    "Skill Confidence Survey"
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-4">
        
        {/* PlacementHub Logo */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-full text-xs font-bold shadow-sm">
          <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>Placement Intelligence Profile Builder</span>
        </div>
        
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Let's align your career targets
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
          Answer a few questions to personalize your placement readiness checklist and learning roadmaps.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-xl rounded-2xl sm:px-10 relative overflow-hidden">
          
          {/* Progress bar indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          {/* Step Header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
              {stepIcons[currentStep - 1]}
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Step {currentStep} of 6</span>
              <h3 className="font-extrabold text-slate-800 text-md">{stepTitles[currentStep - 1]}</h3>
            </div>
          </div>

          {/* STEP CONTENT WIZARD */}
          <div className="min-h-[260px] flex flex-col justify-center py-2">
            
            {/* Step 1: Target Role */}
            {currentStep === 1 && (
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select your primary placement role:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TARGET_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => setTargetRole(role)}
                      className={`p-3.5 text-xs font-bold rounded-xl border text-left transition ${
                        targetRole === role
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Academic Stage */}
            {currentStep === 2 && (
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select your current academic stage:</label>
                <div className="space-y-3">
                  {ACADEMIC_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setAcademicStage(stage)}
                      className={`w-full p-4 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition ${
                        academicStage === stage
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      <span>{stage}</span>
                      {academicStage === stage && <Check className="h-4 w-4 text-indigo-650" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Placement Timeline */}
            {currentStep === 3 && (
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">When do you expect to start interviewing?</label>
                <div className="space-y-3">
                  {TIMELINES.map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeline(time)}
                      className={`w-full p-4 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition ${
                        timeline === time
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      <span>{time}</span>
                      {timeline === time && <Check className="h-4 w-4 text-indigo-650" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Objective */}
            {currentStep === 4 && (
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What is your primary career goal right now?</label>
                <div className="space-y-3">
                  {OBJECTIVES.map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setObjective(obj)}
                      className={`w-full p-4 text-xs font-bold rounded-xl border text-left flex items-center justify-between transition ${
                        objective === obj
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-350'
                      }`}
                    >
                      <span>{obj}</span>
                      {objective === obj && <Check className="h-4 w-4 text-indigo-650" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Target Companies */}
            {currentStep === 5 && (
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select target companies (select multiple):</label>
                <span className="text-[10px] text-slate-450 block font-semibold mb-3">This configures your target readiness thresholds</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COMPANIES.map((company) => {
                    const selected = targetCompanies.includes(company);
                    return (
                      <button
                        key={company}
                        type="button"
                        onClick={() => handleCompanyToggle(company)}
                        className={`p-3 text-center text-xs font-bold rounded-xl border transition ${
                          selected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-750 font-black shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {company}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Skill Confidence Survey */}
            {currentStep === 6 && (
              <div className="space-y-4 text-left max-h-[350px] overflow-y-auto pr-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Rate your confidence in each topic (1 to 10):</label>
                <span className="text-[10px] text-slate-450 block font-semibold mb-3">Used purely to diagnostic comparison against test scores</span>
                <div className="space-y-3.5">
                  {SKILL_DOMAINS.map((skill) => (
                    <div key={skill} className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-700">{skill}</span>
                        <span className="text-indigo-650 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px]">
                          {confidence[skill]} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={confidence[skill]}
                        onChange={(e) => handleConfidenceChange(skill, parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1 transition ${
                currentStep === 1
                  ? 'border-slate-150 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentStep === 6 ? (
                <>
                  Complete Onboarding
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
