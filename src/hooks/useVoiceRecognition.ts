import { useState, useEffect, useCallback, useRef } from 'react';

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceRecognitionProps {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

interface UseVoiceRecognitionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

// Error categories for better handling
type SpeechErrorType = 'network' | 'permission' | 'not-supported' | 'aborted' | 'no-speech' | 'unknown';

const categorizeError = (error: string): SpeechErrorType => {
  if (error.includes('network')) return 'network';
  if (error.includes('not-allowed') || error.includes('permission')) return 'permission';
  if (error.includes('not-supported') || error.includes('service-not-allowed')) return 'not-supported';
  if (error.includes('aborted')) return 'aborted';
  if (error.includes('no-speech')) return 'no-speech';
  return 'unknown';
};

export const useVoiceRecognition = ({
  onTranscript,
  onError,
  continuous = true,
  interimResults = true,
  language = 'en-US',
}: UseVoiceRecognitionProps = {}): UseVoiceRecognitionReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManuallyStoppedRef = useRef<boolean>(false);

  const MAX_RETRIES = 3;
  const BASE_RETRY_DELAY = 1000;

  // Check if browser supports speech recognition
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      retryCountRef.current = 0;
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;

      if (onTranscript && currentTranscript) {
        onTranscript(currentTranscript.trim(), !!finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      const errorType = categorizeError(event.error);
      let errorMessage = `Speech recognition error: ${event.error}`;
      let shouldRetry = false;

      switch (errorType) {
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          shouldRetry = true;
          break;
        case 'permission':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'not-supported':
          errorMessage = 'Speech recognition is not supported in this browser.';
          break;
        case 'aborted':
          // User or browser aborted - don't show error, but try to restart if continuous
          if (!isManuallyStoppedRef.current && continuous) {
            shouldRetry = true;
          }
          errorMessage = '';
          break;
        case 'no-speech':
          // No speech detected - this is normal, silently restart if continuous
          // Don't log or show error - user just hasn't spoken yet
          // Reset retry count since this is expected behavior
          retryCountRef.current = 0;
          if (!isManuallyStoppedRef.current && continuous) {
            shouldRetry = true;
          }
          errorMessage = '';
          break;
        default:
          shouldRetry = continuous && retryCountRef.current < MAX_RETRIES;
      }

      if (errorMessage) {
        setError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }

      setIsListening(false);

      // Auto-retry with exponential backoff
      if (shouldRetry && !isManuallyStoppedRef.current && retryCountRef.current < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, retryCountRef.current);
        retryCountRef.current++;

        retryTimeoutRef.current = setTimeout(() => {
          if (!isManuallyStoppedRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore if already started
            }
          }
        }, delay);
      }
    };

    recognition.onend = () => {
      setIsListening(false);

      // Auto-restart if continuous mode and not manually stopped
      if (continuous && !isManuallyStoppedRef.current && retryCountRef.current < MAX_RETRIES) {
        retryTimeoutRef.current = setTimeout(() => {
          if (!isManuallyStoppedRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Ignore if already started
            }
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      cleanup();
    };
  }, [isSupported, continuous, interimResults, language, onTranscript, onError, cleanup]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    try {
      isManuallyStoppedRef.current = false;
      retryCountRef.current = 0;
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err: any) {
      // Handle "already started" error
      if (err.message?.includes('already started')) {
        return;
      }
      setError(err.message);
      if (onError) {
        onError(err.message);
      }
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    isManuallyStoppedRef.current = true;

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    try {
      recognitionRef.current.stop();
    } catch (err: any) {
      setError(err.message);
      if (onError) {
        onError(err.message);
      }
    }
  }, [onError]);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    isSupported,
    error,
  };
};
