import React, { useState } from 'react';
import { User, Settings, Shield, Bell, BookOpen, Sparkles, Check, Flame, Trash2 } from 'lucide-react';
import { User as UserType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';

interface SettingsViewProps {
  user: UserType;
  onUpdateUser: (updated: UserType) => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onResetData,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [gradeLevel, setGradeLevel] = useState(user.gradeLevel || 'High School Senior');
  const [studyGoalHours, setStudyGoalHours] = useState(user.studyGoalHours || 3);
  const [aiTuning, setAiTuning] = useState<'socratic' | 'concise' | 'exam-prep'>('socratic');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserType = {
      ...user,
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      gradeLevel,
      studyGoalHours,
    };
    onUpdateUser(updated);
    showToast('Profile and study preferences updated!');
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Top Header */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#0F6246] border border-emerald-100 mb-2">
          <Settings className="w-3.5 h-3.5 text-[#16835B]" /> Account & Study Preferences
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#5F6762] mt-1">
          Customize your student profile, daily study targets, and AI mentorship style.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#E1E5E1] p-6 sm:p-7 shadow-2xs space-y-5">
          <h3 className="text-base font-bold text-[#171A18] border-b border-[#E1E5E1] pb-3">
            Student Profile
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#16835B] font-bold text-lg flex items-center justify-center border border-emerald-200 overflow-hidden shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#171A18]">{user.name}</h4>
              <p className="text-xs text-[#5F6762]">{user.email}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold text-[#16835B]">
                Active Student Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Student Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-grade-level" className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                Grade / Academic Stage
              </label>
              <select
                id="settings-grade-level"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full text-xs font-medium text-[#171A18] bg-white border border-[#E1E5E1] rounded-xl px-3 py-2.5 outline-none focus:border-[#16835B]"
              >
                <option value="Middle School">Middle School</option>
                <option value="High School Freshman (Grade 9)">High School Freshman (Grade 9)</option>
                <option value="High School Sophomore (Grade 10)">High School Sophomore (Grade 10)</option>
                <option value="High School Junior (Grade 11)">High School Junior (Grade 11)</option>
                <option value="High School Senior (Grade 12)">High School Senior (Grade 12)</option>
                <option value="Undergraduate College">Undergraduate College</option>
                <option value="Competitive Exam Aspirant">Competitive Exam Aspirant (SAT, AP, Olympiad)</option>
              </select>
            </div>

            <div>
              <label htmlFor="settings-daily-target" className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-1.5">
                Daily Study Target
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="settings-daily-target"
                  type="range"
                  min={1}
                  max={8}
                  value={studyGoalHours}
                  onChange={(e) => setStudyGoalHours(Number(e.target.value))}
                  className="flex-1 accent-[#16835B]"
                />
                <span className="text-xs font-bold text-[#16835B] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 min-w-[65px] text-center">
                  {studyGoalHours} hrs/day
                </span>
              </div>
            </div>
          </div>

          {/* AI Mentorship Personality Setting */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#5F6762] uppercase tracking-wider mb-2">
              AI Mentorship Teaching Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'socratic',
                  label: 'Socratic & Conceptual',
                  desc: 'Emphasizes first-principles understanding and deep intuition.',
                },
                {
                  id: 'concise',
                  label: 'Concise & Direct',
                  desc: 'Bullet points, immediate solutions, formulas upfront.',
                },
                {
                  id: 'exam-prep',
                  label: 'Exam Prep Focused',
                  desc: 'Step-by-step marking rubrics, common pitfalls, exam tips.',
                },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setAiTuning(style.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    aiTuning === style.id
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                      : 'bg-white border-[#E1E5E1] hover:bg-[#F8F9F6]'
                  }`}
                >
                  <p className="text-xs font-bold text-[#171A18]">{style.label}</p>
                  <p className="text-[11px] text-[#5F6762] mt-1 leading-relaxed">{style.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit">
              Save Preferences
            </Button>
          </div>
        </form>

        {/* Danger / Reset Data */}
        <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Account Session & Data Management
          </h3>
          <p className="text-xs text-[#5F6762]">
            Need to clear recent session state or start fresh with sample doubts and notes?
          </p>
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetData}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
            >
              Reset Session Data
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-rose-600 hover:bg-rose-50"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
