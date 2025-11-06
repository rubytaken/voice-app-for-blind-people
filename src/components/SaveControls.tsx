import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface SaveControlsProps {
  transcript: string;
  onSave: (title: string) => void;
  disabled?: boolean;
}

const SaveControls: React.FC<SaveControlsProps> = ({ transcript, onSave, disabled = false }) => {
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [showInput, setShowInput] = useState(false);

  function handleSave() {
    const noteTitle = title.trim() || `Note ${new Date().toLocaleString()}`;
    onSave(noteTitle);
    setTitle('');
    setShowInput(false);
  }

  function handleCancel() {
    setTitle('');
    setShowInput(false);
  }

  if (!transcript || disabled) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {language === 'en' ? 'Save Note' : 'Notu Kaydet'}
        </button>
      ) : (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-300 dark:border-gray-600">
          <input
            type="text"
            placeholder={language === 'en' ? 'Enter note title (optional)' : 'Not başlığı girin (opsiyonel)'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-4 py-2 mb-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-gray-100"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {language === 'en' ? 'Save' : 'Kaydet'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition-all duration-300 focus:outline-none"
            >
              {language === 'en' ? 'Cancel' : 'İptal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveControls;

