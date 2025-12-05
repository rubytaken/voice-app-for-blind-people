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
    <div className="w-full max-w-4xl mx-auto mt-4 animate-fade-in">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 font-medium rounded-xl shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {language === 'en' ? 'Save Note' : 'Notu Kaydet'}
        </button>
      ) : (
        <div className="card p-4 animate-scale-in">
          <input
            type="text"
            placeholder={language === 'en' ? 'Enter note title (optional)' : 'Not başlığı girin (opsiyonel)'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="input mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              {language === 'en' ? 'Save' : 'Kaydet'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 btn-secondary"
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
