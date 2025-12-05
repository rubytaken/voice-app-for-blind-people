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
        className={`relative card p-6 md:p-8 min-h-[200px] transition-all duration-300 ${isRecording
            ? 'border-red-300 dark:border-red-800/50 shadow-soft-lg'
            : transcript
              ? 'border-stone-300 dark:border-stone-700 shadow-soft'
              : 'border-stone-200 dark:border-stone-800'
          }`}
        role="region"
        aria-label={language === 'en' ? 'Transcription area' : 'Metin alanı'}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Header with Status Indicator */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className={`relative ${isRecording ? 'w-3 h-3' : 'w-2.5 h-2.5'}`}>
              <div
                className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500' : transcript ? 'bg-stone-500 dark:bg-stone-400' : 'bg-stone-300 dark:bg-stone-600'
                  }`}
              />
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              )}
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-stone-800 dark:text-stone-200">
              {isRecording
                ? language === 'en'
                  ? 'Live Transcription'
                  : 'Canlı Yazıya Çevirme'
                : transcript
                  ? language === 'en'
                    ? 'Transcription'
                    : 'Metin'
                  : language === 'en'
                    ? 'Ready'
                    : 'Hazır'}
            </h2>
          </div>
          {transcript && (
            <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-800/50 px-2.5 py-1 rounded-md">
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
          className="text-stone-800 dark:text-stone-200 text-lg md:text-xl leading-relaxed break-words max-h-[350px] overflow-y-auto custom-scrollbar"
        >
          {transcript ? (
            <p className="font-medium whitespace-pre-wrap">{transcript}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-stone-400 dark:text-stone-500"
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
              </div>
              <p className="text-stone-400 dark:text-stone-500 text-base">
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
          <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-500">
              <span className="flex items-center gap-1.5">
                <strong className="text-stone-600 dark:text-stone-400">{transcript.length}</strong>
                {language === 'en' ? 'characters' : 'karakter'}
              </span>
              <span className="w-1 h-1 bg-stone-300 dark:bg-stone-600 rounded-full" />
              <span className="flex items-center gap-1.5">
                <strong className="text-stone-600 dark:text-stone-400">{transcript.split(/\s+/).filter(w => w.length > 0).length}</strong>
                {language === 'en' ? 'words' : 'kelime'}
              </span>
            </div>
            {isRecording && (
              <span className="flex items-center gap-2 text-xs text-red-500 dark:text-red-400 font-medium">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {language === 'en' ? 'RECORDING' : 'KAYIT DEVAM EDİYOR'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
