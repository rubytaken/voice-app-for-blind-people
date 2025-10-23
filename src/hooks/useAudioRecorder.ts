import { useState, useRef, useCallback } from 'react';
import { AudioRecording } from '../types';

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playRecording: () => Promise<void>;
  isRecording: boolean;
  isPlaying: boolean;
  recording: AudioRecording | null;
  error: string | null;
  isSupported: boolean;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    navigator.mediaDevices &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined';

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
      return;
    }

    if (isRecording) return;

    try {
      setError(null);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4',
      });

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Calculate duration (will be updated when played)
        const newRecording: AudioRecording = {
          blob: audioBlob,
          url: audioUrl,
          duration: 0,
          createdAt: new Date(),
        };

        setRecording(newRecording);
        setIsRecording(false);

        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        setError('Recording error occurred');
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  }, [isRecording, isSupported]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;

    try {
      mediaRecorderRef.current.stop();
    } catch (err: any) {
      setError(err.message || 'Failed to stop recording');
    }
  }, [isRecording]);

  const playRecording = useCallback(async () => {
    if (!recording || isPlaying) return;

    try {
      setError(null);

      // Clean up previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(recording.url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setError('Failed to play recording');
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onloadedmetadata = () => {
        // Update recording duration
        setRecording((prev) =>
          prev
            ? {
                ...prev,
                duration: audio.duration,
              }
            : null
        );
      };

      setIsPlaying(true);
      await audio.play();
    } catch (err: any) {
      setError(err.message || 'Failed to play recording');
      setIsPlaying(false);
    }
  }, [recording, isPlaying]);

  return {
    startRecording,
    stopRecording,
    playRecording,
    isRecording,
    isPlaying,
    recording,
    error,
    isSupported,
  };
};

