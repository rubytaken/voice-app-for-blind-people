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

  const getStatusColor = () => {
    switch (state) {
      case 'recording':
        return 'bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/50';
      case 'playing':
        return 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50';
      case 'stopped':
        return 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg shadow-gray-500/50';
      default:
        return 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50';
    }
  };

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
        {/* Pulsing rings for recording state */}
        {state === 'recording' && (
          <>
            <div className="absolute w-32 h-32 rounded-full bg-purple-500 dark:bg-purple-400 opacity-20 animate-ping" />
            <div className="absolute w-40 h-40 rounded-full bg-purple-500 dark:bg-purple-400 opacity-10 animate-pulse-slow" />
          </>
        )}
        
        {/* Main status circle with gradient */}
        <div
          className={`w-32 h-32 rounded-full ${getStatusColor()} shadow-2xl transition-all duration-500 ${
            state === 'recording' ? 'scale-110' : 'scale-100'
          } flex items-center justify-center`}
          role="status"
          aria-label={getStatusText()}
        >
          {state === 'recording' && (
            <div className="w-20 h-20 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
          {getStatusText()}
        </h2>
      </div>

      {/* Instructions Card */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-8 w-full shadow-lg border border-gray-300 dark:border-gray-600 transition-all duration-200">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 uppercase tracking-wide flex items-center gap-2">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
        <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-base">
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <span>{t.instructions.startRecording}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <span>{t.instructions.stopRecording}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <span>{t.instructions.playRecording}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 dark:bg-green-500 rounded-full" />
            <span>{t.instructions.saveNote}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 dark:bg-green-500 rounded-full" />
            <span>{t.instructions.openNotes}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 dark:bg-green-500 rounded-full" />
            <span>{t.instructions.newNote}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-green-600 dark:bg-green-500 rounded-full" />
            <span>{t.instructions.playNote}</span>
          </li>
          <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
            <span>{t.instructions.switchLanguage}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingControls;

