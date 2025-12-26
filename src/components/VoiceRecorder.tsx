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
    
    // Command debounce - prevent duplicate command execution
    const lastCommandRef = useRef<{ action: string; timestamp: number } | null>(null);
    const COMMAND_COOLDOWN_MS = 2000; // 2 second cooldown between same commands

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
        if (!transcript) {
            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
            speak(language === 'en' ? 'No transcript to save' : 'Kaydedilecek metin yok', langCode);
            return;
        }

        try {
            // Use ref to get the most up-to-date recording
            const currentRecording = recordingRef.current;
            
            // Pass undefined title to let storageService auto-generate from transcript
            const savedNote = await saveNote(transcript, currentRecording, language, title);
            setSaveSuccess(true);
            setCurrentNote(savedNote);

            setTimeout(() => setSaveSuccess(false), 3000);

            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
            const hasAudio = currentRecording?.blob ? true : false;
            const message = hasAudio
                ? (language === 'en' ? 'Note saved with audio' : 'Not sesli olarak kaydedildi')
                : (language === 'en' ? 'Note saved' : 'Not kaydedildi');
            speak(message, langCode);
        } catch (error: any) {
            console.error('Error saving note:', error);
            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
            speak(language === 'en' ? 'Failed to save note' : 'Not kaydedilemedi', langCode);
            alert(error.message || (language === 'en' ? 'Failed to save note' : 'Not kaydedilemedi'));
        }
    }, [language]);

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

            // Parse and handle voice commands - only process on final transcripts to prevent duplicates
            // Skip command processing for interim results
            if (!isFinal) {
                return;
            }
            
            const command = parseVoiceCommand(transcript);
            if (command) {
                // Check if this command was recently executed (debounce)
                const now = Date.now();
                const lastCommand = lastCommandRef.current;
                
                if (lastCommand && 
                    lastCommand.action === command.action && 
                    (now - lastCommand.timestamp) < COMMAND_COOLDOWN_MS) {
                    console.log('Command debounced (too soon):', command.action);
                    return;
                }
                
                // Update last command tracking
                lastCommandRef.current = { action: command.action, timestamp: now };
                
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
            className="min-h-screen relative overflow-hidden transition-all duration-700"
            style={{
                background: 'linear-gradient(135deg, hsl(45 30% 96%) 0%, hsl(40 25% 92%) 50%, hsl(35 20% 90%) 100%)'
            }}
            role="main"
            aria-label={t.accessibility.mainRegion}
        >
            {/* Dark mode background */}
            <div className="dark:block hidden absolute inset-0 transition-all duration-700" style={{
                background: 'linear-gradient(135deg, hsl(25 25% 8%) 0%, hsl(25 20% 11%) 50%, hsl(25 18% 9%) 100%)'
            }} />

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Warm radial glow - top */}
                <div 
                    className="absolute -top-1/4 left-1/4 w-[800px] h-[800px] rounded-full animate-float opacity-40 dark:opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 40%, transparent 70%)'
                    }}
                />
                {/* Secondary glow - bottom right */}
                <div 
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full animate-float-slow animation-delay-2000 opacity-30 dark:opacity-15"
                    style={{
                        background: 'radial-gradient(circle, rgba(180, 83, 9, 0.12) 0%, rgba(139, 69, 19, 0.04) 50%, transparent 70%)'
                    }}
                />
                {/* Subtle grain overlay */}
                <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} />
            </div>

            {/* Audio Unlock Overlay - Shows on first load to enable audio playback */}
            {!isAudioUnlocked && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(26, 22, 18, 0.9)', backdropFilter: 'blur(8px)' }}
                    onClick={unlockAudio}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && unlockAudio()}
                    aria-label={language === 'en' ? 'Click to enable audio' : 'Sesi etkinleştirmek için tıklayın'}
                >
                    <div className="bg-cream-50 dark:bg-espresso-800 rounded-3xl p-10 max-w-md text-center shadow-warm-xl animate-scale-in border border-cream-300 dark:border-espresso-700">
                        {/* Animated Sound Icon */}
                        <div className="relative w-24 h-24 mx-auto mb-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full animate-glow" />
                            <div className="absolute inset-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-amber-glow">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="font-serif text-3xl font-semibold text-espresso-800 dark:text-cream-100 mb-4">
                            {language === 'en' ? 'Enable Audio' : 'Sesi Etkinleştir'}
                        </h2>
                        <p className="text-espresso-600 dark:text-cream-400 mb-8 leading-relaxed">
                            {language === 'en'
                                ? 'Tap anywhere to enable audio playback for voice commands and feedback'
                                : 'Sesli komutlar ve geri bildirim için ses oynatmayı etkinleştirmek üzere herhangi bir yere dokunun'}
                        </p>
                        <button
                            onClick={unlockAudio}
                            className="w-full py-4 px-8 btn-primary text-lg font-semibold rounded-2xl"
                        >
                            {language === 'en' ? '🔊 Enable Audio' : '🔊 Sesi Etkinleştir'}
                        </button>
                        <p className="mt-6 text-sm text-espresso-400 dark:text-espresso-500">
                            {language === 'en'
                                ? 'Required for audio playback on mobile devices'
                                : 'Mobil cihazlarda ses oynatma için gereklidir'}
                        </p>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header */}
                <header className="w-full mb-10 animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-amber-glow">
                                    <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </div>
                            </div>
                            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-espresso-800 dark:text-cream-100 tracking-tight">
                                {t.appTitle}
                            </h1>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <button
                                onClick={handleNewNote}
                                className="group p-3 md:p-3.5 bg-white dark:bg-espresso-800 rounded-xl shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 border border-cream-200 dark:border-espresso-700"
                                title={language === 'en' ? 'New Note' : 'Yeni Not'}
                                aria-label={language === 'en' ? 'New Note' : 'Yeni Not'}
                            >
                                <svg className="w-5 h-5 text-espresso-600 dark:text-cream-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setShowSavedNotes(true)}
                                className="group p-3 md:p-3.5 bg-white dark:bg-espresso-800 rounded-xl shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 border border-cream-200 dark:border-espresso-700"
                                title={language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
                                aria-label={language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
                            >
                                <svg className="w-5 h-5 text-espresso-600 dark:text-cream-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Language Badge */}
                            <span className="inline-flex items-center gap-2 text-sm font-medium text-espresso-700 dark:text-cream-300 bg-cream-100 dark:bg-espresso-800 px-4 py-2 rounded-xl border border-cream-200 dark:border-espresso-700 shadow-sm">
                                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                {language === 'en' ? 'English' : 'Türkçe'}
                            </span>
                            
                            {/* Listening Status */}
                            {isListening ? (
                                <span className="flex items-center gap-2.5 bg-white dark:bg-espresso-800 px-4 py-2 rounded-xl shadow-warm border border-cream-200 dark:border-espresso-700">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                    </span>
                                    <span className="text-sm font-medium text-espresso-700 dark:text-cream-300">
                                        {language === 'en' ? 'Listening' : 'Dinliyor'}
                                    </span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2.5 bg-cream-100 dark:bg-espresso-800 px-4 py-2 rounded-xl border border-cream-200 dark:border-espresso-700">
                                    <span className="w-2.5 h-2.5 bg-cream-400 dark:bg-espresso-600 rounded-full" />
                                    <span className="text-sm text-espresso-500 dark:text-espresso-400">
                                        {language === 'en' ? 'Starting...' : 'Başlatılıyor...'}
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Recording Timer */}
                        {isRecording && (
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800/50 animate-fade-in shadow-warm">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                                </span>
                                <span className="text-xl font-mono font-bold text-amber-700 dark:text-amber-400 tracking-wider">
                                    {formatTime(recordingDuration)}
                                </span>
                            </div>
                        )}

                        {/* Current Note Indicator with Play Button */}
                        {currentNote && (
                            <div className="flex items-center gap-2 bg-cream-100 dark:bg-espresso-800 pl-4 pr-2 py-2 rounded-xl border border-cream-200 dark:border-espresso-700 animate-slide-in-right">
                                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm font-medium text-espresso-700 dark:text-cream-300 truncate max-w-[150px]">
                                    {currentNote.title}
                                </span>
                                {currentNote.audioUrl && (
                                    <button
                                        onClick={() => {
                                            const audio = new Audio(currentNote.audioUrl);
                                            audio.play().catch(err => console.error('Error playing note audio:', err));
                                            const langCode = language === 'en' ? 'en-US' : 'tr-TR';
                                            speak(language === 'en' ? 'Playing note' : 'Not oynatılıyor', langCode);
                                        }}
                                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                                        title={language === 'en' ? 'Play note audio' : 'Notu oynat'}
                                        aria-label={language === 'en' ? 'Play note audio' : 'Notu oynat'}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Success Message */}
                {saveSuccess && (
                    <div className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200 dark:border-green-800/50 rounded-2xl flex items-center gap-4 animate-fade-in shadow-warm">
                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-green-800 dark:text-green-200 font-semibold text-lg">
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
                <div className="mt-10">
                    <RecordingControls state={recordingState} />
                </div>

                {/* Error Display */}
                {(recordingError || voiceError) && (
                    <div
                        className="mt-10 card-elevated p-6 md:p-8 border-l-4 border-amber-500"
                        role="alert"
                    >
                        <p className="text-lg font-serif font-semibold mb-4 flex items-center gap-3 text-espresso-800 dark:text-cream-200">
                            <span className="text-2xl">⚠️</span>
                            <span>Hata / Error</span>
                        </p>
                        <p className="text-espresso-600 dark:text-cream-400 mb-5">{recordingError || voiceError}</p>
                        <div className="text-left text-sm space-y-2">
                            <p className="font-semibold text-espresso-700 dark:text-cream-300">Çözüm / Solution:</p>
                            <ul className="list-none space-y-2 text-espresso-500 dark:text-cream-500">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Chrome, Edge veya Safari kullanın / Use Chrome, Edge or Safari
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Mikrofon iznini verin / Grant microphone permission
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    Sayfayı yenileyin / Refresh the page
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                    HTTPS kullanıyor olmalısınız / Must use HTTPS
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Browser Warning for Firefox */}
                {typeof window !== 'undefined' && navigator.userAgent.includes('Firefox') && (
                    <div
                        className="mt-10 card-elevated p-6 md:p-8 border-l-4 border-amber-400"
                        role="alert"
                    >
                        <p className="text-lg font-serif font-semibold mb-4 flex items-center gap-3 text-espresso-800 dark:text-cream-200">
                            <span className="text-2xl">⚠️</span>
                            <span>Tarayıcı Uyarısı / Browser Warning</span>
                        </p>
                        <p className="text-espresso-600 dark:text-cream-400 mb-2">
                            Firefox Web Speech API'yi desteklemiyor.
                        </p>
                        <p className="text-espresso-600 dark:text-cream-400">
                            Firefox does not support Web Speech API.
                        </p>
                        <p className="text-sm mt-4 font-medium text-amber-700 dark:text-amber-400">
                            Lütfen Chrome, Edge veya Safari kullanın / Please use Chrome, Edge or Safari
                        </p>
                    </div>
                )}

                {/* Footer Instructions */}
                <footer className="mt-16 pt-8 text-center border-t border-cream-200 dark:border-espresso-800">
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-espresso-500 dark:text-cream-500">
                        <span className="flex items-center gap-2">
                            <kbd className="px-2.5 py-1.5 bg-white dark:bg-espresso-800 text-espresso-700 dark:text-cream-300 rounded-lg font-mono text-xs border border-cream-200 dark:border-espresso-700 shadow-sm">
                                Alt+L
                            </kbd>
                            <span>{language === 'en' ? 'Switch language' : 'Dil değiştir'}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <kbd className="px-2.5 py-1.5 bg-white dark:bg-espresso-800 text-espresso-700 dark:text-cream-300 rounded-lg font-mono text-xs border border-cream-200 dark:border-espresso-700 shadow-sm">
                                Space
                            </kbd>
                            <span>{language === 'en' ? 'Record/Stop' : 'Kaydet/Durdur'}</span>
                        </span>
                        <span className="flex items-center gap-2">
                            <kbd className="px-2.5 py-1.5 bg-white dark:bg-espresso-800 text-espresso-700 dark:text-cream-300 rounded-lg font-mono text-xs border border-cream-200 dark:border-espresso-700 shadow-sm">
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
