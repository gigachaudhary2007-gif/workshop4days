import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * ============================================================================
 * FIREBASE STORAGE SERVICE
 * All user-uploaded files are stored strictly under `users/{userId}/...`
 * ============================================================================
 */

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  size: number;
}

/**
 * Upload a handwritten note or document file
 * Path: `users/{userId}/notes/{timestamp}_{cleanFileName}`
 */
export async function uploadNoteFile(
  userId: string,
  file: File | Blob,
  fileName: string
): Promise<UploadResult> {
  if (!userId) throw new Error('userId is required for storage upload');
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `users/${userId}/notes/${Date.now()}_${cleanName}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    customMetadata: {
      ownerUserId: userId,
      uploadedAt: new Date().toISOString(),
      originalFileName: fileName,
    },
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    downloadUrl,
    storagePath,
    fileName,
    size: file.size,
  };
}

/**
 * Upload a question image for Doubt Solver
 * Path: `users/{userId}/doubts/{timestamp}_{cleanFileName}`
 */
export async function uploadDoubtImage(
  userId: string,
  file: File | Blob,
  fileName: string
): Promise<UploadResult> {
  if (!userId) throw new Error('userId is required for storage upload');
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `users/${userId}/doubts/${Date.now()}_${cleanName}`;
  const fileRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(fileRef, file, {
    customMetadata: {
      ownerUserId: userId,
      uploadedAt: new Date().toISOString(),
      originalFileName: fileName,
    },
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);

  return {
    downloadUrl,
    storagePath,
    fileName,
    size: file.size,
  };
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Storage delete warning:', error);
  }
}
