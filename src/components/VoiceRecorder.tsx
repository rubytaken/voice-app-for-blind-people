import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RecordingState, SavedNote as SavedNoteType } from '../types';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../hooks/useLanguage';
import { parseVoiceCommand } from '../services/voiceCommandService';
import { speak } from '../services/audioService';
import { saveNote } from '../services/storageService';
import RecordingControls from './RecordingControls';
import TranscriptionDisplay from './TranscriptionDisplay';
import SaveControls from './SaveControls';
import SavedNotes from './SavedNotes';

const VoiceRecorder: React.FC = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [lastTranscript, setLastTranscript] = useState<string>('');
    const [accumulatedTranscript, setAccumulatedTranscript] = useState<string>('');
    const [showSavedNotes, setShowSavedNotes] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [currentNote, setCurrentNote] = useState<SavedNoteType | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Use refs for values that need to be accessed in callbacks without causing re-renders
    const isRecordingRef = useRef(false);
    const lastTranscriptRef = useRef('');
    const accumulatedTranscriptRef = useRef('');
    const recordingRef = useRef<typeof recording>(null);

    const {
        startRecording,
        stopRecording,
        playRecording,
        isRecording,
        isPlaying,
        recording,
        error: recordingError,
        unlockAudio,
        isAudioUnlocked,
    } = useAudioRecorder();

    // Keep refs in sync with state
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    useEffect(() => {
        lastTranscriptRef.current = lastTranscript;
    }, [lastTranscript]);

    useEffect(() => {
        accumulatedTranscriptRef.current = accumulatedTranscript;
    }, [accumulatedTranscript]);

    useEffect(() => {
        recordingRef.current = recording;
        console.log('Recording updated:', recording ? 'has recording' : 'no recording');
    }, [recording]);

    // Recording timer
    useEffect(() => {
        if (isRecording) {
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle saving note
    const handleSaveNote = useCallback(async (title?: string) => {
        const transcript = lastTranscriptRef.current;
        if (!transcript) return;

        try {
            // Pass undefined title to let storageService auto-generate from transcript
            const savedNote = await saveNote(transcript, recording, language, title);
            setSaveSuccess(true);
            setCurrentNote(savedNote);

            setTimeout(() => setSaveSuccess(false), 3000);

            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
            speak(language === 'en' ? 'Note saved successfully' : 'Not başarıyla kaydedildi', langCode);
        } catch (error) {
            console.error('Error saving note:', error);
            alert(language === 'en' ? 'Failed to save note' : 'Not kaydedilemedi');
        }
    }, [recording, language]);

    // Handle loading a saved note
    const handleNoteSelect = useCallback((note: SavedNoteType) => {
        setCurrentNote(note);
        setLastTranscript(note.transcript);
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
            const currentIsRecording = isRecordingRef.current;

            // Update transcript display during recording
            if (currentIsRecording) {
                if (isFinal) {
                    setAccumulatedTranscript(prev => {
                        const newText = prev ? `${prev} ${transcript}` : transcript;
                        const finalText = newText.trim();
                        setLastTranscript(finalText);
                        accumulatedTranscriptRef.current = finalText;
                        lastTranscriptRef.current = finalText;
                        return finalText;
                    });
                } else {
                    const acc = accumulatedTranscriptRef.current;
                    const newTranscript = acc ? `${acc} ${transcript}`.trim() : transcript.trim();
                    setLastTranscript(newTranscript);
                    lastTranscriptRef.current = newTranscript;
                }
            }

            // Parse and handle voice commands - always process these
            const command = parseVoiceCommand(transcript);
            if (command) {
                console.log('Voice command detected:', command, 'isRecording:', currentIsRecording);

                switch (command.action) {
                    case 'START_RECORDING':
                        if (!currentIsRecording && !isPlaying) {
                            startRecording();
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(t.messages.recordingStarted, langCode);
                        }
                        break;

                    case 'STOP_RECORDING':
                        if (currentIsRecording) {
                            stopRecording();
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(t.messages.recordingStopped, langCode);
                        }
                        break;

                    case 'PLAY_RECORDING':
                        const currentRecording = recordingRef.current;
                        console.log('Play command - recording:', currentRecording ? 'exists' : 'null');
                        if (!currentIsRecording && !isPlaying && currentRecording) {
                            playRecording();
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(t.messages.playingRecording, langCode);
                        } else if (!currentRecording) {
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(t.messages.noRecording, langCode);
                        }
                        break;

                    case 'SWITCH_LANGUAGE':
                        toggleLanguage();
                        break;

                    case 'SAVE_NOTE':
                        if (lastTranscriptRef.current && !currentIsRecording) {
                            handleSaveNote(); // Auto-generate title from transcript
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(language === 'en' ? 'Saving note' : 'Not kaydediliyor', langCode);
                        }
                        break;

                    case 'OPEN_SAVED_NOTES':
                        if (!currentIsRecording) {
                            setShowSavedNotes(true);
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(language === 'en' ? 'Opening saved notes' : 'Kayıtlı notlar açılıyor', langCode);
                        }
                        break;

                    case 'NEW_NOTE':
                        if (!currentIsRecording) {
                            handleNewNote();
                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                            speak(language === 'en' ? 'Starting new note' : 'Yeni not başlatılıyor', langCode);
                        }
                        break;

                    case 'PLAY_SAVED_NOTE':
                        if (currentNote && currentNote.audioUrl && !currentIsRecording) {
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
            isPlaying,
            startRecording,
            stopRecording,
            playRecording,
            toggleLanguage,
            language,
            t,
            currentNote,
            handleSaveNote,
            handleNewNote,
        ]
    );

    // Initialize voice recognition
    const { isListening, startListening, error: voiceError } = useVoiceRecognition({
        onTranscript: handleTranscript,
        continuous: true,
        interimResults: true,
        language: language === 'en' ? 'en-US' : 'tr-TR',
    });

    // Auto-start voice recognition on mount
    useEffect(() => {
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

    // Clear accumulated transcript when starting a new recording
    useEffect(() => {
        if (isRecording) {
            setAccumulatedTranscript('');
            accumulatedTranscriptRef.current = '';
        }
    }, [isRecording]);

    // Keep transcript visible after recording stops
    useEffect(() => {
        if (!isRecording && recordingState === 'idle' && !recording) {
            const timer = setTimeout(() => {
                setLastTranscript('');
                lastTranscriptRef.current = '';
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Space to start/stop recording (when not typing)
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                if (isRecordingRef.current) {
                    stopRecording();
                } else if (!isPlaying) {
                    startRecording();
                }
            }
            // P to play
            if (e.code === 'KeyP' && e.target === document.body && !isRecordingRef.current && recording) {
                e.preventDefault();
                playRecording();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, recording, startRecording, stopRecording, playRecording]);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-stone-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 flex flex-col items-center justify-start p-6 md:p-8 transition-all duration-500"
            role="main"
            aria-label={t.accessibility.mainRegion}
        >
            {/* Audio Unlock Overlay - Shows on first load to enable audio playback */}
            {!isAudioUnlocked && (
                <div
                    className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={unlockAudio}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && unlockAudio()}
                    aria-label={language === 'en' ? 'Click to enable audio' : 'Sesi etkinleştirmek için tıklayın'}
                >
                    <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 max-w-md text-center shadow-2xl animate-fade-in">
                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                            {language === 'en' ? 'Enable Audio' : 'Sesi Etkinleştir'}
                        </h2>
                        <p className="text-stone-600 dark:text-stone-400 mb-6">
                            {language === 'en'
                                ? 'Tap anywhere to enable audio playback for voice commands'
                                : 'Sesli komutlar için ses oynatmayı etkinleştirmek üzere herhangi bir yere dokunun'}
                        </p>
                        <button
                            onClick={unlockAudio}
                            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            {language === 'en' ? '🔊 Enable Audio' : '🔊 Sesi Etkinleştir'}
                        </button>
                        <p className="mt-4 text-xs text-stone-500 dark:text-stone-500">
                            {language === 'en'
                                ? 'This is required for audio playback on mobile devices'
                                : 'Bu, mobil cihazlarda ses oynatma için gereklidir'}
                        </p>
                    </div>
                </div>
            )}

            {/* Subtle Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-stone-200/30 dark:bg-stone-800/20 rounded-full filter blur-3xl animate-float" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-stone-300/20 dark:bg-stone-700/15 rounded-full filter blur-3xl animate-float animation-delay-2000" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-5xl mx-auto">
                {/* Header */}
                <header className="w-full mb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl md:text-5xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
                            {t.appTitle}
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleNewNote}
                                className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5 border border-stone-200 dark:border-stone-700"
                                title={language === 'en' ? 'New Note' : 'Yeni Not'}
                                aria-label={language === 'en' ? 'New Note' : 'Yeni Not'}
                            >
                                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setShowSavedNotes(true)}
                                className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:-translate-y-0.5 border border-stone-200 dark:border-stone-700"
                                title={language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
                                aria-label={language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
                            >
                                <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                                {language === 'en' ? 'English' : 'Türkçe'}
                            </span>
                            {isListening ? (
                                <span className="flex items-center gap-2 bg-white dark:bg-stone-800 px-4 py-2 rounded-xl shadow-soft border border-stone-200 dark:border-stone-700">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                                        {language === 'en' ? 'Listening' : 'Dinliyor'}
                                    </span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700">
                                    <span className="w-2 h-2 bg-stone-400 rounded-full" />
                                    <span className="text-sm text-stone-500 dark:text-stone-500">
                                        {language === 'en' ? 'Starting...' : 'Başlatılıyor...'}
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Recording Timer */}
                        {isRecording && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/50 animate-fade-in">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-lg font-mono font-semibold text-red-600 dark:text-red-400">
                                    {formatTime(recordingDuration)}
                                </span>
                            </div>
                        )}

                        {currentNote && (
                            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700">
                                <svg className="w-4 h-4 text-stone-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate max-w-xs">
                                    {currentNote.title}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center gap-3 animate-fade-in">
                        <div className="w-8 h-8 flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-emerald-800 dark:text-emerald-200 font-medium">
                            {language === 'en' ? 'Note saved successfully!' : 'Not başarıyla kaydedildi!'}
                        </span>
                    </div>
                )}

                {/* Transcription Display */}
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
                        className="mt-8 card-elevated p-6 border-l-4 border-red-400 dark:border-red-500"
                        role="alert"
                    >
                        <p className="text-lg font-semibold mb-3 flex items-center gap-2 text-stone-800 dark:text-stone-200">
                            <span className="text-2xl">⚠️</span>
                            <span>Hata / Error</span>
                        </p>
                        <p className="text-stone-600 dark:text-stone-400 mb-4">{recordingError || voiceError}</p>
                        <div className="text-left text-sm space-y-1.5">
                            <p className="font-semibold text-stone-700 dark:text-stone-300">Çözüm / Solution:</p>
                            <ul className="list-disc list-inside space-y-1 text-stone-500 dark:text-stone-500">
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
                        className="mt-8 card-elevated p-6 border-l-4 border-amber-400 dark:border-amber-500"
                        role="alert"
                    >
                        <p className="text-lg font-semibold mb-3 flex items-center gap-2 text-stone-800 dark:text-stone-200">
                            <span className="text-2xl">⚠️</span>
                            <span>Tarayıcı Uyarısı / Browser Warning</span>
                        </p>
                        <p className="text-stone-600 dark:text-stone-400 mb-2">
                            Firefox Web Speech API'yi desteklemiyor.
                        </p>
                        <p className="text-stone-600 dark:text-stone-400">
                            Firefox does not support Web Speech API.
                        </p>
                        <p className="text-sm mt-3 font-medium text-amber-700 dark:text-amber-400">
                            Lütfen Chrome, Edge veya Safari kullanın / Please use Chrome, Edge or Safari
                        </p>
                    </div>
                )}

                {/* Footer Instructions */}
                <footer className="mt-12 pt-6 text-center border-t border-stone-200 dark:border-stone-800">
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-stone-500 dark:text-stone-500">
                        <span className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded font-mono text-xs border border-stone-200 dark:border-stone-700">
                                Alt+L
                            </kbd>
                            <span>{language === 'en' ? 'Switch language' : 'Dil değiştir'}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded font-mono text-xs border border-stone-200 dark:border-stone-700">
                                Space
                            </kbd>
                            <span>{language === 'en' ? 'Record/Stop' : 'Kaydet/Durdur'}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded font-mono text-xs border border-stone-200 dark:border-stone-700">
                                P
                            </kbd>
                            <span>{language === 'en' ? 'Play' : 'Oynat'}</span>
                        </span>
                    </div>
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
