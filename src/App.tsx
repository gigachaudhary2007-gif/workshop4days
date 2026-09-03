import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView, User, DoubtRecord, AnalyzedNoteRecord, NewsArticle, StudentNotebookNote } from './types';
import {
  initialDoubts,
  initialNotes,
  mockNewsArticles,
  initialNotebookNotes,
} from './data/mockData';
import { AuthScreen } from './components/auth/AuthScreen';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { HomeDashboard } from './components/home/HomeDashboard';
import { DoubtSolverView } from './components/doubt/DoubtSolverView';
import { AiNotesView } from './components/notes/AiNotesView';
import { NewsPaperView } from './components/news/NewsPaperView';
import { MyNotesView } from './components/notebook/MyNotesView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastProvider, useToast } from './components/ui/Toast';
import { SoundProvider } from './context/SoundContext';
import { FloatingActionMenu } from './components/ui/FloatingActionMenu';
import { LiquidGlassBackground } from './components/ui/LiquidGlassBackground';
import { onAuthUserChanged, logoutUser, updateUserProfile } from './services/authService';
import {
  createDoubt,
  saveUserAiNote,
  getUserAiNotes,
  deleteUserAiNote,
  logStudyActivity,
} from './services/databaseService';

function AppContent() {
  const { showToast } = useToast();

  // Authentication State with Firebase Persistence
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to Firebase Auth state for seamless session persistence across reloads
  useEffect(() => {
    const unsubscribe = onAuthUserChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Current Navigation View
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Data States (synced with localStorage)
  const [doubts, setDoubts] = useState<DoubtRecord[]>(() => {
    const saved = localStorage.getItem('sts_doubts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialDoubts;
      }
    }
    return initialDoubts;
  });

  const [aiNotes, setAiNotes] = useState<AnalyzedNoteRecord[]>(() => {
    const saved = localStorage.getItem('sts_ai_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialNotes;
      }
    }
    return initialNotes;
  });

  const [notebookNotes, setNotebookNotes] = useState<StudentNotebookNote[]>(() => {
    const saved = localStorage.getItem('sts_notebook');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialNotebookNotes;
      }
    }
    return initialNotebookNotes;
  });

  // Cross-view selection handoffs
  const [activeDoubt, setActiveDoubt] = useState<DoubtRecord | null>(null);
  const [activeAiNote, setActiveAiNote] = useState<AnalyzedNoteRecord | null>(null);
  const [activeNewsArticle, setActiveNewsArticle] = useState<NewsArticle | null>(null);
  const [activeNotebookNoteId, setActiveNotebookNoteId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('study_to_shine_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('study_to_shine_user');
    }
  }, [currentUser]);

  // User-isolated doubts state & persistence
  useEffect(() => {
    const userDoubtKey = currentUser?.id ? `sts_doubts_${currentUser.id}` : 'sts_doubts_guest';
    const saved = localStorage.getItem(userDoubtKey);
    if (saved) {
      try {
        setDoubts(JSON.parse(saved));
      } catch {
        setDoubts(initialDoubts);
      }
    } else {
      setDoubts(initialDoubts);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const userDoubtKey = currentUser?.id ? `sts_doubts_${currentUser.id}` : 'sts_doubts_guest';
    localStorage.setItem(userDoubtKey, JSON.stringify(doubts));
  }, [doubts, currentUser?.id]);

  // User-isolated AI notes state & persistence with Firestore cloud retrieval
  useEffect(() => {
    const userAiKey = currentUser?.id ? `sts_ai_notes_${currentUser.id}` : 'sts_ai_notes_guest';
    const saved = localStorage.getItem(userAiKey);
    if (saved) {
      try {
        setAiNotes(JSON.parse(saved));
      } catch {
        setAiNotes(initialNotes);
      }
    } else {
      setAiNotes(initialNotes);
    }

    if (currentUser?.id) {
      getUserAiNotes(currentUser.id)
        .then((firestoreNotes) => {
          if (firestoreNotes && firestoreNotes.length > 0) {
            setAiNotes((prev) => {
              const map = new Map<string, AnalyzedNoteRecord>();
              prev.forEach((n) => map.set(n.id, n));
              firestoreNotes.forEach((n) => map.set(n.id, n));
              const merged = Array.from(map.values());
              localStorage.setItem(userAiKey, JSON.stringify(merged));
              return merged;
            });
          }
        })
        .catch((err) => {
          console.warn('Could not sync user AI notes from Firestore:', err);
        });
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const userAiKey = currentUser?.id ? `sts_ai_notes_${currentUser.id}` : 'sts_ai_notes_guest';
    localStorage.setItem(userAiKey, JSON.stringify(aiNotes));
  }, [aiNotes, currentUser?.id]);

  useEffect(() => {
    localStorage.setItem('sts_notebook', JSON.stringify(notebookNotes));
  }, [notebookNotes]);

  // Handlers
  const handleAuthenticate = (user: User) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      localStorage.removeItem('study_to_shine_user');
      showToast('Logged out of Study to Shine');
    } catch (err) {
      console.error('Logout error', err);
      setCurrentUser(null);
    }
  };

  const handleUpdateUser = async (updated: User) => {
    setCurrentUser(updated);
    if (updated.id) {
      await updateUserProfile(updated.id, updated);
    }
  };

  const handleResetData = () => {
    setDoubts(initialDoubts);
    setAiNotes(initialNotes);
    setNotebookNotes(initialNotebookNotes);
    showToast('Session reset to initial demo data');
  };

  const handleSaveDoubt = async (newDoubt: DoubtRecord) => {
    setDoubts((prev) => [newDoubt, ...prev.filter((d) => d.id !== newDoubt.id)]);

    if (currentUser?.id) {
      try {
        await createDoubt(currentUser.id, {
          doubtId: newDoubt.id,
          question: newDoubt.question,
          imageUrl: newDoubt.attachmentName || '',
          answer: newDoubt.solution ? newDoubt.solution.finalAnswer : '',
        });
      } catch (err) {
        console.warn('Could not sync doubt to isolated Firestore:', err);
      }
    }
  };

  const handleSaveAiNote = async (newNote: AnalyzedNoteRecord) => {
    setAiNotes((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);

    if (currentUser?.id) {
      try {
        await saveUserAiNote(currentUser.id, newNote);
        await logStudyActivity(currentUser.id, `AI Notes: ${newNote.title}`);
      } catch (err) {
        console.warn('Could not sync AI note to isolated Firestore:', err);
      }
    }
  };

  const handleDeleteAiNote = async (id: string) => {
    setAiNotes((prev) => prev.filter((n) => n.id !== id));
    if (currentUser?.id) {
      try {
        await deleteUserAiNote(currentUser.id, id);
      } catch (err) {
        console.warn('Could not delete AI note from Firestore:', err);
      }
    }
  };

  const handleSaveNotebookNote = (newNote: StudentNotebookNote) => {
    setNotebookNotes((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
  };

  const handleDeleteNotebookNote = (id: string) => {
    setNotebookNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExportToNotebook = (title: string, content: string, subject: string) => {
    const newNote: StudentNotebookNote = {
      id: 'note-imported-' + Date.now(),
      title,
      subject,
      content,
      tags: ['AI-Imported', subject],
      isPinned: false,
      updatedAt: 'Just now',
    };
    handleSaveNotebookNote(newNote);
  };

  // While restoring auth state from Firebase on page load/refresh
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/80 shadow-[0_8px_24px_rgba(22,131,91,0.12)] flex items-center justify-center text-[#16835B] animate-pulse">
          <span className="w-5 h-5 rounded-full border-2 border-[#16835B] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // If user is not authenticated, show AuthScreen (Protected pages cannot be accessed)
  if (!currentUser) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="min-h-screen bg-transparent flex text-[#171A18] selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Slow Moving Liquid Glass Background Animation */}
      <LiquidGlassBackground />

      {/* Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={currentUser}
        onOpenSettings={() => setCurrentView('settings')}
        onLogout={handleLogout}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        showAnimationPreview={true}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <TopHeader
          currentView={currentView}
          user={currentUser}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={(view) => setCurrentView(view)}
          onOpenSettings={() => setCurrentView('settings')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentView === 'home' && (
                <HomeDashboard
                  user={currentUser}
                  onNavigate={(view) => {
                    setCurrentView(view);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  recentDoubts={doubts}
                  recentNotes={aiNotes}
                  featuredNews={mockNewsArticles}
                  notebookNotes={notebookNotes}
                  onOpenDoubt={(d) => {
                    setActiveDoubt(d);
                    setCurrentView('doubt-solver');
                  }}
                  onOpenNote={(n) => {
                    setActiveAiNote(n);
                    setCurrentView('ai-notes');
                  }}
                  onOpenArticle={(a) => {
                    setActiveNewsArticle(a);
                    setCurrentView('news-paper');
                  }}
                  onOpenNotebookNote={(note) => {
                    setActiveNotebookNoteId(note.id);
                    setCurrentView('my-notes');
                  }}
                  onCreateNoteInSubject={(subject) => {
                    const newNote: StudentNotebookNote = {
                      id: 'note-' + Date.now(),
                      title: `${subject} Study Notes`,
                      subject,
                      content: `# ${subject} Study Notes\n\n- Key Theorems:\n- Principles:\n- Formulas & Examples:\n`,
                      tags: [subject, 'FolderDeck'],
                      isPinned: false,
                      updatedAt: 'Just now',
                    };
                    handleSaveNotebookNote(newNote);
                    setActiveNotebookNoteId(newNote.id);
                    setCurrentView('my-notes');
                  }}
                />
              )}

              {currentView === 'doubt-solver' && (
                <DoubtSolverView
                  doubts={doubts}
                  initialDoubt={activeDoubt}
                  onSaveDoubt={handleSaveDoubt}
                  onSaveToNotebook={handleExportToNotebook}
                />
              )}

              {currentView === 'ai-notes' && (
                <AiNotesView
                  savedNotes={aiNotes}
                  initialNote={activeAiNote}
                  onSaveNote={handleSaveAiNote}
                  onExportToNotebook={handleExportToNotebook}
                  currentUser={currentUser}
                  onDeleteNote={handleDeleteAiNote}
                />
              )}

              {currentView === 'news-paper' && (
                <NewsPaperView
                  articles={mockNewsArticles}
                  selectedArticle={activeNewsArticle}
                  onSelectArticle={(art) => setActiveNewsArticle(art)}
                />
              )}

              {currentView === 'my-notes' && (
                <MyNotesView
                  notes={notebookNotes}
                  initialActiveNoteId={activeNotebookNoteId}
                  onSaveNote={handleSaveNotebookNote}
                  onDeleteNote={handleDeleteNotebookNote}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  user={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onLogout={handleLogout}
                  onResetData={handleResetData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Menu */}
      <FloatingActionMenu
        onNavigate={setCurrentView}
        currentView={currentView}
      />
    </div>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SoundProvider>
  );
}
