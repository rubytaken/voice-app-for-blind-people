/**
 * Audio service for handling audio playback and announcements
 */

// Cache for available voices
let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Load voices and cache them
 */
const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (voicesLoaded && cachedVoices.length > 0) {
      resolve(cachedVoices);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    // Wait for voices to load (needed in some browsers)
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      voicesLoaded = true;
      resolve(cachedVoices);
    };

    // Fallback timeout
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      voicesLoaded = cachedVoices.length > 0;
      resolve(cachedVoices);
    }, 100);
  });
};

/**
 * Get the best voice for a language
 */
const getBestVoice = async (lang: string): Promise<SpeechSynthesisVoice | null> => {
  const voices = await loadVoices();

  // Priority order:
  // 1. Native/local voice with exact language match
  // 2. Any voice with exact language match
  // 3. Native/local voice with language code match (e.g., 'en' matches 'en-US')
  // 4. Any voice with language code match

  const langCode = lang.split('-')[0];

  // Try exact match with native voice
  const nativeExact = voices.find(v => v.lang === lang && v.localService);
  if (nativeExact) return nativeExact;

  // Try exact match with any voice
  const anyExact = voices.find(v => v.lang === lang);
  if (anyExact) return anyExact;

  // Try language code match with native voice
  const nativeCode = voices.find(v => v.lang.startsWith(langCode) && v.localService);
  if (nativeCode) return nativeCode;

  // Try language code match with any voice
  const anyCode = voices.find(v => v.lang.startsWith(langCode));
  if (anyCode) return anyCode;

  return null;
};

/**
 * Speak text using Web Speech API for audio announcements
 * @param text - Text to speak
 * @param lang - Language code (e.g., 'en-US', 'tr-TR')
 */
export const speak = async (text: string, lang: string = 'en-US'): Promise<void> => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try to get the best voice
  const voice = await getBestVoice(lang);
  if (voice) {
    utterance.voice = voice;
  }

  // Handle Chrome bug where speech synthesis stops working
  const resumeSpeech = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  // Set up periodic resume to handle Chrome's pause bug
  const resumeInterval = setInterval(resumeSpeech, 10000);

  utterance.onend = () => {
    clearInterval(resumeInterval);
  };

  utterance.onerror = (event) => {
    clearInterval(resumeInterval);
    if (event.error !== 'interrupted') {
      console.warn('Speech synthesis error:', event.error);
    }
  };

  window.speechSynthesis.speak(utterance);
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

    audio.play().catch((err) => {
      URL.revokeObjectURL(audioUrl);
      reject(err);
    });
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
      const duration = audio.duration;
      URL.revokeObjectURL(audioUrl);

      // Handle Infinity duration (some browsers return this for certain formats)
      if (duration === Infinity || isNaN(duration)) {
        // Try to get duration by seeking to a large time
        audio.currentTime = 1e101;
        audio.ontimeupdate = () => {
          audio.ontimeupdate = null;
          resolve(audio.duration);
          audio.currentTime = 0;
        };
      } else {
        resolve(duration);
      }
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(audioUrl);
      reject(error);
    };
  });
};

/**
 * Check if speech synthesis is available
 */
export const isSpeechSynthesisAvailable = (): boolean => {
  return 'speechSynthesis' in window;
};

/**
 * Get available voices for a language
 */
export const getVoicesForLanguage = async (lang: string): Promise<SpeechSynthesisVoice[]> => {
  const voices = await loadVoices();
  const langCode = lang.split('-')[0];
  return voices.filter(v => v.lang === lang || v.lang.startsWith(langCode));
};
