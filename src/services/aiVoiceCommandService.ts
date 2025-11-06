// AI-powered voice command service using Gemini
import { getSavedNotes } from './storageService';
import { findNoteByQuery, isGeminiConfigured } from './geminiService';

/**
 * Parse complex voice commands using AI
 * Examples:
 * - "play the meeting note" → finds note with "meeting" in title
 * - "open my shopping list" → finds note about shopping
 * - "show yesterday's notes" → finds recent notes
 */
export async function parseAIVoiceCommand(
  transcript: string,
  language: 'en' | 'tr'
): Promise<{
  action: 'PLAY_SPECIFIC_NOTE' | 'OPEN_SPECIFIC_NOTE' | 'SEARCH_NOTES' | null;
  noteQuery?: string;
  noteTitle?: string;
}> {
  const normalizedTranscript = transcript.toLowerCase().trim();

  // Check for "play note" commands
  const playPatterns = [
    /play\s+(?:the\s+)?(.+?)\s+note/i,
    /play\s+note\s+(.+)/i,
    /notu\s+oynat\s+(.+)/i,
    /(.+?)\s+notunu\s+oynat/i,
    /şu\s+notu\s+oynat\s+(.+)/i,
  ];

  for (const pattern of playPatterns) {
    const match = normalizedTranscript.match(pattern);
    if (match) {
      const query = match[1].trim();
      
      // Use AI to find the best matching note
      if (isGeminiConfigured()) {
        try {
          const notes = await getSavedNotes();
          const matchedTitle = await findNoteByQuery(query, notes, language);
          
          if (matchedTitle) {
            return {
              action: 'PLAY_SPECIFIC_NOTE',
              noteQuery: query,
              noteTitle: matchedTitle,
            };
          }
        } catch (error) {
          console.error('AI query failed:', error);
        }
      }

      // Fallback: simple text matching
      return {
        action: 'PLAY_SPECIFIC_NOTE',
        noteQuery: query,
      };
    }
  }

  // Check for "open note" commands
  const openPatterns = [
    /open\s+(?:the\s+)?(.+?)\s+note/i,
    /show\s+(?:the\s+)?(.+?)\s+note/i,
    /(.+?)\s+notunu\s+aç/i,
    /(.+?)\s+notunu\s+göster/i,
  ];

  for (const pattern of openPatterns) {
    const match = normalizedTranscript.match(pattern);
    if (match) {
      const query = match[1].trim();
      
      if (isGeminiConfigured()) {
        try {
          const notes = await getSavedNotes();
          const matchedTitle = await findNoteByQuery(query, notes, language);
          
          if (matchedTitle) {
            return {
              action: 'OPEN_SPECIFIC_NOTE',
              noteQuery: query,
              noteTitle: matchedTitle,
            };
          }
        } catch (error) {
          console.error('AI query failed:', error);
        }
      }

      return {
        action: 'OPEN_SPECIFIC_NOTE',
        noteQuery: query,
      };
    }
  }

  return { action: null };
}

/**
 * Find note by title or content using fuzzy matching
 */
export async function findNoteByName(
  query: string,
  language: 'en' | 'tr'
): Promise<{ id: string; title: string; audioUrl?: string } | null> {
  try {
    const notes = await getSavedNotes();
    
    if (notes.length === 0) return null;

    const queryLower = query.toLowerCase();

    // Exact title match
    let match = notes.find(n => n.title.toLowerCase() === queryLower);
    if (match) return match;

    // Partial title match
    match = notes.find(n => n.title.toLowerCase().includes(queryLower));
    if (match) return match;

    // Search in topics
    match = notes.find(n => 
      n.topics?.some(t => t.toLowerCase().includes(queryLower))
    );
    if (match) return match;

    // Search in transcript
    match = notes.find(n => 
      n.transcript.toLowerCase().includes(queryLower)
    );
    if (match) return match;

    // If AI is configured, use it for better matching
    if (isGeminiConfigured()) {
      const matchedTitle = await findNoteByQuery(query, notes, language);
      if (matchedTitle) {
        return notes.find(n => n.title === matchedTitle) || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding note:', error);
    return null;
  }
}




