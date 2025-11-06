// Local storage service for saving audio recordings and transcriptions
import { AudioRecording } from '../types';
import { generateNoteTitle, extractTopics, isGeminiConfigured } from './geminiService';

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

const STORAGE_KEY = 'voice_notes';
const AUDIO_STORAGE_KEY = 'voice_notes_audio';

// Convert Blob to Base64 for storage
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Convert Base64 to Blob
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

// Get all saved notes
export async function getSavedNotes(): Promise<SavedNote[]> {
  try {
    const notesJson = localStorage.getItem(STORAGE_KEY);
    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);
    
    if (!notesJson) return [];
    
    const notes: SavedNote[] = JSON.parse(notesJson);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};
    
    // Restore dates and audio blobs
    return notes.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt),
      audioBlob: audioMap[note.id] ? base64ToBlob(audioMap[note.id]) : undefined,
      audioUrl: audioMap[note.id] ? URL.createObjectURL(base64ToBlob(audioMap[note.id])) : undefined,
    }));
  } catch (error) {
    console.error('Error loading saved notes:', error);
    return [];
  }
}

// Save a new note with AI-generated metadata
export async function saveNote(
  transcript: string,
  recording: AudioRecording | null,
  language: 'en' | 'tr',
  title?: string
): Promise<SavedNote> {
  try {
    const notes = await getSavedNotes();
    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};
    
    // Use AI to generate title if not provided and Gemini is configured
    let noteTitle = title;
    let topics: string[] = [];
    
    if (isGeminiConfigured() && transcript.trim()) {
      try {
        // Generate smart title if not provided
        if (!noteTitle) {
          noteTitle = await generateNoteTitle(transcript, language);
        }
        
        // Extract topics for better searchability
        topics = await extractTopics(transcript, language);
      } catch (aiError) {
        console.warn('AI features unavailable, using fallback:', aiError);
        noteTitle = noteTitle || `Note ${new Date().toLocaleString()}`;
      }
    } else {
      noteTitle = noteTitle || `Note ${new Date().toLocaleString()}`;
    }
    
    const newNote: SavedNote = {
      id: Date.now().toString(),
      title: noteTitle,
      transcript: transcript,
      duration: recording?.duration || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      language,
      topics: topics.length > 0 ? topics : undefined,
    };
    
    // Store audio separately if available
    if (recording?.blob) {
      const base64Audio = await blobToBase64(recording.blob);
      audioMap[newNote.id] = base64Audio;
      newNote.audioBlob = recording.blob;
      newNote.audioUrl = recording.url;
    }
    
    notes.push(newNote);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(audioMap));
    
    return newNote;
  } catch (error) {
    console.error('Error saving note:', error);
    throw new Error('Failed to save note. Storage might be full.');
  }
}

// Update an existing note
export async function updateNote(
  id: string,
  updates: Partial<Pick<SavedNote, 'title' | 'transcript'>>
): Promise<SavedNote | null> {
  try {
    const notes = await getSavedNotes();
    const noteIndex = notes.findIndex(n => n.id === id);
    
    if (noteIndex === -1) return null;
    
    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updates,
      updatedAt: new Date(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    
    return notes[noteIndex];
  } catch (error) {
    console.error('Error updating note:', error);
    throw new Error('Failed to update note');
  }
}

// Delete a note
export async function deleteNote(id: string): Promise<boolean> {
  try {
    const notes = await getSavedNotes();
    const audioData = localStorage.getItem(AUDIO_STORAGE_KEY);
    const audioMap: { [key: string]: string } = audioData ? JSON.parse(audioData) : {};
    
    const filteredNotes = notes.filter(n => n.id !== id);
    
    // Remove audio data
    delete audioMap[id];
    
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

