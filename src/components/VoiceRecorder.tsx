import React, { useState, useEffect, useCallback } from 'react';
import { RecordingState } from '../types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../hooks/useLanguage';
import { parseVoiceCommand } from '../services/voiceCommandService';
import { speak } from '../services/audioService';
import RecordingControls from './RecordingControls';
import TranscriptionDisplay from './TranscriptionDisplay';

const VoiceRecorder: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [lastTranscript, setLastTranscript] = useState<string>('');

  const {
    startRecording,
    stopRecording,
    playRecording,
    isRecording,
    isPlaying,
    recording,
    error: recordingError,
  } = useAudioRecorder();

  // Handle voice transcript and commands
  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      // Update transcript display
      if (isRecording) {
        setLastTranscript(transcript);
      }

      // Parse and handle voice commands
      const command = parseVoiceCommand(transcript);
      if (command) {
        console.log('Voice command detected:', command);

        switch (command.action) {
          case 'START_RECORDING':
            if (!isRecording && !isPlaying) {
              startRecording();
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(t.messages.recordingStarted, langCode);
            }
            break;

          case 'STOP_RECORDING':
            if (isRecording) {
              stopRecording();
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(t.messages.recordingStopped, langCode);
            }
            break;

          case 'PLAY_RECORDING':
            if (!isRecording && !isPlaying && recording) {
              playRecording();
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(t.messages.playingRecording, langCode);
            } else if (!recording) {
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(t.messages.noRecording, langCode);
            }
            break;

          case 'SWITCH_LANGUAGE':
            toggleLanguage();
            break;

          default:
            break;
        }
      }
    },
    [
      isRecording,
      isPlaying,
      recording,
      startRecording,
      stopRecording,
      playRecording,
      toggleLanguage,
      language,
      t,
    ]
  );

  // Initialize voice recognition (always listening for commands)
  const { isListening, startListening, error: voiceError } = useVoiceRecognition({
    onTranscript: handleTranscript,
    continuous: true,
    interimResults: true,
    language: 'en-US', // We use en-US but recognize commands in both languages
  });

  // Auto-start voice recognition on mount
  useEffect(() => {
    // Small delay to ensure everything is initialized
    const timer = setTimeout(() => {
      startListening();
    }, 500);
    return () => clearTimeout(timer);
  }, [startListening]);

  // Update recording state
  useEffect(() => {
    if (isRecording) {
      setRecordingState('recording');
    } else if (isPlaying) {
      setRecordingState('playing');
    } else if (recording) {
      setRecordingState('stopped');
    } else {
      setRecordingState('idle');
    }
  }, [isRecording, isPlaying, recording]);

  // Clear transcript when recording stops
  useEffect(() => {
    if (!isRecording) {
      // Keep transcript visible for a moment
      const timer = setTimeout(() => {
        // Don't clear if we're in stopped state (recording exists)
        if (recordingState !== 'stopped') {
          setLastTranscript('');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, recordingState]);

  // Announce language switch
  useEffect(() => {
    const langCode = language === 'en' ? 'en-US' : 'tr-TR';
    const timer = setTimeout(() => {
      speak(t.messages.languageSwitched, langCode);
    }, 100);
    return () => clearTimeout(timer);
  }, [language, t.messages.languageSwitched]);

  // Display errors
  useEffect(() => {
    if (recordingError || voiceError) {
      console.error('Error:', recordingError || voiceError);
    }
  }, [recordingError, voiceError]);

  return (
    <div
      className="min-h-screen bg-black flex flex-col items-center justify-start p-8"
      role="main"
      aria-label={t.accessibility.mainRegion}
    >
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto mb-12">
        <h1 className="text-6xl font-bold text-white text-center uppercase tracking-wider mb-4">
          {t.appTitle}
        </h1>
        <div className="flex flex-col items-center justify-center gap-3 text-white text-xl">
          <span className="uppercase tracking-wide">
            {language === 'en' ? 'English' : 'Türkçe'}
          </span>
          {isListening ? (
            <span className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-lg font-bold">
                {language === 'en' ? 'Listening for commands...' : 'Ses dinleniyor...'}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-full">
              <span className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-lg">
                {language === 'en' ? 'Starting...' : 'Başlatılıyor...'}
              </span>
            </span>
          )}
        </div>
      </header>

      {/* Recording Controls */}
      <RecordingControls state={recordingState} />

      {/* Transcription Display */}
      <TranscriptionDisplay transcript={lastTranscript} isRecording={isRecording} />

      {/* Error Display */}
      {(recordingError || voiceError) && (
        <div
          className="mt-8 bg-white text-black p-6 rounded-lg max-w-4xl w-full"
          role="alert"
        >
          <p className="text-2xl font-bold mb-4">⚠️ Hata / Error</p>
          <p className="text-xl mb-4">{recordingError || voiceError}</p>
          <div className="text-left text-lg space-y-2">
            <p className="font-bold">Çözüm / Solution:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chrome, Edge veya Safari kullanın / Use Chrome, Edge or Safari</li>
              <li>Mikrofon iznini verin / Grant microphone permission</li>
              <li>Sayfayı yenileyin / Refresh the page</li>
              <li>HTTPS kullanıyor olmalısınız / Must use HTTPS</li>
            </ul>
          </div>
        </div>
      )}

      {/* Browser Warning for Firefox */}
      {typeof window !== 'undefined' && navigator.userAgent.includes('Firefox') && (
        <div
          className="mt-8 bg-white text-black p-6 rounded-lg max-w-4xl w-full"
          role="alert"
        >
          <p className="text-2xl font-bold mb-4">⚠️ Tarayıcı Uyarısı / Browser Warning</p>
          <p className="text-xl mb-2">
            Firefox Web Speech API'yi desteklemiyor.
          </p>
          <p className="text-xl">
            Firefox does not support Web Speech API.
          </p>
          <p className="text-lg mt-4 font-bold">
            Lütfen Chrome, Edge veya Safari kullanın / Please use Chrome, Edge or Safari
          </p>
        </div>
      )}

      {/* Footer Instructions */}
      <footer className="mt-auto pt-12 text-white text-center text-lg">
        <p className="opacity-70">
          Press <kbd className="bg-white text-black px-2 py-1 rounded font-mono">Alt+L</kbd> to
          switch language
        </p>
      </footer>
    </div>
  );
};

export default VoiceRecorder;

