import { storage } from '../../config/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

/**
 * Convert a base64 data URL to a Blob
 */
const base64ToBlob = (base64: string): { blob: Blob; mimeType: string } => {
  const [header, data] = base64.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'audio/webm';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { blob: new Blob([bytes], { type: mimeType }), mimeType };
};

/**
 * Get the file extension for a MIME type
 */
const getExtension = (mimeType: string): string => {
  if (mimeType.includes('mp4') || mimeType.includes('aac')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
};

/**
 * Upload audio to Firebase Storage.
 * Accepts a base64 data URL, returns a public download URL.
 *
 * Storage path: audio/{pairId}/{entryId}/audio_{role}.{ext}
 */
export const uploadAudio = async (
  pairId: string,
  entryId: string,
  role: 'A' | 'B',
  base64Audio: string
): Promise<string> => {
  const { blob, mimeType } = base64ToBlob(base64Audio);
  const ext = getExtension(mimeType);
  const path = `audio/${pairId}/${entryId}/audio_${role}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob, { contentType: mimeType });
  const url = await getDownloadURL(storageRef);
  return url;
};

/**
 * Delete an audio file from Firebase Storage.
 * Safe to call even if the file doesn't exist.
 */
export const deleteAudio = async (
  pairId: string,
  entryId: string,
  role: 'A' | 'B'
): Promise<void> => {
  // Try all possible extensions
  const extensions = ['mp4', 'webm', 'ogg'];
  for (const ext of extensions) {
    try {
      const path = `audio/${pairId}/${entryId}/audio_${role}.${ext}`;
      await deleteObject(ref(storage, path));
      return;
    } catch {
      // File with this extension doesn't exist, try next
    }
  }
};

/**
 * Delete all audio files for an entry (both roles).
 */
export const deleteEntryAudio = async (
  pairId: string,
  entryId: string
): Promise<void> => {
  await Promise.allSettled([
    deleteAudio(pairId, entryId, 'A'),
    deleteAudio(pairId, entryId, 'B'),
  ]);
};
