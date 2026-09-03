import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  UserProfileData,
  NoteDocument,
  DoubtDocument,
  StudyActivityDocument,
  AnalyzedNoteRecord,
  StudentNotebookNote,
} from '../types';

/**
 * ============================================================================
 * 1. USER PROFILE MANAGEMENT
 * Location: `users/{userId}`
 * ============================================================================
 */

export async function createUserProfile(profile: UserProfileData): Promise<void> {
  if (!profile.userId) {
    throw new Error('userId is required to create a user profile');
  }
  const userRef = doc(db, 'users', profile.userId);
  await setDoc(userRef, {
    userId: profile.userId,
    name: profile.name,
    email: profile.email,
    createdAt: profile.createdAt || new Date().toISOString(),
    avatar: profile.avatar || '',
    gradeLevel: profile.gradeLevel || 'Class 10',
    studyGoalHours: profile.studyGoalHours || 3,
    streakDays: profile.streakDays || 1,
  }, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  if (!userId) return null;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data() as UserProfileData;
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfileData>
): Promise<void> {
  if (!userId) throw new Error('userId is required to update profile');
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data as Record<string, any>);
}

/**
 * ============================================================================
 * 2. NOTES MANAGEMENT (User Isolated)
 * Location: `users/{userId}/notes/{noteId}`
 * ============================================================================
 */

export async function saveUserNotebookNote(
  userId: string,
  note: StudentNotebookNote
): Promise<void> {
  if (!userId) throw new Error('User must be logged in to save notes.');
  const noteId = note.id || `note_${Date.now()}`;
  const noteRef = doc(db, 'users', userId, 'notes', noteId);

  const now = new Date().toISOString();
  const noteDoc: Record<string, any> = {
    noteId,
    id: noteId,
    userId,
    title: note.title.trim(),
    subject: note.subject || 'General',
    content: note.content || note.textContent || '',
    tags: Array.isArray(note.tags) ? note.tags : [],
    isPinned: Boolean(note.isPinned),
    folder: note.folder || '',
    updatedAt: now,
  };

  if (note.createdAt) {
    noteDoc.createdAt = note.createdAt;
  } else {
    noteDoc.createdAt = now;
  }

  if (note.drawingDataUrl) {
    noteDoc.drawingDataUrl = note.drawingDataUrl;
  }
  if (note.visualGraph) {
    noteDoc.visualGraph = note.visualGraph;
  }

  await setDoc(noteRef, noteDoc, { merge: true });
}

export async function getUserNotebookNotes(userId: string): Promise<StudentNotebookNote[]> {
  if (!userId) return [];
  const notesCol = collection(db, 'users', userId, 'notes');
  try {
    const q = query(notesCol, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      const content = data.content || data.textContent || '';
      return {
        id: data.noteId || data.id || d.id,
        title: data.title || 'Untitled Note',
        subject: data.subject || 'General',
        content,
        textContent: content,
        tags: Array.isArray(data.tags) ? data.tags : [],
        isPinned: Boolean(data.isPinned),
        folder: data.folder || '',
        drawingDataUrl: data.drawingDataUrl || undefined,
        visualGraph: data.visualGraph || undefined,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt
          ? new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recently',
      };
    });
  } catch {
    // Fallback without orderBy if index is pending
    const snap = await getDocs(notesCol);
    return snap.docs.map((d) => {
      const data = d.data();
      const content = data.content || data.textContent || '';
      return {
        id: data.noteId || data.id || d.id,
        title: data.title || 'Untitled Note',
        subject: data.subject || 'General',
        content,
        textContent: content,
        tags: Array.isArray(data.tags) ? data.tags : [],
        isPinned: Boolean(data.isPinned),
        folder: data.folder || '',
        drawingDataUrl: data.drawingDataUrl || undefined,
        visualGraph: data.visualGraph || undefined,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt
          ? new Date(data.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recently',
      };
    });
  }
}

export async function deleteUserNotebookNote(userId: string, noteId: string): Promise<void> {
  if (!userId || !noteId) throw new Error('userId and noteId are required');
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
}

export async function createNote(
  userId: string,
  noteData: Omit<NoteDocument, 'userId' | 'createdAt' | 'updatedAt'> & {
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<NoteDocument> {
  if (!userId) throw new Error('userId is required to create a note');
  const noteId = noteData.noteId || `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const noteRef = doc(db, 'users', userId, 'notes', noteId);

  const now = new Date().toISOString();
  const note: NoteDocument = {
    noteId,
    id: noteId,
    userId,
    title: noteData.title,
    subject: noteData.subject || 'General',
    content: noteData.content,
    tags: noteData.tags || [],
    isPinned: Boolean(noteData.isPinned),
    folder: noteData.folder || '',
    originalFileUrl: noteData.originalFileUrl || '',
    drawingDataUrl: noteData.drawingDataUrl,
    visualGraph: noteData.visualGraph,
    createdAt: noteData.createdAt || now,
    updatedAt: noteData.updatedAt || now,
  };

  await setDoc(noteRef, note);
  return note;
}

export async function getUserNotes(userId: string): Promise<NoteDocument[]> {
  if (!userId) return [];
  const notesCol = collection(db, 'users', userId, 'notes');
  try {
    const q = query(notesCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as NoteDocument);
  } catch {
    // Fallback without orderBy if composite indexing is pending
    const snap = await getDocs(notesCol);
    return snap.docs.map((d) => d.data() as NoteDocument);
  }
}

export async function getNoteById(userId: string, noteId: string): Promise<NoteDocument | null> {
  if (!userId || !noteId) return null;
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  const snap = await getDoc(noteRef);
  if (!snap.exists()) return null;
  return snap.data() as NoteDocument;
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Omit<NoteDocument, 'noteId' | 'userId'>>
): Promise<void> {
  if (!userId || !noteId) throw new Error('userId and noteId required');
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await updateDoc(noteRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  if (!userId || !noteId) throw new Error('userId and noteId required');
  const noteRef = doc(db, 'users', userId, 'notes', noteId);
  await deleteDoc(noteRef);
}

/**
 * ============================================================================
 * 3. DOUBTS MANAGEMENT (User Isolated)
 * Location: `users/{userId}/doubts/{doubtId}`
 * ============================================================================
 */

export async function createDoubt(
  userId: string,
  doubtData: Omit<DoubtDocument, 'userId' | 'createdAt'> & {
    createdAt?: string;
  }
): Promise<DoubtDocument> {
  if (!userId) throw new Error('userId is required to create a doubt');
  const doubtId = doubtData.doubtId || `doubt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const doubtRef = doc(db, 'users', userId, 'doubts', doubtId);

  const doubt: DoubtDocument = {
    doubtId,
    userId,
    question: doubtData.question,
    imageUrl: doubtData.imageUrl || '',
    answer: doubtData.answer || '',
    createdAt: doubtData.createdAt || new Date().toISOString(),
  };

  await setDoc(doubtRef, doubt);
  return doubt;
}

export async function getUserDoubts(userId: string): Promise<DoubtDocument[]> {
  if (!userId) return [];
  const doubtsCol = collection(db, 'users', userId, 'doubts');
  try {
    const q = query(doubtsCol, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DoubtDocument);
  } catch {
    const snap = await getDocs(doubtsCol);
    return snap.docs.map((d) => d.data() as DoubtDocument);
  }
}

export async function getDoubtById(userId: string, doubtId: string): Promise<DoubtDocument | null> {
  if (!userId || !doubtId) return null;
  const doubtRef = doc(db, 'users', userId, 'doubts', doubtId);
  const snap = await getDoc(doubtRef);
  if (!snap.exists()) return null;
  return snap.data() as DoubtDocument;
}

export async function updateDoubt(
  userId: string,
  doubtId: string,
  updates: Partial<Omit<DoubtDocument, 'doubtId' | 'userId'>>
): Promise<void> {
  if (!userId || !doubtId) throw new Error('userId and doubtId required');
  const doubtRef = doc(db, 'users', userId, 'doubts', doubtId);
  await updateDoc(doubtRef, updates as Record<string, any>);
}

export async function deleteDoubt(userId: string, doubtId: string): Promise<void> {
  if (!userId || !doubtId) throw new Error('userId and doubtId required');
  const doubtRef = doc(db, 'users', userId, 'doubts', doubtId);
  await deleteDoc(doubtRef);
}

/**
 * ============================================================================
 * 4. STUDY ACTIVITY LOGS (User Isolated)
 * Location: `users/{userId}/study_activities/{activityId}`
 * ============================================================================
 */

export async function logStudyActivity(
  userId: string,
  activityType: string,
  date?: string
): Promise<StudyActivityDocument> {
  if (!userId) throw new Error('userId is required to log study activity');
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const actRef = doc(db, 'users', userId, 'study_activities', activityId);

  const activity: StudyActivityDocument = {
    activityId,
    userId,
    date: date || new Date().toISOString(),
    activityType,
  };

  await setDoc(actRef, activity);
  return activity;
}

export async function getUserStudyActivities(userId: string): Promise<StudyActivityDocument[]> {
  if (!userId) return [];
  const actCol = collection(db, 'users', userId, 'study_activities');
  try {
    const q = query(actCol, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as StudyActivityDocument);
  } catch {
    const snap = await getDocs(actCol);
    return snap.docs.map((d) => d.data() as StudyActivityDocument);
  }
}

export async function deleteStudyActivity(userId: string, activityId: string): Promise<void> {
  if (!userId || !activityId) throw new Error('userId and activityId required');
  const actRef = doc(db, 'users', userId, 'study_activities', activityId);
  await deleteDoc(actRef);
}

/**
 * ============================================================================
 * 5. AI NOTES MANAGEMENT (User Isolated)
 * Location: `users/{userId}/ai_notes/{noteId}`
 * ============================================================================
 */

export async function saveUserAiNote(
  userId: string,
  note: AnalyzedNoteRecord
): Promise<void> {
  if (!userId) throw new Error('userId is required to save an AI note');
  const noteRef = doc(db, 'users', userId, 'ai_notes', note.id);
  await setDoc(noteRef, {
    ...note,
    userId,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

export async function getUserAiNotes(userId: string): Promise<AnalyzedNoteRecord[]> {
  if (!userId) return [];
  const col = collection(db, 'users', userId, 'ai_notes');
  try {
    const snap = await getDocs(col);
    return snap.docs.map((d) => d.data() as AnalyzedNoteRecord);
  } catch (err) {
    console.warn('Error fetching AI notes from Firestore:', err);
    return [];
  }
}

export async function deleteUserAiNote(userId: string, noteId: string): Promise<void> {
  if (!userId || !noteId) throw new Error('userId and noteId required');
  const noteRef = doc(db, 'users', userId, 'ai_notes', noteId);
  await deleteDoc(noteRef);
}

