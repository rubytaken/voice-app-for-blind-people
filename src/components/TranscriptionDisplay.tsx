import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface TranscriptionDisplayProps {
  transcript: string;
  isRecording: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcript,
  isRecording,
}) => {
  const { language } = useLanguage();
  const textRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (textRef.current && isRecording) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [transcript, isRecording]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 md:p-8 min-h-[250px] shadow-lg border transition-all duration-300 ${
          isRecording
            ? 'border-red-600 dark:border-red-500 shadow-md'
            : transcript
            ? 'border-blue-600 dark:border-blue-500 shadow-md'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        role="region"
        aria-label={language === 'en' ? 'Transcription area' : 'Metin alanı'}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Header with Status Indicator */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`relative ${isRecording ? 'w-4 h-4' : 'w-3 h-3'}`}>
              <div
                className={`absolute inset-0 rounded-full ${
                  isRecording ? 'bg-red-600 animate-pulse' : transcript ? 'bg-blue-600' : 'bg-gray-500'
                }`}
              />
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75" />
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              {isRecording
                ? language === 'en'
                  ? '🎤 Live Transcription'
                  : '🎤 Canlı Yazıya Çevirme'
                : transcript
                ? language === 'en'
                  ? '📝 Transcription'
                  : '📝 Metin'
                : language === 'en'
                ? '⭕ Ready'
                : '⭕ Hazır'}
            </h2>
          </div>
          {transcript && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>{transcript.length}</span>
            </div>
          )}
        </div>

        {/* Transcription Text Area */}
        <div
          ref={textRef}
          className="text-gray-900 dark:text-gray-100 text-xl md:text-2xl leading-relaxed break-words max-h-[400px] overflow-y-auto custom-scrollbar"
        >
          {transcript ? (
            <p className="font-medium whitespace-pre-wrap">{transcript}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg
                className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <p className="text-gray-400 dark:text-gray-500 italic text-lg">
                {isRecording
                  ? language === 'en'
                    ? 'Listening...'
                    : 'Dinleniyor...'
                  : language === 'en'
                  ? 'Start recording to see transcription'
                  : 'Metni görmek için kayda başlayın'}
              </p>
            </div>
          )}
        </div>

        {/* Word Count Footer */}
        {transcript && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <strong>{transcript.length}</strong>{' '}
                {language === 'en' ? 'characters' : 'karakter'}
              </span>
              <span className="flex items-center gap-1">
                <strong>{transcript.split(/\s+/).filter(w => w.length > 0).length}</strong>{' '}
                {language === 'en' ? 'words' : 'kelime'}
              </span>
            </div>
            {isRecording && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">
                {language === 'en' ? '● RECORDING' : '● KAYIT DEVAM EDİYOR'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;

