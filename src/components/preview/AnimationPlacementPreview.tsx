import React from 'react';
import { HomeDashboard } from '../home/HomeDashboard';
import { User, DoubtRecord, AnalyzedNoteRecord, NewsArticle, StudentNotebookNote, AppView } from '../../types';
import { CheckCircle, Bell, Moon } from 'lucide-react';

interface AnimationPlacementPreviewProps {
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

export const AnimationPlacementPreview: React.FC<AnimationPlacementPreviewProps> = (props) => {
  return (
    <div className="space-y-6">
      {/* Evening Announcement Banner - Approved */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-900/90 via-[#0F6246]/90 to-emerald-800/90 text-white backdrop-blur-xl border border-emerald-400/40 shadow-[0_8px_30px_rgba(22,131,91,0.18)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-inner shrink-0">
            <Moon className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-100 flex items-center gap-1">
                <Bell className="w-3 h-3" />
                Evening Announcement
              </span>
              <span className="text-xs text-emerald-100/80 font-medium hidden md:inline">
                3D Knowledge Core &bull; Approved
              </span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5">
              Approved &bull; 3D Knowledge Core animation is active in the sidebar, seamlessly filling the vertical space down to Vishal Patel with no excess whitespace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1 rounded-xl bg-emerald-500/30 border border-emerald-300/40 text-xs font-bold text-emerald-100 flex items-center gap-1.5 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-[#10E862]" />
            <span>Approved</span>
          </div>
        </div>
      </div>

      {/* Unchanged Home Dashboard */}
      <HomeDashboard {...props} />
    </div>
  );
};
