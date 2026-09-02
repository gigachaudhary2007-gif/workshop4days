import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  Newspaper,
  BookOpen,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Compass,
  FolderKanban,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView, User, DoubtRecord, AnalyzedNoteRecord, NewsArticle, StudentNotebookNote } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { InteractiveStudyFolder, StudyFolderData } from '../ui/InteractiveStudyFolder';
import { StudyFolderModal } from '../notebook/StudyFolderModal';
import { SegmentedControl } from '../ui/SegmentedControl';
import { MorphingButton } from '../ui/MorphingButton';
import { useSound } from '../../context/SoundContext';

interface HomeDashboardProps {
  user: User;
  onNavigate: (view: AppView) => void;
  recentDoubts: DoubtRecord[];
  recentNotes: AnalyzedNoteRecord[];
  featuredNews: NewsArticle[];
  notebookNotes: StudentNotebookNote[];
  onOpenDoubt: (doubt: DoubtRecord) => void;
  onOpenNote: (note: AnalyzedNoteRecord) => void;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenNotebookNote?: (note: StudentNotebookNote) => void;
  onCreateNoteInSubject?: (subject: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  onNavigate,
  recentDoubts,
  recentNotes,
  featuredNews,
  notebookNotes,
  onOpenDoubt,
  onOpenNote,
  onOpenArticle,
  onOpenNotebookNote,
  onCreateNoteInSubject,
}) => {
  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 17) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const primaryCards = [
    {
      id: 'doubt-solver' as AppView,
      title: 'Solve a Doubt',
      description: 'Upload or type a question and get a clear, step-by-step AI explanation.',
      icon: <HelpCircle className="w-6 h-6" />,
      badge: 'Step-by-Step AI',
      color: 'bg-emerald-50 text-[#16835B] border-emerald-100',
      actionText: 'Ask Doubt',
    },
    {
      id: 'ai-notes' as AppView,
      title: 'AI Notes',
      description: 'Turn handwritten notes and study material into structured revision notes.',
      icon: <FileText className="w-6 h-6" />,
      badge: 'Smart Extraction',
      color: 'bg-emerald-50/70 text-[#16835B] border-emerald-100',
      actionText: 'Analyze Notes',
    },
    {
      id: 'news-paper' as AppView,
      title: 'News Paper',
      description: 'Stay updated with useful educational, science, space, and student news.',
      icon: <Newspaper className="w-6 h-6" />,
      badge: 'Daily Student Edition',
      color: 'bg-[#F4F5F1] text-[#171A18] border-[#E1E5E1]',
      actionText: 'Read News Paper',
    },
    {
      id: 'my-notes' as AppView,
      title: 'My Notes',
      description: 'Write, draw, organize personal notes with AI visual concept graphs.',
      icon: <BookOpen className="w-6 h-6" />,
      badge: 'Digital Canvas',
      color: 'bg-[#F4F5F1] text-[#171A18] border-[#E1E5E1]',
      actionText: 'Open Notebook',
    },
  ];

  // Folders matching video aesthetic & micro-interactions
  const [selectedFolderForModal, setSelectedFolderForModal] = useState<StudyFolderData | null>(null);
  const [recentActivityTab, setRecentActivityTab] = useState<'all' | 'doubts' | 'notes'>('all');

  const studyFolders: StudyFolderData[] = [
    {
      id: 'folder-physics',
      name: 'AP Physics & Mechanics',
      subject: 'Physics',
      description: 'Kinematics, rotational dynamics, momentum conservation & harmonic motion.',
      theme: 'lime', // matches electric lime card in video with the circular plus button!
      noteCount: notebookNotes.filter((n) => n.subject === 'Physics').length || 4,
      recentTopics: ['Rotational Torque', 'Newtonian Gravity', 'Oscillations'],
    },
    {
      id: 'folder-chemistry',
      name: 'Organic Chemistry & Biomolecules',
      subject: 'Chemistry',
      description: 'Reaction mechanisms, SN1/SN2 pathways, chirality & enzyme kinetics.',
      theme: 'violet', // matches the royal purple card in video with the rotating multi-card fan!
      noteCount: notebookNotes.filter((n) => n.subject === 'Chemistry').length || 6,
      recentTopics: ['Nucleophiles', 'Carbonyl Additions', 'Thermodynamics'],
    },
    {
      id: 'folder-calculus',
      name: 'Advanced Calculus & Limits',
      subject: 'Mathematics',
      description: 'Taylor series approximations, multivariable gradients, and double integrals.',
      theme: 'emerald',
      noteCount: notebookNotes.filter((n) => n.subject === 'Mathematics').length || 8,
      recentTopics: ['L\'Hôpital Rule', 'Partial Derivatives', 'Vector Fields'],
    },
    {
      id: 'folder-history',
      name: 'World History & Modern Civics',
      subject: 'General',
      description: 'Constitutional jurisprudence, macroeconomic shifts & geopolitical treaties.',
      theme: 'dark',
      noteCount: notebookNotes.filter((n) => n.subject === 'General' || n.subject === 'History').length || 3,
      recentTopics: ['Treaty of Versailles', 'Federal Reserve', 'Enlightenment'],
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/60 via-white to-[#F8F9F6] p-6 sm:p-8 rounded-3xl border border-[#E1E5E1] shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-[#0F6246] border border-emerald-200/60 mb-2.5">
            <Sparkles className="w-3.5 h-3.5" /> Study to Shine Mentorship
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A18] tracking-tight">
            {getGreeting()} <span className="font-semibold text-[#5F6762] text-xl sm:text-2xl">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm sm:text-base text-[#5F6762] mt-1 font-normal">
            What do you want to learn today?
          </p>
        </div>

        {/* Quick Study Metrics */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="bg-white px-4 py-3 rounded-2xl border border-[#E1E5E1] shadow-2xs text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-[#16835B]">
              <Flame className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
              <span className="text-lg font-black text-[#171A18]">{user.streakDays || 5}</span>
            </div>
            <p className="text-[11px] font-semibold text-[#89918C] uppercase tracking-wider mt-0.5">
              Day Streak
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-2xl border border-[#E1E5E1] shadow-2xs text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-[#16835B]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-lg font-black text-[#171A18]">{recentDoubts.length + 4}</span>
            </div>
            <p className="text-[11px] font-semibold text-[#89918C] uppercase tracking-wider mt-0.5">
              Doubts Solved
            </p>
          </div>

          <div className="bg-white px-4 py-3 rounded-2xl border border-[#E1E5E1] shadow-2xs text-center min-w-[90px]">
            <div className="flex items-center justify-center gap-1 text-[#16835B]">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-lg font-black text-[#171A18]">92%</span>
            </div>
            <p className="text-[11px] font-semibold text-[#89918C] uppercase tracking-wider mt-0.5">
              Mastery Pace
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars / Feature Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#171A18] tracking-tight">Core Study Tools</h2>
          <span className="text-xs text-[#89918C] font-medium">Select a tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {primaryCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="bg-white rounded-2xl border border-[#E1E5E1] p-5 hover:border-[#16835B]/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${card.color} transition-transform group-hover:scale-105`}>
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F4F5F1] text-[#5F6762] border border-[#E1E5E1]">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-[#5F6762] mt-1.5 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E1E5E1] flex items-center justify-between text-xs font-semibold text-[#16835B]">
                <span>{card.actionText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Study Folders (Styled & Animated directly as in user video) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10E862] animate-pulse" />
              <h2 className="text-lg sm:text-xl font-extrabold text-[#171A18] tracking-tight">
                Interactive Study Folders
              </h2>
            </div>
            <p className="text-xs text-[#5F6762] mt-0.5 font-medium">
              Click any folder to open its study deck, fan out note sheets, or spin the action button.
            </p>
          </div>

          <button
            onClick={() => onNavigate('my-notes')}
            className="text-xs font-bold text-[#16835B] hover:text-[#0F6246] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Open All in Notebook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2x2 or 4-col responsive Folder cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {studyFolders.map((folder) => (
            <InteractiveStudyFolder
              key={folder.id}
              folder={folder}
              notes={notebookNotes}
              onOpenFolder={(f) => setSelectedFolderForModal(f)}
              onQuickAdd={(f) => {
                if (onCreateNoteInSubject) {
                  onCreateNoteInSubject(f.subject);
                } else {
                  setSelectedFolderForModal(f);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Two Column Layout: Recent Activity & Educational News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Doubts & Recent Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Doubts */}
          <div className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16835B] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">Recent Doubts</h3>
              </div>
              <button
                onClick={() => onNavigate('doubt-solver')}
                className="text-xs font-semibold text-[#16835B] hover:text-[#0F6246] flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentDoubts.slice(0, 3).map((doubt) => (
                <div
                  key={doubt.id}
                  onClick={() => {
                    onOpenDoubt(doubt);
                    onNavigate('doubt-solver');
                  }}
                  className="p-3.5 rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/30 hover:bg-[#F8F9F6] transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#16835B] border border-emerald-100">
                          {doubt.subject}
                        </span>
                        <span className="text-[11px] text-[#89918C] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {doubt.timestamp}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-1">
                        {doubt.question}
                      </p>
                      {doubt.solution && (
                        <p className="text-xs text-[#5F6762] line-clamp-1 mt-1">
                          {doubt.solution.finalAnswer}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#89918C] group-hover:text-[#16835B] shrink-0 self-center" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Created AI Notes & Notebook Pages */}
          <div className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16835B] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">Structured Study Notes</h3>
              </div>
              <button
                onClick={() => onNavigate('ai-notes')}
                className="text-xs font-semibold text-[#16835B] hover:text-[#0F6246] flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentNotes.slice(0, 2).map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    onOpenNote(note);
                    onNavigate('ai-notes');
                  }}
                  className="p-4 rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/30 hover:bg-[#F8F9F6] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4F5F1] text-[#171A18] border border-[#E1E5E1]">
                        {note.subject}
                      </span>
                      <span className="text-[11px] text-[#89918C]">{note.createdAt}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-1">
                      {note.title}
                    </h4>
                    <p className="text-xs text-[#5F6762] line-clamp-2 mt-1 leading-relaxed">
                      {note.summary}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#E1E5E1] flex items-center justify-between text-[11px] font-medium text-[#16835B]">
                    <span>{note.data.formulas.length} formulas &bull; {note.data.importantQuestions.length} practice Qs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Educational Updates from News Paper */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E1E5E1] p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#16835B] flex items-center justify-center">
                  <Newspaper className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">News Paper Updates</h3>
              </div>
              <button
                onClick={() => onNavigate('news-paper')}
                className="text-xs font-semibold text-[#16835B] hover:text-[#0F6246]"
              >
                Read all
              </button>
            </div>

            <div className="space-y-4">
              {featuredNews.slice(0, 3).map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    onOpenArticle(article);
                    onNavigate('news-paper');
                  }}
                  className="p-3.5 rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/30 hover:bg-[#F8F9F6] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16835B] border border-emerald-100">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-[#89918C]">{article.readTime}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-[11px] text-[#5F6762] line-clamp-2 mt-1 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              ))}
            </div>

            {/* Daily study tip */}
            <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16835B]" />
                <span>Student Study Principle</span>
              </div>
              <p className="text-xs text-[#171A18] leading-relaxed">
                When learning new theorems, explain the concept out loud in simple terms (The Feynman Technique). If you get stuck, use Doubt Solver to pinpoint the exact gap.
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#F8F9F6] rounded-2xl border border-[#E1E5E1] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#89918C] mb-3">
              Quick Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('doubt-solver')}
                className="p-2.5 bg-white rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/40 text-left transition-all hover:bg-emerald-50/40"
              >
                <p className="text-xs font-bold text-[#171A18]">Scan Doubt</p>
                <p className="text-[10px] text-[#5F6762]">Photo to solution</p>
              </button>
              <button
                onClick={() => onNavigate('my-notes')}
                className="p-2.5 bg-white rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/40 text-left transition-all hover:bg-emerald-50/40"
              >
                <p className="text-xs font-bold text-[#171A18]">Notebook</p>
                <p className="text-[10px] text-[#5F6762]">Draw & revise</p>
              </button>
              <button
                onClick={() => onNavigate('ai-notes')}
                className="p-2.5 bg-white rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/40 text-left transition-all hover:bg-emerald-50/40"
              >
                <p className="text-xs font-bold text-[#171A18]">Summary</p>
                <p className="text-[10px] text-[#5F6762]">Cheat-sheets</p>
              </button>
              <button
                onClick={() => onNavigate('news-paper')}
                className="p-2.5 bg-white rounded-xl border border-[#E1E5E1] hover:border-[#16835B]/40 text-left transition-all hover:bg-emerald-50/40"
              >
                <p className="text-xs font-bold text-[#171A18]">Daily News</p>
                <p className="text-[10px] text-[#5F6762]">Student brief</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Study Folder Modal Explorer */}
      <StudyFolderModal
        folder={selectedFolderForModal}
        notes={notebookNotes}
        isOpen={Boolean(selectedFolderForModal)}
        onClose={() => setSelectedFolderForModal(null)}
        onSelectNote={(note) => {
          setSelectedFolderForModal(null);
          if (onOpenNotebookNote) {
            onOpenNotebookNote(note);
          } else {
            onNavigate('my-notes');
          }
        }}
        onCreateNoteInFolder={(folderName, subject) => {
          setSelectedFolderForModal(null);
          if (onCreateNoteInSubject) {
            onCreateNoteInSubject(subject);
          } else {
            onNavigate('my-notes');
          }
        }}
      />
    </div>
  );
};
