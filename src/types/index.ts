// Core types for the voice recording app

export type Language = 'en' | 'tr';

export type RecordingState = 'idle' | 'recording' | 'playing' | 'stopped';

export interface VoiceCommand {
  command: string;
  action: 'START_RECORDING' | 'STOP_RECORDING' | 'PLAY_RECORDING' | 'SWITCH_LANGUAGE';
  language?: Language;
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
  transcript?: string;
  createdAt: Date;
}

export interface TranslationStrings {
  appTitle: string;
  status: {
    idle: string;
    recording: string;
    playing: string;
    stopped: string;
  };
  instructions: {
    startRecording: string;
    stopRecording: string;
    playRecording: string;
    switchLanguage: string;
  };
  messages: {
    microphoneAccess: string;
    recordingStarted: string;
    recordingStopped: string;
    playingRecording: string;
    noRecording: string;
    languageSwitched: string;
  };
  accessibility: {
    mainRegion: string;
    statusRegion: string;
    transcriptRegion: string;
  };
}

export interface Translations {
  en: TranslationStrings;
  tr: TranslationStrings;
}

// Supabase types for future integration
export interface SupabaseRecording {
  id: string;
  user_id: string;
  audio_url: string;
  transcript: string;
  duration: number;
  language: Language;
  created_at: string;
  updated_at: string;
}

export interface SupabaseUserPreferences {
  id: string;
  user_id: string;
  language: Language;
  settings: {
    autoPlay?: boolean;
    defaultLanguage?: Language;
  };
  created_at: string;
  updated_at: string;
}

