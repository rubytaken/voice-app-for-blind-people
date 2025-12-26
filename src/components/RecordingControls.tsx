import React from 'react';
import { RecordingState } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface RecordingControlsProps {
  state: RecordingState;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ state }) => {
  const { t, language } = useLanguage();

  const getStatusText = () => {
    switch (state) {
      case 'recording':
        return t.status.recording;
      case 'playing':
        return t.status.playing;
      case 'stopped':
        return t.status.stopped;
      default:
        return t.status.idle;
    }
  };

  const getStatusStyles = () => {
    switch (state) {
      case 'recording':
        return {
          outerRing: 'ring-amber-400/30 dark:ring-amber-500/20',
          gradient: 'from-amber-400 via-amber-500 to-orange-600',
          shadow: 'shadow-amber-glow-lg',
          pulse: true,
          iconBg: 'bg-white/20',
        };
      case 'playing':
        return {
          outerRing: 'ring-green-400/30 dark:ring-green-500/20',
          gradient: 'from-green-400 via-green-500 to-emerald-600',
          shadow: 'shadow-lg',
          pulse: false,
          iconBg: 'bg-white/20',
        };
      case 'stopped':
        return {
          outerRing: 'ring-espresso-300/20 dark:ring-espresso-600/20',
          gradient: 'from-espresso-400 via-espresso-500 to-espresso-600',
          shadow: 'shadow-warm',
          pulse: false,
          iconBg: 'bg-white/15',
        };
      default:
        return {
          outerRing: 'ring-cream-300/30 dark:ring-espresso-700/30',
          gradient: 'from-espresso-600 via-espresso-700 to-espresso-800 dark:from-cream-200 dark:via-cream-300 dark:to-cream-400',
          shadow: 'shadow-warm',
          pulse: false,
          iconBg: 'bg-white/10 dark:bg-espresso-800/20',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className="flex flex-col items-center justify-center gap-10 w-full max-w-4xl mx-auto"
      role="region"
      aria-label={t.accessibility.statusRegion}
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Visual Status Indicator */}
      <div className="relative flex items-center justify-center">
        {/* Outer decorative rings */}
        <div className={`absolute w-44 h-44 rounded-full ring-2 ${styles.outerRing} transition-all duration-700`} />
        <div className={`absolute w-52 h-52 rounded-full ring-1 ${styles.outerRing} opacity-50 transition-all duration-700`} />

        {/* Pulsing effects for recording state */}
        {state === 'recording' && (
          <>
            <div className="absolute w-40 h-40 rounded-full bg-amber-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute w-48 h-48 rounded-full bg-amber-400/10 animate-pulse" />
            {/* Sound wave rings */}
            <div className="absolute w-36 h-36 rounded-full border-2 border-amber-400/40 animate-ping" style={{ animationDuration: '2s' }} />
          </>
        )}

        {/* Main status circle */}
        <div
          className={`relative w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br ${styles.gradient} ${styles.shadow} transition-all duration-500 ${
            state === 'recording' ? 'scale-110 animate-recording-pulse' : 'scale-100'
          } flex items-center justify-center`}
          role="status"
          aria-label={getStatusText()}
        >
          {/* Glossy overlay */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" style={{ height: '50%' }} />
          </div>

          {/* Inner icon/indicator */}
          {state === 'recording' ? (
            <div className={`w-16 h-16 md:w-20 md:h-20 ${styles.iconBg} rounded-full flex items-center justify-center backdrop-blur-sm`}>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg shadow-lg" />
            </div>
          ) : state === 'playing' ? (
            <div className={`w-16 h-16 md:w-20 md:h-20 ${styles.iconBg} rounded-full flex items-center justify-center backdrop-blur-sm`}>
              <svg className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          ) : (
            <div className={`w-16 h-16 md:w-20 md:h-20 ${styles.iconBg} rounded-full flex items-center justify-center backdrop-blur-sm`}>
              <svg className="w-10 h-10 md:w-12 md:h-12 text-white dark:text-espresso-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          )}
        </div>

        {/* Audio wave visualization for recording */}
        {state === 'recording' && (
          <div className="absolute -bottom-6 flex items-end justify-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full"
                style={{
                  height: '24px',
                  animation: `wave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-espresso-800 dark:text-cream-100 tracking-tight">
          {getStatusText()}
        </h2>
        <p className="mt-2 text-espresso-500 dark:text-cream-500 text-sm">
          {state === 'idle' && (language === 'en' ? 'Ready to record your voice' : 'Sesinizi kaydetmeye hazır')}
          {state === 'recording' && (language === 'en' ? 'Speak clearly into the microphone' : 'Mikrofona net bir şekilde konuşun')}
          {state === 'playing' && (language === 'en' ? 'Playing your recording' : 'Kaydınız oynatılıyor')}
          {state === 'stopped' && (language === 'en' ? 'Recording complete' : 'Kayıt tamamlandı')}
        </p>
      </div>

      {/* Instructions Card */}
      <div 
        className="w-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px -6px rgba(139, 69, 19, 0.1), 0 2px 12px -4px rgba(139, 69, 19, 0.06)',
          border: '1px solid rgba(210, 180, 140, 0.3)'
        }}
      >
        <div className="dark:block hidden absolute inset-0 rounded-2xl" style={{
          background: 'rgba(45,37,32,0.9)',
          border: '1px solid rgba(100, 80, 60, 0.3)'
        }} />
        
        <div className="relative p-6 md:p-8">
          <h3 className="font-serif text-xl font-semibold text-espresso-800 dark:text-cream-100 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            {language === 'en' ? 'Voice Commands' : 'Sesli Komutlar'}
          </h3>
          
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { text: t.instructions.startRecording, accent: false },
              { text: t.instructions.stopRecording, accent: false },
              { text: t.instructions.playRecording, accent: false },
              { text: t.instructions.saveNote, accent: true },
              { text: t.instructions.openNotes, accent: true },
              { text: t.instructions.newNote, accent: true },
              { text: t.instructions.playNote, accent: true },
              { text: t.instructions.switchLanguage, accent: false },
            ].map((item, index) => (
              <li 
                key={index}
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-cream-100/70 dark:hover:bg-espresso-800/50 transition-all duration-200 cursor-default group"
              >
                <span 
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125 ${
                    item.accent 
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm' 
                      : 'bg-espresso-300 dark:bg-cream-600'
                  }`} 
                />
                <span className="text-espresso-600 dark:text-cream-400 text-sm font-medium">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecordingControls;
