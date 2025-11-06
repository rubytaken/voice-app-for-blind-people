import React, { useState, useEffect, useCallback } from 'react';
import { RecordingState, SavedNote as SavedNoteType } from '../types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../hooks/useLanguage';
import { parseVoiceCommand } from '../services/voiceCommandService';
import { speak } from '../services/audioService';
import { saveNote } from '../services/storageService';
import { parseAIVoiceCommand, findNoteByName } from '../services/aiVoiceCommandService';
import RecordingControls from './RecordingControls';
import TranscriptionDisplay from './TranscriptionDisplay';
import SaveControls from './SaveControls';
import SavedNotes from './SavedNotes';

const VoiceRecorder: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [lastTranscript, setLastTranscript] = useState<string>('');
  const [accumulatedTranscript, setAccumulatedTranscript] = useState<string>(''); // All final transcripts
  const [showSavedNotes, setShowSavedNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [currentNote, setCurrentNote] = useState<SavedNoteType | null>(null);

  const {
    startRecording,
    stopRecording,
    playRecording,
    isRecording,
    isPlaying,
    recording,
    error: recordingError,
  } = useAudioRecorder();

  // Handle saving note
  const handleSaveNote = useCallback(async (title: string) => {
    if (!lastTranscript) return;

    try {
      const savedNote = await saveNote(lastTranscript, recording, language, title);
      setSaveSuccess(true);
      setCurrentNote(savedNote);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      const langCode = language === 'en' ? 'en-US' : 'tr-TR';
      speak(language === 'en' ? 'Note saved successfully' : 'Not başarıyla kaydedildi', langCode);
    } catch (error) {
      console.error('Error saving note:', error);
      alert(language === 'en' ? 'Failed to save note' : 'Not kaydedilemedi');
    }
  }, [lastTranscript, recording, language]);

  // Handle loading a saved note
  const handleNoteSelect = useCallback((note: SavedNoteType) => {
    setCurrentNote(note);
    setLastTranscript(note.transcript);
    
    // If note has audio, create a recording object
    if (note.audioBlob && note.audioUrl) {
      // Note: This sets the recording but doesn't update the recorder hook state
      // The user can still play it through the recording controls if needed
    }
  }, []);

  // Handle creating a new note
  const handleNewNote = useCallback(() => {
    setCurrentNote(null);
    setLastTranscript('');
    setAccumulatedTranscript('');
    setRecordingState('idle');
  }, []);

  // Handle voice transcript and commands
  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      // Update transcript display - accumulate text during recording
      if (isRecording) {
        if (isFinal) {
          // Add final transcript to accumulated text
          setAccumulatedTranscript(prev => {
            const newText = prev ? `${prev} ${transcript}` : transcript;
            const finalText = newText.trim();
            // Update lastTranscript to show accumulated
            setLastTranscript(finalText);
            return finalText;
          });
        } else {
          // Show interim results temporarily alongside accumulated
          setLastTranscript(() => {
            // Get current accumulated state and add interim
            const acc = accumulatedTranscript;
            return acc ? `${acc} ${transcript}`.trim() : transcript.trim();
          });
        }
      }

      // First, try AI-powered commands for specific note actions
      if (!isRecording) {
        parseAIVoiceCommand(transcript, language).then(aiCommand => {
          if (aiCommand.action === 'PLAY_SPECIFIC_NOTE' && aiCommand.noteQuery) {
            findNoteByName(aiCommand.noteQuery, language).then(foundNote => {
              if (foundNote && foundNote.audioUrl) {
                const audio = new Audio(foundNote.audioUrl);
                audio.play();
                const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                speak(
                  language === 'en' 
                    ? `Playing ${foundNote.title}` 
                    : `${foundNote.title} oynatılıyor`,
                  langCode
                );
              } else {
                const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                speak(
                  language === 'en' 
                    ? `Note "${aiCommand.noteQuery}" not found or has no audio` 
                    : `"${aiCommand.noteQuery}" notu bulunamadı veya ses kaydı yok`,
                  langCode
                );
              }
            });
            return; // Don't process other commands
          }
        }).catch(err => console.error('AI command error:', err));
      }

      // Parse and handle standard voice commands
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

          case 'SAVE_NOTE':
            if (lastTranscript && !isRecording) {
              handleSaveNote(`Note ${new Date().toLocaleString()}`);
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(language === 'en' ? 'Saving note' : 'Not kaydediliyor', langCode);
            }
            break;

          case 'OPEN_SAVED_NOTES':
            if (!isRecording) {
              setShowSavedNotes(true);
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(language === 'en' ? 'Opening saved notes' : 'Kayıtlı notlar açılıyor', langCode);
            }
            break;

          case 'NEW_NOTE':
            if (!isRecording) {
              handleNewNote();
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(language === 'en' ? 'Starting new note' : 'Yeni not başlatılıyor', langCode);
            }
            break;

          case 'PLAY_SAVED_NOTE':
            if (currentNote && currentNote.audioUrl && !isRecording) {
              // Play the current note's audio if available
              const audio = new Audio(currentNote.audioUrl);
              audio.play();
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(language === 'en' ? 'Playing saved note' : 'Kaydedilen not oynatılıyor', langCode);
            } else if (!currentNote) {
              const langCode = language === 'en' ? 'en-US' : 'tr-TR';
              speak(language === 'en' ? 'No note is open' : 'Açık not yok', langCode);
            }
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
      lastTranscript,
      currentNote,
      handleSaveNote,
      handleNewNote,
      accumulatedTranscript,
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

  // Clear transcript when starting a new recording
  useEffect(() => {
    if (isRecording) {
      // Clear accumulated transcript when starting new recording
      setAccumulatedTranscript('');
    }
  }, [isRecording]);

  // Keep transcript visible after recording stops
  useEffect(() => {
    if (!isRecording && recordingState === 'idle' && !recording) {
      // Only clear if we're back to idle with no recording
      const timer = setTimeout(() => {
        setLastTranscript('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isRecording, recordingState, recording]);

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
      className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 flex flex-col items-center justify-start p-8 transition-all duration-500"
      role="main"
      aria-label={t.accessibility.mainRegion}
    >
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-40 animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-slate-200 dark:bg-slate-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-40 animate-float animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-200 dark:bg-gray-800 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-40 animate-float animation-delay-4000" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Header */}
        <header className="w-full mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-blue-700 to-slate-700 dark:from-slate-200 dark:via-blue-400 dark:to-slate-200 uppercase tracking-wider">
              {t.appTitle}
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNewNote}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                title={language === 'en' ? 'New Note' : 'Yeni Not'}
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setShowSavedNotes(true)}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                title={language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm uppercase tracking-wide font-semibold text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
                {language === 'en' ? 'English' : 'Türkçe'}
              </span>
              {isListening ? (
                <span className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {language === 'en' ? 'Listening' : 'Dinliyor'}
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-full shadow-md">
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {language === 'en' ? 'Starting...' : 'Başlatılıyor...'}
                  </span>
                </span>
              )}
            </div>
            {currentNote && (
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg className="w-4 h-4 text-blue-700 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-200 truncate max-w-xs">
                  {currentNote.title}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-500 dark:border-green-500/50 rounded-xl flex items-center gap-3 animate-fade-in">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-900 dark:text-green-200 font-medium">
              {language === 'en' ? 'Note saved successfully!' : 'Not başarıyla kaydedildi!'}
            </span>
          </div>
        )}

        {/* Transcription Display - Moved to Top */}
        <TranscriptionDisplay transcript={lastTranscript} isRecording={isRecording} />

        {/* Save Controls */}
        <SaveControls 
          transcript={lastTranscript} 
          onSave={handleSaveNote}
          disabled={isRecording}
        />

        {/* Recording Controls */}
        <div className="mt-8">
          <RecordingControls state={recordingState} />
        </div>

        {/* Error Display */}
        {(recordingError || voiceError) && (
          <div
            className="mt-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-red-200 dark:border-red-800"
            role="alert"
          >
            <p className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              <span>Hata / Error</span>
            </p>
            <p className="text-xl mb-4 text-gray-700 dark:text-gray-300">{recordingError || voiceError}</p>
            <div className="text-left text-lg space-y-2">
              <p className="font-bold">Çözüm / Solution:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
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
            className="mt-8 bg-amber-50 dark:bg-amber-900/20 text-gray-900 dark:text-gray-100 p-8 rounded-2xl shadow-xl backdrop-blur-sm border border-amber-200 dark:border-amber-800"
            role="alert"
          >
            <p className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              <span>Tarayıcı Uyarısı / Browser Warning</span>
            </p>
            <p className="text-xl mb-2">
              Firefox Web Speech API'yi desteklemiyor.
            </p>
            <p className="text-xl">
              Firefox does not support Web Speech API.
            </p>
            <p className="text-lg mt-4 font-bold text-amber-700 dark:text-amber-400">
              Lütfen Chrome, Edge veya Safari kullanın / Please use Chrome, Edge or Safari
            </p>
          </div>
        )}

        {/* Footer Instructions */}
        <footer className="mt-12 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Press{' '}
            <kbd className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded font-mono text-xs shadow-md border border-gray-300 dark:border-gray-700">
              Alt+L
            </kbd>{' '}
            to switch language
          </p>
        </footer>
      </div>

      {/* Saved Notes Modal */}
      {showSavedNotes && (
        <SavedNotes
          onNoteSelect={handleNoteSelect}
          onClose={() => setShowSavedNotes(false)}
        />
      )}
    </div>
  );
};

export default VoiceRecorder;

