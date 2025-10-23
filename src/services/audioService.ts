/**
 * Audio service for handling audio playback and announcements
 */

/**
 * Speak text using Web Speech API for audio announcements
 * @param text - Text to speak
 * @param lang - Language code (e.g., 'en-US', 'tr-TR')
 */
export const speak = (text: string, lang: string = 'en-US'): void => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  }
};

/**
 * Play an audio blob
 * @param audioBlob - The audio blob to play
 * @returns Promise that resolves when audio finishes playing
 */
export const playAudioBlob = (audioBlob: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };

    audio.play().catch(reject);
  });
};

/**
 * Get audio duration from blob
 * @param audioBlob - The audio blob
 * @returns Promise that resolves with duration in seconds
 */
export const getAudioDuration = (audioBlob: Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audioUrl);
      resolve(audio.duration);
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };
  });
};

