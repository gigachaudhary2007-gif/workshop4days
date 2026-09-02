import React, { useState, useEffect } from 'react';
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

function AppContent() {
  const { showToast } = useToast();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('study_to_shine_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default demo user for instant preview experience
    return {
      id: 'usr_default',
      name: 'Alex Chen',
      email: 'alex.chen@student.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      gradeLevel: 'Grade 12 / AP Scholar',
      studyGoalHours: 3,
      completedTasksToday: 4,
      streakDays: 5,
      rememberMe: true,
    };
  });

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

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('study_to_shine_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('study_to_shine_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sts_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('sts_ai_notes', JSON.stringify(aiNotes));
  }, [aiNotes]);

  useEffect(() => {
    localStorage.setItem('sts_notebook', JSON.stringify(notebookNotes));
  }, [notebookNotes]);

  // Handlers
  const handleAuthenticate = (user: User) => {
    setCurrentUser(user);
    setCurrentView('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('study_to_shine_user');
    showToast('Logged out of Study to Shine');
  };

  const handleResetData = () => {
    setDoubts(initialDoubts);
    setAiNotes(initialNotes);
    setNotebookNotes(initialNotebookNotes);
    showToast('Session reset to initial demo data');
  };

  const handleSaveDoubt = (newDoubt: DoubtRecord) => {
    setDoubts((prev) => [newDoubt, ...prev.filter((d) => d.id !== newDoubt.id)]);
  };

  const handleSaveAiNote = (newNote: AnalyzedNoteRecord) => {
    setAiNotes((prev) => [newNote, ...prev.filter((n) => n.id !== newNote.id)]);
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

  // If user is not authenticated, show AuthScreen
  if (!currentUser) {
    return <AuthScreen onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex text-[#171A18] selection:bg-emerald-100 selection:text-emerald-900">
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
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader
          currentView={currentView}
          user={currentUser}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={(view) => setCurrentView(view)}
          onOpenSettings={() => setCurrentView('settings')}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
              onSaveNote={handleSaveNotebookNote}
              onDeleteNote={handleDeleteNotebookNote}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
