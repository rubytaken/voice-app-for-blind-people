// Gemini AI Service for intelligent note naming and understanding
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini AI
function initializeGemini() {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
    console.warn('Gemini API key not configured. AI features will be disabled.');
    return null;
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

/**
 * Generate a smart title for a note based on its content
 * @param transcript The full transcript of the recording
 * @param language The language of the transcript
 * @returns A short, descriptive title
 */
export async function generateNoteTitle(
  transcript: string,
  language: 'en' | 'tr'
): Promise<string> {
  try {
    const ai = initializeGemini();
    if (!ai || !transcript.trim()) {
      // Fallback to timestamp-based title
      return `Note ${new Date().toLocaleString()}`;
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt =
      language === 'en'
        ? `Based on this transcript, generate a very short, descriptive title (max 4-5 words). Be specific and use keywords from the content.

Transcript: "${transcript.substring(0, 500)}"

Title:`
        : `Bu metne dayanarak çok kısa, açıklayıcı bir başlık üret (max 4-5 kelime). Spesifik ol ve içerikten anahtar kelimeler kullan.

Metin: "${transcript.substring(0, 500)}"

Başlık:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const title = response.text().trim();

    // Clean up the title (remove quotes, extra punctuation)
    const cleanTitle = title
      .replace(/^["']|["']$/g, '')
      .replace(/\.$/, '')
      .trim();

    return cleanTitle || `Note ${new Date().toLocaleString()}`;
  } catch (error) {
    console.error('Error generating title with Gemini:', error);
    return `Note ${new Date().toLocaleString()}`;
  }
}

/**
 * Extract key topics/tags from transcript
 * @param transcript The full transcript
 * @param language The language
 * @returns Array of key topics
 */
export async function extractTopics(
  transcript: string,
  language: 'en' | 'tr'
): Promise<string[]> {
  try {
    const ai = initializeGemini();
    if (!ai || !transcript.trim()) {
      return [];
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt =
      language === 'en'
        ? `Extract 3-5 key topics or keywords from this transcript. Return only the topics, separated by commas.

Transcript: "${transcript.substring(0, 500)}"

Topics:`
        : `Bu metinden 3-5 anahtar konu veya kelime çıkar. Sadece konuları virgülle ayırarak döndür.

Metin: "${transcript.substring(0, 500)}"

Konular:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const topics = response
      .text()
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 5);

    return topics;
  } catch (error) {
    console.error('Error extracting topics with Gemini:', error);
    return [];
  }
}

/**
 * Find a note by natural language query
 * @param query User's search query
 * @param notesList List of available notes with titles
 * @param language The language
 * @returns Best matching note title or null
 */
export async function findNoteByQuery(
  query: string,
  notesList: Array<{ id: string; title: string; transcript: string }>,
  language: 'en' | 'tr'
): Promise<string | null> {
  try {
    const ai = initializeGemini();
    if (!ai || notesList.length === 0) {
      return null;
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const noteTitles = notesList.map((n, i) => `${i + 1}. ${n.title}`).join('\n');

    const prompt =
      language === 'en'
        ? `The user wants to find a note. Based on their query, which note from the list are they most likely referring to?

User query: "${query}"

Available notes:
${noteTitles}

Return ONLY the exact note title that best matches, or "NONE" if no match. Do not add explanations.`
        : `Kullanıcı bir not bulmak istiyor. Sorgusuna göre listeden hangi notu kastediyor olabilir?

Kullanıcı sorgusu: "${query}"

Mevcut notlar:
${noteTitles}

Sadece en iyi eşleşen not başlığını döndür, eşleşme yoksa "NONE" yaz. Açıklama ekleme.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const matchedTitle = response.text().trim();

    if (matchedTitle === 'NONE') {
      return null;
    }

    // Find the note with matching title
    const foundNote = notesList.find(
      (n) =>
        n.title.toLowerCase().includes(matchedTitle.toLowerCase()) ||
        matchedTitle.toLowerCase().includes(n.title.toLowerCase())
    );

    return foundNote ? foundNote.title : null;
  } catch (error) {
    console.error('Error finding note with Gemini:', error);
    return null;
  }
}

/**
 * Summarize a long transcript
 * @param transcript The full transcript
 * @param language The language
 * @returns A short summary
 */
export async function summarizeTranscript(
  transcript: string,
  language: 'en' | 'tr'
): Promise<string> {
  try {
    const ai = initializeGemini();
    if (!ai || !transcript.trim()) {
      return transcript.substring(0, 200) + '...';
    }

    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt =
      language === 'en'
        ? `Provide a brief summary (2-3 sentences) of this transcript:

"${transcript}"

Summary:`
        : `Bu metnin kısa bir özetini çıkar (2-3 cümle):

"${transcript}"

Özet:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error summarizing with Gemini:', error);
    return transcript.substring(0, 200) + '...';
  }
}

/**
 * Check if Gemini is configured and ready
 */
export function isGeminiConfigured(): boolean {
  return !!API_KEY && API_KEY !== 'your_gemini_api_key_here';
}



