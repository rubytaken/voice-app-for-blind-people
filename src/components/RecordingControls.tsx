import React from 'react';
import { RecordingState } from '../types';
import { useLanguage } from '../hooks/useLanguage';

interface RecordingControlsProps {
  state: RecordingState;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ state }) => {
  const { t } = useLanguage();

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
          ring: 'ring-red-500/20 dark:ring-red-400/20',
          bg: 'bg-gradient-to-br from-red-500 to-rose-600',
          shadow: 'shadow-red-500/25',
          pulse: true
        };
      case 'playing':
        return {
          ring: 'ring-stone-400/20 dark:ring-stone-500/20',
          bg: 'bg-gradient-to-br from-stone-600 to-stone-700 dark:from-stone-400 dark:to-stone-500',
          shadow: 'shadow-stone-500/25',
          pulse: false
        };
      case 'stopped':
        return {
          ring: 'ring-stone-300/20 dark:ring-stone-600/20',
          bg: 'bg-gradient-to-br from-stone-400 to-stone-500',
          shadow: 'shadow-stone-400/20',
          pulse: false
        };
      default:
        return {
          ring: 'ring-stone-200/20 dark:ring-stone-700/20',
          bg: 'bg-gradient-to-br from-stone-700 to-stone-800 dark:from-stone-200 dark:to-stone-300',
          shadow: 'shadow-stone-500/20',
          pulse: false
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div
      className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl mx-auto"
      role="region"
      aria-label={t.accessibility.statusRegion}
      aria-live="assertive"
      aria-atomic="true"
    >
      {/* Visual Status Indicator */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className={`absolute w-36 h-36 rounded-full ring-4 ${styles.ring} transition-all duration-500`} />

        {/* Pulsing rings for recording state */}
        {state === 'recording' && (
          <>
            <div className="absolute w-32 h-32 rounded-full bg-red-500/20 animate-ping" />
            <div className="absolute w-40 h-40 rounded-full bg-red-500/10 animate-pulse" />
          </>
        )}

        {/* Main status circle */}
        <div
          className={`relative w-28 h-28 rounded-full ${styles.bg} shadow-lg ${styles.shadow} transition-all duration-500 ${state === 'recording' ? 'scale-110 animate-recording-pulse' : 'scale-100'
            } flex items-center justify-center`}
          role="status"
          aria-label={getStatusText()}
        >
          {/* Inner icon/indicator */}
          {state === 'recording' ? (
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-sm" />
            </div>
          ) : state === 'playing' ? (
            <div className="w-16 h-16 flex items-center justify-center">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center">
              <svg className="w-10 h-10 text-white dark:text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-stone-700 dark:text-stone-200 tracking-tight">
          {getStatusText()}
        </h2>
      </div>

      {/* Instructions Card */}
      <div className="card p-6 md:p-8 w-full">
        <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-5 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-stone-500"
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
          Voice Commands
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-stone-600 dark:text-stone-400 text-sm">
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full flex-shrink-0" />
            <span>{t.instructions.startRecording}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full flex-shrink-0" />
            <span>{t.instructions.stopRecording}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full flex-shrink-0" />
            <span>{t.instructions.playRecording}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full flex-shrink-0" />
            <span>{t.instructions.saveNote}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full flex-shrink-0" />
            <span>{t.instructions.openNotes}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full flex-shrink-0" />
            <span>{t.instructions.newNote}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full flex-shrink-0" />
            <span>{t.instructions.playNote}</span>
          </li>
          <li className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full flex-shrink-0" />
            <span>{t.instructions.switchLanguage}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingControls;
