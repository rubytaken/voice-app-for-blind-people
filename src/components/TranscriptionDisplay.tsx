import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface TranscriptionDisplayProps {
  transcript: string;
  isRecording: boolean;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcript,
  isRecording,
}) => {
  const { t } = useLanguage();

  if (!isRecording && !transcript) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div
        className="bg-black border-4 border-white rounded-lg p-8 min-h-[200px]"
        role="region"
        aria-label={t.accessibility.transcriptRegion}
        aria-live="polite"
        aria-atomic="true"
      >
        <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">
          {isRecording ? 'Live Transcription' : 'Last Transcription'}
        </h2>
        <div className="text-white text-3xl leading-relaxed break-words">
          {transcript || (
            <span className="text-gray-400 italic">
              {isRecording ? 'Listening...' : 'No transcription available'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionDisplay;

