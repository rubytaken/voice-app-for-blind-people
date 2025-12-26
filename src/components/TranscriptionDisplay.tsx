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
        className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
          isRecording
            ? 'shadow-amber-glow ring-2 ring-amber-400/30 dark:ring-amber-500/20'
            : transcript
              ? 'shadow-warm-lg'
              : 'shadow-warm'
        }`}
        style={{
          background: isRecording 
            ? 'linear-gradient(135deg, rgba(255,251,235,0.95) 0%, rgba(254,243,199,0.9) 100%)'
            : 'rgba(255,255,255,0.95)'
        }}
        role="region"
        aria-label={language === 'en' ? 'Transcription area' : 'Metin alanı'}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Dark mode background override */}
        <div 
          className="dark:block hidden absolute inset-0"
          style={{
            background: isRecording
              ? 'linear-gradient(135deg, rgba(45,37,32,0.98) 0%, rgba(60,45,30,0.95) 100%)'
              : 'rgba(45,37,32,0.98)'
          }}
        />
        
        {/* Content wrapper */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Header with Status Indicator */}
          <div className="flex items-center justify-between mb-5 pb-5 border-b border-cream-200 dark:border-espresso-700">
            <div className="flex items-center gap-3">
              {/* Status dot with animation */}
              <div className={`relative ${isRecording ? 'w-4 h-4' : 'w-3 h-3'}`}>
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isRecording 
                      ? 'bg-amber-500' 
                      : transcript 
                        ? 'bg-green-500' 
                        : 'bg-cream-400 dark:bg-espresso-600'
                  }`}
                />
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
                    <div className="absolute -inset-1 rounded-full bg-amber-400/30 animate-pulse" />
                  </>
                )}
              </div>
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-espresso-800 dark:text-cream-100">
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
              <div className="flex items-center gap-2 text-xs text-espresso-500 dark:text-cream-500 bg-cream-100 dark:bg-espresso-800 px-3 py-1.5 rounded-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="font-medium">{transcript.length} chars</span>
              </div>
            )}
          </div>

          {/* Transcription Text Area */}
          <div
            ref={textRef}
            className="min-h-[180px] max-h-[400px] overflow-y-auto custom-scrollbar"
          >
            {transcript ? (
              <p className="font-sans text-lg md:text-xl leading-relaxed text-espresso-800 dark:text-cream-200 whitespace-pre-wrap break-words">
                {transcript}
                {isRecording && (
                  <span className="inline-flex ml-1">
                    <span className="w-0.5 h-6 bg-amber-500 animate-pulse" />
                  </span>
                )}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {/* Microphone illustration */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200 dark:from-espresso-800 dark:to-espresso-700 flex items-center justify-center shadow-inner-warm">
                    <svg
                      className={`w-10 h-10 transition-colors duration-300 ${
                        isRecording 
                          ? 'text-amber-500 animate-pulse-gentle' 
                          : 'text-espresso-400 dark:text-cream-500'
                      }`}
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
                  {/* Decorative rings */}
                  <div className="absolute -inset-2 rounded-3xl border border-cream-200 dark:border-espresso-700 opacity-50" />
                  <div className="absolute -inset-4 rounded-[1.75rem] border border-cream-100 dark:border-espresso-800 opacity-30" />
                </div>
                <p className="text-espresso-500 dark:text-cream-500 text-base font-medium">
                  {isRecording
                    ? language === 'en'
                      ? 'Listening to your voice...'
                      : 'Sesinizi dinliyor...'
                    : language === 'en'
                      ? 'Start recording to see transcription'
                      : 'Metni görmek için kayda başlayın'}
                </p>
                <p className="text-espresso-400 dark:text-cream-600 text-sm mt-2">
                  {language === 'en'
                    ? 'Say "start recording" or press Space'
                    : '"Kayda başla" deyin veya Space tuşuna basın'}
                </p>
              </div>
            )}
          </div>

          {/* Word Count Footer */}
          {transcript && (
            <div className="mt-5 pt-5 border-t border-cream-200 dark:border-espresso-700 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-espresso-500 dark:text-cream-500">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-400 rounded-full" />
                  <strong className="text-espresso-700 dark:text-cream-300 font-semibold">{transcript.length}</strong>
                  <span>{language === 'en' ? 'characters' : 'karakter'}</span>
                </span>
                <span className="w-1 h-1 bg-cream-300 dark:bg-espresso-600 rounded-full" />
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <strong className="text-espresso-700 dark:text-cream-300 font-semibold">{transcript.split(/\s+/).filter(w => w.length > 0).length}</strong>
                  <span>{language === 'en' ? 'words' : 'kelime'}</span>
                </span>
              </div>
              {isRecording && (
                <span className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                  </span>
                  {language === 'en' ? 'Recording' : 'Kayıt Devam Ediyor'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;
