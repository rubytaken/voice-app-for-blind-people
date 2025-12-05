// Local storage service for saving audio recordings and transcriptions
import { AudioRecording } from '../types';

export interface SavedNote {
  id: string;
  title: string;
  transcript: string;
  audioBlob?: Blob;
  audioUrl?: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  language: 'en' | 'tr';
  topics?: string[];
  summary?: string;
}

// Internal interface for serialized notes (stored in localStorage)
interface SerializedNote {
  id: string;
  title: string;
  transcript: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  language: 'en' | 'tr';
  topics?: string[];
  summary?: string;
}

const STORAGE_KEY = 'voice_notes';
const AUDIO_STORAGE_KEY = 'voice_notes_audio';

// Cache for created Object URLs to prevent memory leaks
const urlCache: Map<string, string> = new Map();

// Generate a meaningful title from the transcript
function generateTitleFromTranscript(transcript: string, language: 'en' | 'tr'): string {
  if (!transcript || transcript.trim().length === 0) {
    return language === 'en' ? 'Untitled Note' : 'İsimsiz Not';
  }

  // Clean up the transcript
  const cleanText = transcript.trim();

  // Get first few words (up to 5 words or 50 characters)
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);

  // Skip common voice commands that might be at the start
  const skipWords = ['start', 'recording', 'kayda', 'başla', 'basla', 'stop', 'dur', 'durdur'];
  let startIndex = 0;
  while (startIndex < words.length && skipWords.includes(words[startIndex].toLowerCase())) {
    startIndex++;
  }

  // Get meaningful words
  const meaningfulWords = words.slice(startIndex, startIndex + 5);

  if (meaningfulWords.length === 0) {
    // Fall back to date-based title
    const date = new Date();
    const timeStr = date.toLocaleTimeString(language === 'en' ? 'en-US' : 'tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return language === 'en' ? `Note at ${timeStr}` : `${timeStr} Notu`;
  }

  let title = meaningfulWords.join(' ');

  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  // Truncate if too long
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }

  return title;
}


// Convert Blob to Base64 for storage
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read blob as base64'));
    reader.readAsDataURL(blob);
  });
}

// Convert Base64 to Blob with validation
function base64ToBlob(base64: string): Blob | null {
  try {
    if (!base64 || !base64.includes(';base64,')) {
      console.warn('Invalid base64 string');
      return null;
    }
    const parts = base64.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'audio/webm';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return null;
  }
}

// Get audio duration from blob
export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration || 0);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };

    audio.src = url;
  });
}

// Get or create cached URL for a note's audio
function getCachedUrl(noteId: string, audioBlob: Blob): string {
  if (urlCache.has(noteId)) {
    return urlCache.get(noteId)!;
  }
  const url = URL.createObjectURL(audioBlob);
  urlCache.set(noteId, url);
  return url;
}

// Revoke all cached URLs (call when done with notes)
export function revokeAllUrls(): void {
  urlCache.forEach((url) => {
    URL.revokeObjectURL(url);
  });
  urlCache.clear();
}

// Revoke specific note URL
export function revokeNoteUrl(noteId: string): void {
  if (urlCache.has(noteId)) {
    URL.revokeObjectURL(urlCache.get(noteId)!);
    urlCache.delete(noteId);
  }
}

// Check available storage space
function checkStorageQuota(): { used: number; available: number; canStore: boolean } {
  try {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length * 2; // UTF-16 encoding
      }
    }
    const maxSize = 5 * 1024 * 1024; // 5MB conservative estimate
    return {
      used: totalSize,
      available: maxSize - totalSize,
      canStore: totalSize < maxSize * 0.9 // Leave 10% buffer
    };
  } catch {
    return { used: 0, available: 0, canStore: true };
  }
}

// Get all saved notes
export async function getSavedNotes(): Promise<SavedNote[]> {
  try {
    const notesJson = localStorage.getItem(STORAGE_KEY);
    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);

    if (!notesJson) return [];

    const notes: SerializedNote[] = JSON.parse(notesJson);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};

    // Restore dates and audio blobs with proper URL caching
    return notes.map(note => {
      const audioBase64 = audioMap[note.id];
      const audioBlob = audioBase64 ? base64ToBlob(audioBase64) : null;

      return {
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        audioBlob: audioBlob || undefined,
        audioUrl: audioBlob ? getCachedUrl(note.id, audioBlob) : undefined,
      };
    });
  } catch (error) {
    console.error('Error loading saved notes:', error);
    return [];
  }
}

// Save a new note
export async function saveNote(
  transcript: string,
  recording: AudioRecording | null,
  language: 'en' | 'tr',
  title?: string
): Promise<SavedNote> {
  try {
    // Check storage quota before saving
    const quota = checkStorageQuota();
    if (!quota.canStore) {
      throw new Error(
        language === 'en'
          ? 'Storage is almost full. Please delete some notes.'
          : 'Depolama alanı neredeyse dolu. Lütfen bazı notları silin.'
      );
    }

    // Get existing notes (raw from storage, not with blobs)
    const notesJson = localStorage.getItem(STORAGE_KEY);
    const existingNotes: SerializedNote[] = notesJson ? JSON.parse(notesJson) : [];

    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};

    // Generate title from transcript if not provided
    const noteTitle = title || generateTitleFromTranscript(transcript, language);

    // Calculate duration from audio blob if available and duration is 0
    let duration = recording?.duration || 0;
    if (recording?.blob && duration === 0) {
      try {
        duration = await getAudioDuration(recording.blob);
      } catch (e) {
        console.warn('Could not get audio duration:', e);
      }
    }

    const now = new Date();
    const noteId = Date.now().toString();

    const serializedNote: SerializedNote = {
      id: noteId,
      title: noteTitle,
      transcript: transcript,
      duration: duration,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      language,
    };

    // Store audio separately if available
    let audioUrl: string | undefined;
    let audioBlob: Blob | undefined;

    if (recording?.blob) {
      try {
        const base64Audio = await blobToBase64(recording.blob);
        audioMap[noteId] = base64Audio;
        audioBlob = recording.blob;
        audioUrl = getCachedUrl(noteId, recording.blob);
      } catch (audioError) {
        console.warn('Could not save audio, saving note without audio:', audioError);
      }
    }

    existingNotes.push(serializedNote);

    // Save to localStorage with error handling for quota exceeded
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingNotes));
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioMap));
    } catch (storageError: any) {
      // Handle QuotaExceededError
      if (storageError.name === 'QuotaExceededError' || storageError.code === 22) {
        throw new Error(
          language === 'en'
            ? 'Storage is full. Please delete some notes to save new ones.'
            : 'Depolama alanı dolu. Yeni not kaydetmek için bazı notları silin.'
        );
      }
      throw storageError;
    }

    // Return the saved note with full data
    const savedNote: SavedNote = {
      id: noteId,
      title: noteTitle,
      transcript: transcript,
      duration: duration,
      createdAt: now,
      updatedAt: now,
      language,
      audioBlob,
      audioUrl,
    };

    return savedNote;
  } catch (error: any) {
    console.error('Error saving note:', error);
    throw new Error(error.message || 'Failed to save note. Storage might be full.');
  }
}

// Update an existing note
export async function updateNote(
  id: string,
  updates: Partial<Pick<SavedNote, 'title' | 'transcript'>>
): Promise<SavedNote | null> {
  try {
    // Get raw notes from storage
    const notesJson = localStorage.getItem(STORAGE_KEY);
    if (!notesJson) return null;

    const notes: SerializedNote[] = JSON.parse(notesJson);
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) return null;

    const now = new Date();
    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: now.toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));

    // Get audio data for the note
    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};
    const audioBase64 = audioMap[id];
    const audioBlob = audioBase64 ? base64ToBlob(audioBase64) : null;

    // Return full SavedNote
    return {
      ...notes[noteIndex],
      createdAt: new Date(notes[noteIndex].createdAt),
      updatedAt: now,
      audioBlob: audioBlob || undefined,
      audioUrl: audioBlob ? getCachedUrl(id, audioBlob) : undefined,
    };
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<boolean> {
  try {
    // Get raw notes from storage
    const notesJson = localStorage.getItem(STORAGE_KEY);
    if (!notesJson) return false;

    const notes: SerializedNote[] = JSON.parse(notesJson);
    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};

    const filteredNotes = notes.filter(n => n.id !== id);

    // Remove audio data
    delete audioMap[id];

    // Revoke cached URL for this note
    revokeNoteUrl(id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredNotes));
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioMap));

    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw new Error('Failed to delete note');
  }
}

// Get a specific note by ID
export async function getNoteById(id: string): Promise<SavedNote | null> {
  const notes = await getSavedNotes();
  return notes.find(n => n.id === id) || null;
}

// Export all notes as JSON
export async function exportNotes(): Promise<string> {
  const notes = await getSavedNotes();
  return JSON.stringify(notes, null, 2);
}

// Get storage usage info
export function getStorageInfo(): { used: number; available: number; percentage: number } {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    // Most browsers allow ~5-10MB for localStorage
    const maxSize = 5 * 1024 * 1024; // 5MB estimate

    return {
      used: totalSize,
      available: maxSize - totalSize,
      percentage: (totalSize / maxSize) * 100,
    };
  } catch {
    return { used: 0, available: 0, percentage: 0 };
  }
}
