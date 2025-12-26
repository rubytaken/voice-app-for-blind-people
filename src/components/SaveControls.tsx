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
    <div className="w-full max-w-4xl mx-auto mt-6 animate-fade-in">
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
            boxShadow: '0 8px 24px -6px rgba(217, 119, 6, 0.4), 0 4px 12px -4px rgba(217, 119, 6, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
            color: 'white',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          {/* Hover shine effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transform: 'translateX(-100%)',
              animation: 'none',
            }}
          />
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <svg className="relative w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          <span className="relative">
            {language === 'en' ? 'Save Note' : 'Notu Kaydet'}
          </span>
        </button>
      ) : (
        <div 
          className="rounded-2xl p-6 animate-scale-in"
          style={{
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 10px 40px -10px rgba(139, 69, 19, 0.15), 0 4px 16px -4px rgba(139, 69, 19, 0.1)',
            border: '1px solid rgba(210, 180, 140, 0.3)',
          }}
        >
          <div 
            className="dark:block hidden absolute inset-0 rounded-2xl"
            style={{
              background: 'rgba(45,37,32,0.98)',
              border: '1px solid rgba(100, 80, 60, 0.3)',
            }}
          />
          <div className="relative">
            <label className="block text-sm font-medium text-espresso-700 dark:text-cream-300 mb-2">
              {language === 'en' ? 'Note Title' : 'Not Başlığı'}
            </label>
            <input
              type="text"
              placeholder={language === 'en' ? 'Enter title (optional)' : 'Başlık girin (opsiyonel)'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="input mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 btn-primary py-3 text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {language === 'en' ? 'Save' : 'Kaydet'}
                </span>
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 btn-secondary py-3 text-base"
              >
                {language === 'en' ? 'Cancel' : 'İptal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveControls;
