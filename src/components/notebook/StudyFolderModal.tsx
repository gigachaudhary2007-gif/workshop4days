import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Folder,
  Plus,
  BookOpen,
  Sparkles,
  Search,
  Pin,
  Calendar,
  ChevronRight,
  Share2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { StudyFolderData } from '../ui/InteractiveStudyFolder';
import { StudentNotebookNote } from '../../types';
import { useSound } from '../../context/SoundContext';
import { MorphingButton } from '../ui/MorphingButton';

interface StudyFolderModalProps {
  folder: StudyFolderData | null;
  notes: StudentNotebookNote[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: StudentNotebookNote) => void;
  onCreateNoteInFolder: (folderName: string, subject: string) => void;
}

export const StudyFolderModal: React.FC<StudyFolderModalProps> = ({
  folder,
  notes,
  isOpen,
  onClose,
  onSelectNote,
  onCreateNoteInFolder,
}) => {
  const { playPop, playWhoosh, playSuccess } = useSound();
  const [searchTerm, setSearchTerm] = useState('');

  if (!folder || !isOpen) return null;

  // Filter notes that belong to this subject or folder
  const folderNotes = notes.filter((n) => {
    const matchesSubject =
      n.subject.toLowerCase() === folder.subject.toLowerCase() ||
      n.subject.toLowerCase() === folder.name.toLowerCase() ||
      n.folder?.toLowerCase() === folder.name.toLowerCase() ||
      n.tags?.some((t) => t.toLowerCase() === folder.subject.toLowerCase());

    const matchesSearch =
      searchTerm.trim() === '' ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.content || n.textContent || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  const handleClose = () => {
    playWhoosh();
    onClose();
  };

  const handleAddNote = () => {
    playPop();
    onCreateNoteInFolder(folder.name, folder.subject);
    onClose();
  };

  const isLime = folder.theme === 'lime';
  const isViolet = folder.theme === 'violet';

  const themeHeader = isLime
    ? 'bg-[#B6FF00] text-[#121915]'
    : isViolet
    ? 'bg-[#5B3A9B] text-white'
    : 'bg-[#16835B] text-white';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E1E5E1] z-10"
        >
          {/* Animated Folder Header (Matching video theme) */}
          <div className={`p-6 sm:p-8 ${themeHeader} relative overflow-hidden`}>
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-black/15 backdrop-blur-md">
                  <Folder className="w-5 h-5" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider opacity-90">
                  {folder.subject} Folder
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{folder.name}</h2>
            <p className="text-sm mt-1 opacity-90 font-medium">{folder.description}</p>

            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-current/20 text-xs font-semibold">
              <span>{folderNotes.length} Document{folderNotes.length === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>Topics: {folder.recentTopics.join(', ')}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Search & Action Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#89918C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter notes in this folder..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-[#F4F5F1] rounded-xl border border-[#E1E5E1] focus:bg-white focus:outline-none focus:border-[#16835B] transition-all"
                />
              </div>

              <MorphingButton
                variant={isLime ? 'lime' : isViolet ? 'violet' : 'emerald'}
                size="sm"
                onClick={handleAddNote}
              >
                New Note in Folder
              </MorphingButton>
            </div>

            {/* Note list */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {folderNotes.length === 0 ? (
                <div className="p-8 text-center bg-[#F8F9F6] rounded-2xl border border-dashed border-[#CBD3CC]">
                  <BookOpen className="w-8 h-8 text-[#89918C] mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[#171A18]">No notes yet in {folder.name}</p>
                  <p className="text-xs text-[#5F6762] mt-1">
                    Click "New Note in Folder" above to draft your first notes or save an AI summary here!
                  </p>
                </div>
              ) : (
                folderNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    whileHover={{ x: 3 }}
                    onClick={() => {
                      playPop();
                      onSelectNote(note);
                      onClose();
                    }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F9F6] hover:bg-emerald-50/50 border border-[#E1E5E1] hover:border-[#16835B]/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {note.isPinned && (
                          <Pin className="w-3.5 h-3.5 text-[#16835B] fill-[#16835B]/20" />
                        )}
                        <h4 className="text-sm font-bold text-[#171A18] group-hover:text-[#16835B] transition-colors truncate">
                          {note.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#5F6762] line-clamp-1 mt-0.5">
                        {(note.content || note.textContent || '').replace(/[#*`_]/g, '')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#89918C] shrink-0">
                      <span>{note.updatedAt || 'Recent'}</span>
                      <ChevronRight className="w-4 h-4 text-[#89918C] group-hover:text-[#16835B] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F8F9F6] border-t border-[#E1E5E1] flex items-center justify-between text-xs text-[#5F6762]">
            <span>Study to Shine Workspace</span>
            <button
              type="button"
              onClick={handleClose}
              className="font-bold text-[#171A18] hover:text-[#16835B] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
