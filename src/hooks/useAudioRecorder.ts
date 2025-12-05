import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecording } from '../types';

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playRecording: () => Promise<void>;
  pausePlayback: () => void;
  isRecording: boolean;
  isPlaying: boolean;
  recording: AudioRecording | null;
  error: string | null;
  isSupported: boolean;
}

// Get the best supported MIME type for the current browser
const getSupportedMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return '';

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return '';
};

// Get audio duration using AudioContext for more reliable results
const getAudioDurationWithContext = async (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioContext.close();
        resolve(audioBuffer.duration);
      } catch (error) {
        console.warn('AudioContext decode failed, falling back to Audio element');
        audioContext.close();
        // Fallback to Audio element
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          resolve(audio.duration || 0);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };
      }
    };

    reader.onerror = () => {
      resolve(0);
    };

    reader.readAsArrayBuffer(blob);
  });
};

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const isRecordingRef = useRef<boolean>(false);
  const recordingRef = useRef<AudioRecording | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    navigator.mediaDevices &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined';

  // Keep refs in sync
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
      return;
    }

    if (isRecordingRef.current) {
      console.log('Already recording, ignoring start request');
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      // Request microphone access with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      // Get the best supported MIME type
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = {};

      if (mimeType) {
        options.mimeType = mimeType;
      }

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, processing audio...');
        const recordingDuration = (Date.now() - recordingStartTimeRef.current) / 1000;

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        // Revoke old URL if exists
        if (recordingRef.current?.url) {
          URL.revokeObjectURL(recordingRef.current.url);
        }

        const audioUrl = URL.createObjectURL(audioBlob);

        // Try to get accurate duration
        let duration = recordingDuration;
        try {
          const accurateDuration = await getAudioDurationWithContext(audioBlob);
          if (accurateDuration > 0) {
            duration = accurateDuration;
          }
        } catch (e) {
          console.warn('Could not get accurate duration:', e);
        }

        const newRecording: AudioRecording = {
          blob: audioBlob,
          url: audioUrl,
          duration,
          createdAt: new Date(),
        };

        console.log('Recording complete:', { duration, blobSize: audioBlob.size });
        setRecording(newRecording);
        recordingRef.current = newRecording;
        setIsRecording(false);
        isRecordingRef.current = false;

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = () => {
        setError('Recording error occurred');
        setIsRecording(false);
        isRecordingRef.current = false;
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      recordingStartTimeRef.current = Date.now();

      // Start recording with timeslice for better data handling
      mediaRecorder.start(1000);
      setIsRecording(true);
      isRecordingRef.current = true;
      console.log('Recording started');
    } catch (err: any) {
      let errorMessage = 'Failed to start recording';

      if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Microphone is being used by another application.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setIsRecording(false);
      isRecordingRef.current = false;
      cleanup();
    }
  }, [isSupported, cleanup]);

  const stopRecording = useCallback(() => {
    console.log('stopRecording called, isRecordingRef:', isRecordingRef.current, 'mediaRecorder:', mediaRecorderRef.current?.state);

    if (!mediaRecorderRef.current) {
      console.log('No mediaRecorder available');
      return;
    }

    try {
      if (mediaRecorderRef.current.state === 'recording') {
        console.log('Stopping MediaRecorder...');
        mediaRecorderRef.current.stop();
      } else {
        console.log('MediaRecorder not in recording state:', mediaRecorderRef.current.state);
      }
    } catch (err: any) {
      console.error('Error stopping recording:', err);
      setError(err.message || 'Failed to stop recording');
    }
  }, []);

  const playRecording = useCallback(async () => {
    const currentRecording = recordingRef.current;
    if (!currentRecording) {
      console.log('No recording to play');
      return;
    }

    try {
      setError(null);

      // Clean up previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      console.log('Playing recording:', currentRecording.url);
      const audio = new Audio(currentRecording.url);
      audioRef.current = audio;

      // Handle browser autoplay policies
      audio.volume = 1.0;

      audio.onended = () => {
        console.log('Playback ended');
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play recording');
        setIsPlaying(false);
        audioRef.current = null;
      };

      setIsPlaying(true);

      try {
        await audio.play();
        console.log('Playback started');
      } catch (playError: any) {
        // Handle autoplay restrictions
        if (playError.name === 'NotAllowedError') {
          setError('Click or tap to enable audio playback');
        } else {
          setError(playError.message || 'Failed to play recording');
        }
        setIsPlaying(false);
        audioRef.current = null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to play recording');
      setIsPlaying(false);
    }
  }, []);

  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    playRecording,
    pausePlayback,
    isRecording,
    isPlaying,
    recording,
    error,
    isSupported,
  };
};
