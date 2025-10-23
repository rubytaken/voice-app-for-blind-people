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
        return 'bg-white';
      case 'playing':
        return 'bg-gray-300';
      case 'stopped':
        return 'bg-gray-500';
      default:
        return 'bg-white border-2 border-white';
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
        {/* Pulsing ring for recording state */}
        {state === 'recording' && (
          <div className="absolute w-32 h-32 rounded-full bg-white opacity-30 animate-ping" />
        )}
        
        {/* Main status circle */}
        <div
          className={`w-24 h-24 rounded-full ${getStatusColor()} shadow-2xl transition-all duration-300 ${
            state === 'recording' ? 'scale-110' : 'scale-100'
          }`}
          role="status"
          aria-label={getStatusText()}
        />
      </div>

      {/* Status Text */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-2 uppercase tracking-wider">
          {getStatusText()}
        </h2>
      </div>

      {/* Instructions */}
      <div className="bg-black border-2 border-white rounded-lg p-6 w-full">
        <h3 className="text-2xl font-bold text-white mb-4 uppercase">
          Voice Commands
        </h3>
        <ul className="space-y-3 text-white text-xl">
          <li className="flex items-start">
            <span className="mr-3 text-2xl">▪</span>
            <span>{t.instructions.startRecording}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-2xl">▪</span>
            <span>{t.instructions.stopRecording}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-2xl">▪</span>
            <span>{t.instructions.playRecording}</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 text-2xl">▪</span>
            <span>{t.instructions.switchLanguage}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingControls;

