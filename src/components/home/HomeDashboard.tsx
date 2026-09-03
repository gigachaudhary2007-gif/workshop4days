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
  Headphones,
  Calendar,
  Volume2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppView, User, DoubtRecord, AnalyzedNoteRecord, NewsArticle, StudentNotebookNote } from '../../types';
import { Button } from '../ui/Button';
import { InteractiveStudyFolder, StudyFolderData } from '../ui/InteractiveStudyFolder';
import { StudyFolderModal } from '../notebook/StudyFolderModal';
import { AnimatedEmojiButton } from '../ui/AnimatedEmojiButton';

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
  const primaryCards = [
    {
      id: 'doubt-solver' as AppView,
      title: 'Solve a Doubt',
      description: 'Upload or type a question and get a clear, step-by-step AI explanation.',
      icon: <HelpCircle className="w-5 h-5 text-[#16835B]" />,
      badge: 'Step-by-Step AI',
      color: 'bg-emerald-100/70 border-emerald-200/80 text-[#16835B]',
      actionText: 'Ask Doubt',
    },
    {
      id: 'ai-notes' as AppView,
      title: 'AI Notes & Audio Teach',
      description: 'Generate structured revision notes with voice-narrated chapter audio lessons.',
      icon: <FileText className="w-5 h-5 text-[#16835B]" />,
      badge: 'Audio Teach & Notes',
      color: 'bg-emerald-100/70 border-emerald-200/80 text-[#16835B]',
      actionText: 'Analyze Notes',
    },
    {
      id: 'news-paper' as AppView,
      title: 'News Paper & Audio Digest',
      description: 'Student journalism with Hindi/English language setting and voice narration.',
      icon: <Newspaper className="w-5 h-5 text-[#16835B]" />,
      badge: 'Hindi / Eng & Audio',
      color: 'bg-emerald-100/70 border-emerald-200/80 text-[#16835B]',
      actionText: 'Read News Paper',
    },
    {
      id: 'my-notes' as AppView,
      title: 'My Notes',
      description: 'Write, draw, organize personal notes with AI visual concept graphs.',
      icon: <BookOpen className="w-5 h-5 text-[#16835B]" />,
      badge: 'Digital Canvas',
      color: 'bg-emerald-100/70 border-emerald-200/80 text-[#16835B]',
      actionText: 'Open Notebook',
    },
  ];

  const [selectedFolderForModal, setSelectedFolderForModal] = useState<StudyFolderData | null>(null);

  const studyFolders: StudyFolderData[] = [
    {
      id: 'folder-physics',
      name: 'AP Physics & Mechanics',
      subject: 'Physics',
      description: 'Kinematics, rotational dynamics, momentum conservation & harmonic motion.',
      theme: 'emerald',
      noteCount: notebookNotes.filter((n) => n.subject === 'Physics').length || 4,
      recentTopics: ['Rotational Torque', 'Newtonian Gravity', 'Oscillations'],
    },
    {
      id: 'folder-chemistry',
      name: 'Organic Chemistry & Biomolecules',
      subject: 'Chemistry',
      description: 'Reaction mechanisms, SN1/SN2 pathways, chirality & enzyme kinetics.',
      theme: 'emerald',
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
      recentTopics: ["L'Hôpital Rule", 'Partial Derivatives', 'Vector Fields'],
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
    <div className="space-y-8 pb-16">
      {/* Top Welcome Header - Liquid Glass with Greeting & Learning Streak */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[28px] liquid-glass-card">
        <div>
          {/* Animated Emoji Button for Vishal */}
          <div className="mb-2 sm:mb-3.5">
            <AnimatedEmojiButton
              emoji="👋"
              label={`Hey ${user.name.split(' ')[0] || 'Vishal'}!`}
              variant="light"
              size="md"
              showWavingArcs={true}
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#171A18] tracking-tight">
            What do you want to learn today?
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#5F6762] mt-1 sm:mt-1.5 font-medium max-w-xl">
            Continue your personalized study plan, solve doubts, and review today's lessons.
          </p>
        </div>

        {/* Learning Streak Liquid Glass Card (from reference screenshot) */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/90 shadow-[0_4px_20px_rgba(22,131,91,0.06)] w-full md:w-auto md:min-w-[260px]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#16835B] to-[#10E862] flex items-center justify-center text-white shadow-[0_4px_12px_rgba(22,131,91,0.25)]">
                <Flame className="w-4 h-4 text-white fill-white/20" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#171A18]">Learning Streak</p>
                <p className="text-[10px] text-[#5F6762]">Consistent practice</p>
              </div>
            </div>
            <span className="text-base sm:text-lg font-black text-[#16835B]">
              {user.streakDays || 5} Days
            </span>
          </div>

          {/* Smooth emerald progress bar */}
          <div className="w-full h-2 bg-emerald-100/70 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-gradient-to-r from-[#16835B] to-[#10E862] rounded-full transition-all duration-500"
              style={{ width: '72%' }}
            />
          </div>
          <p className="text-[10px] text-[#89918C] font-semibold text-right">
            2 days to reach weekly goal
          </p>
        </div>
      </div>

      {/* 4 Core Pillars / Feature Cards (Liquid Glass Effect with Subtle Refraction) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#171A18] tracking-tight">Core Study Tools</h2>
          <span className="text-xs text-[#89918C] font-semibold">Select a tool to begin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {primaryCards.map((card) => (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="liquid-glass-card rounded-[24px] p-5 sm:p-6 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color} shadow-2xs transition-transform duration-300 group-hover:scale-108`}>
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/80 text-[#16835B] border border-emerald-100/80 shadow-2xs">
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-[#5F6762] mt-2 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Action Button: Pill with Arrow */}
              <div className="mt-6 pt-3.5 border-t border-white/80 flex items-center justify-between text-xs font-bold text-[#16835B]">
                <span>{card.actionText}</span>
                <div className="w-7 h-7 rounded-full bg-white/80 border border-emerald-200/70 flex items-center justify-center shadow-2xs group-hover:bg-[#16835B] group-hover:text-white transition-all">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Audio Teach & Guided Voice Lessons Banner (Deep Emerald Glass) */}
      <section className="bg-gradient-to-r from-[#0F1612]/95 via-[#152019]/95 to-[#121B15]/95 backdrop-blur-2xl rounded-[28px] p-6 sm:p-8 border border-emerald-500/20 text-white shadow-xl relative overflow-hidden">
        {/* Ambient liquid glow behind dark glass */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#16835B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#10E862]/20 text-[#10E862] border border-[#10E862]/30 backdrop-blur-xs">
                Audio Teach & Lecture
              </span>
              <span className="text-xs text-[#89918C] flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-[#10E862]" /> Spoken Lessons & Analysis
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Listen to AI Spoken Lessons & Daily Newspaper Briefings
            </h3>
            <p className="text-xs sm:text-sm text-[#89918C] leading-relaxed">
              Listen to interactive spoken lectures from your study notes or switch between English and Hindi on today's student news paper with adjustable speed and chapter markers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('ai-notes')}
              leftIcon={<Volume2 className="w-4 h-4" />}
              className="shadow-[0_4px_16px_rgba(22,131,91,0.35)] w-full sm:w-auto justify-center min-h-[44px]"
            >
              Play Notes Lecture
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => onNavigate('news-paper')}
              className="border-[#2B3B30] text-emerald-300 hover:bg-white/10 w-full sm:w-auto justify-center min-h-[44px]"
            >
              Open Hindi / English News
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Study Folders */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16835B] animate-pulse" />
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

        {/* 4-col responsive Folder cards */}
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
        {/* Left 2 Cols: Recent Doubts & Structured Study Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Doubts Liquid Glass Container */}
          <div className="liquid-glass-card rounded-[24px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-[#16835B] flex items-center justify-center border border-emerald-200/70 shadow-2xs">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">Recent Doubts</h3>
              </div>
              <button
                onClick={() => onNavigate('doubt-solver')}
                className="text-xs font-bold text-[#16835B] hover:text-[#0F6246] flex items-center gap-1 cursor-pointer"
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
                  className="p-3.5 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-[#16835B] border border-emerald-200/60">
                          {doubt.subject}
                        </span>
                        <span className="text-[11px] text-[#89918C] flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" /> {doubt.timestamp}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-1">
                        {doubt.question}
                      </p>
                      {doubt.solution && (
                        <p className="text-xs text-[#5F6762] line-clamp-1 mt-1 font-normal">
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

          {/* Structured Study Notes Liquid Glass Container */}
          <div className="liquid-glass-card rounded-[24px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-[#16835B] flex items-center justify-center border border-emerald-200/70 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">Structured Study Notes</h3>
              </div>
              <button
                onClick={() => onNavigate('ai-notes')}
                className="text-xs font-bold text-[#16835B] hover:text-[#0F6246] flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {recentNotes.slice(0, 2).map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    onOpenNote(note);
                    onNavigate('ai-notes');
                  }}
                  className="p-4 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16835B] border border-emerald-200/60">
                        {note.subject}
                      </span>
                      <span className="text-[11px] text-[#89918C] font-medium">{note.createdAt}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors line-clamp-1">
                      {note.title}
                    </h4>
                    <p className="text-xs text-[#5F6762] line-clamp-2 mt-1 leading-relaxed">
                      {note.summary}
                    </p>
                  </div>
                  <div className="mt-3.5 pt-2.5 border-t border-white/80 flex items-center justify-between text-[11px] font-semibold text-[#16835B]">
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
          <div className="liquid-glass-card rounded-[24px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-[#16835B] flex items-center justify-center border border-emerald-200/70 shadow-2xs">
                  <Newspaper className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171A18]">News Paper Updates</h3>
              </div>
              <button
                onClick={() => onNavigate('news-paper')}
                className="text-xs font-bold text-[#16835B] hover:text-[#0F6246] cursor-pointer"
              >
                Read all
              </button>
            </div>

            <div className="space-y-3.5">
              {featuredNews.slice(0, 3).map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    onOpenArticle(article);
                    onNavigate('news-paper');
                  }}
                  className="p-3.5 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16835B] border border-emerald-200/60">
                      {article.category}
                    </span>
                    <span className="text-[11px] text-[#89918C] font-medium">{article.readTime}</span>
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
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#DCEFE7]/70 to-[#EEF7F3]/70 border border-emerald-200/60 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F6246] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#16835B]" />
                <span>Student Study Principle</span>
              </div>
              <p className="text-xs text-[#171A18] leading-relaxed">
                When learning new theorems, explain the concept out loud in simple terms (The Feynman Technique). If you get stuck, use Doubt Solver to pinpoint the exact gap.
              </p>
            </div>
          </div>

          {/* Quick Shortcuts in Liquid Glass */}
          <div className="liquid-glass-card rounded-[24px] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#89918C] mb-3">
              Quick Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('doubt-solver')}
                className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 hover:border-[#16835B]/40 hover:bg-white text-left transition-all shadow-2xs cursor-pointer"
              >
                <p className="text-xs font-bold text-[#171A18]">Scan Doubt</p>
                <p className="text-[10px] text-[#5F6762]">Photo to solution</p>
              </button>
              <button
                onClick={() => onNavigate('my-notes')}
                className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 hover:border-[#16835B]/40 hover:bg-white text-left transition-all shadow-2xs cursor-pointer"
              >
                <p className="text-xs font-bold text-[#171A18]">Notebook</p>
                <p className="text-[10px] text-[#5F6762]">Draw & revise</p>
              </button>
              <button
                onClick={() => onNavigate('ai-notes')}
                className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 hover:border-[#16835B]/40 hover:bg-white text-left transition-all shadow-2xs cursor-pointer"
              >
                <p className="text-xs font-bold text-[#171A18]">Summary</p>
                <p className="text-[10px] text-[#5F6762]">Cheat-sheets</p>
              </button>
              <button
                onClick={() => onNavigate('news-paper')}
                className="p-3 bg-white/70 backdrop-blur-md rounded-xl border border-white/80 hover:border-[#16835B]/40 hover:bg-white text-left transition-all shadow-2xs cursor-pointer"
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
