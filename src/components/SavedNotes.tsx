import React, { useState, useEffect, useRef } from 'react';
import { SavedNote, getSavedNotes, deleteNote, getNoteById } from '../services/storageService';
import { useLanguage } from '../hooks/useLanguage';

interface SavedNotesProps {
  onNoteSelect: (note: SavedNote) => void;
  onClose: () => void;
}

const SavedNotes: React.FC<SavedNotesProps> = ({ onNoteSelect, onClose }) => {
  const { language } = useLanguage();
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    try {
      const savedNotes = await getSavedNotes();
      setNotes(savedNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, event: React.MouseEvent) {
    event.stopPropagation();
    if (window.confirm(language === 'en' ? 'Delete this note?' : 'Bu notu silmek istediğinize emin misiniz?')) {
      try {
        await deleteNote(id);
        await loadNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  }

  async function handleNoteClick(id: string) {
    const note = await getNoteById(id);
    if (note) {
      onNoteSelect(note);
      onClose();
    }
  }

  // Play/Stop audio for a note
  function handlePlay(note: SavedNote, event: React.MouseEvent) {
    event.stopPropagation();

    // If already playing this note, stop it
    if (playingNoteId === note.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setPlayingNoteId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Check if note has audio
    if (!note.audioUrl) {
      alert(language === 'en' ? 'No audio available for this note' : 'Bu not için ses kaydı yok');
      return;
    }

    // Create and play audio
    const audio = new Audio(note.audioUrl);
    audioRef.current = audio;
    setPlayingNoteId(note.id);

    audio.onended = () => {
      setPlayingNoteId(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      console.error('Error playing audio');
      setPlayingNoteId(null);
      audioRef.current = null;
      alert(language === 'en' ? 'Error playing audio' : 'Ses oynatılırken hata oluştu');
    };

    audio.play().catch((err) => {
      console.error('Error playing audio:', err);
      setPlayingNoteId(null);
      audioRef.current = null;
    });
  }

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.transcript.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(26, 22, 18, 0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,252,247,0.98) 0%, rgba(255,248,235,0.95) 100%)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 10px 30px -10px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(210, 180, 140, 0.3)',
        }}
      >
        {/* Dark mode background */}
        <div 
          className="dark:block hidden absolute inset-0 rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(45,37,32,0.99) 0%, rgba(38,30,25,0.98) 100%)',
            border: '1px solid rgba(100, 80, 60, 0.3)',
          }}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-cream-200 dark:border-espresso-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-semibold text-espresso-800 dark:text-cream-100">
              {language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-cream-100 dark:hover:bg-espresso-800 transition-all duration-200 group"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-espresso-500 dark:text-cream-400 group-hover:text-espresso-700 dark:group-hover:text-cream-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative p-4 border-b border-cream-100 dark:border-espresso-800">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso-400 dark:text-cream-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={language === 'en' ? 'Search notes...' : 'Notlarda ara...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-cream-50 dark:bg-espresso-900 border border-cream-200 dark:border-espresso-700 rounded-xl text-espresso-800 dark:text-cream-200 placeholder:text-espresso-400 dark:placeholder:text-cream-600 focus:ring-2 focus:ring-amber-400/50 dark:focus:ring-amber-500/50 focus:border-amber-400 dark:focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="relative flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="w-12 h-12 border-3 border-cream-200 dark:border-espresso-700 rounded-full" />
                <div className="absolute inset-0 w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200 dark:from-espresso-800 dark:to-espresso-700 flex items-center justify-center mb-6 shadow-inner-warm">
                <svg className="w-10 h-10 text-espresso-400 dark:text-cream-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-serif text-xl text-espresso-600 dark:text-cream-400 font-medium mb-2">
                {searchQuery
                  ? language === 'en' ? 'No notes found' : 'Not bulunamadı'
                  : language === 'en' ? 'No saved notes yet' : 'Henüz kaydedilmiş not yok'}
              </p>
              <p className="text-sm text-espresso-400 dark:text-cream-600">
                {language === 'en' ? 'Start recording to create your first note' : 'İlk notunuzu oluşturmak için kayıt yapın'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredNotes.map((note, index) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer animate-fade-in-up relative ${
                    playingNoteId === note.id 
                      ? 'border-green-400 dark:border-green-600 ring-2 ring-green-400/30 dark:ring-green-500/20' 
                      : 'border-cream-200 dark:border-espresso-700 hover:border-amber-300 dark:hover:border-amber-700'
                  }`}
                  style={{
                    background: playingNoteId === note.id 
                      ? 'rgba(220, 252, 231, 0.5)' 
                      : 'rgba(255,255,255,0.7)',
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className={`dark:block hidden absolute inset-0 rounded-2xl ${
                    playingNoteId === note.id ? 'bg-green-950/30' : ''
                  }`} style={{ background: playingNoteId === note.id ? 'rgba(20, 83, 45, 0.3)' : 'rgba(45,37,32,0.7)' }} />
                  
                  {/* Playing indicator */}
                  {playingNoteId === note.id && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full animate-pulse">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      {language === 'en' ? 'Playing...' : 'Oynatılıyor...'}
                    </div>
                  )}
                  
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg font-semibold text-espresso-800 dark:text-cream-100 truncate mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                        {note.title}
                      </h3>
                      <p className="text-sm text-espresso-500 dark:text-cream-500 line-clamp-2 mb-3 leading-relaxed">
                        {note.transcript || (language === 'en' ? 'No transcript' : 'Metin yok')}
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-xs text-espresso-400 dark:text-cream-600">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(note.createdAt)}
                          </span>
                          {note.duration > 0 && (
                            <span className={`flex items-center gap-1.5 ${note.audioUrl ? 'text-green-600 dark:text-green-400' : ''}`}>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                              </svg>
                              {formatDuration(note.duration)}
                              {note.audioUrl && (
                                <span className="text-green-500 dark:text-green-400">●</span>
                              )}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium">
                            {note.language === 'en' ? 'EN' : 'TR'}
                          </span>
                        </div>
                        {note.topics && note.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {note.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-cream-100 dark:bg-espresso-800 text-espresso-600 dark:text-cream-400 rounded-lg text-xs font-medium"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      {/* Play Button - Always visible for notes with audio */}
                      {note.audioUrl ? (
                        <button
                          onClick={(e) => handlePlay(note, e)}
                          className={`p-3 transition-all duration-200 rounded-xl flex items-center justify-center ${
                            playingNoteId === note.id
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-110'
                              : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                          }`}
                          aria-label={playingNoteId === note.id
                            ? (language === 'en' ? 'Stop playing' : 'Oynatmayı durdur')
                            : (language === 'en' ? 'Play audio' : 'Sesi oynat')
                          }
                          title={playingNoteId === note.id
                            ? (language === 'en' ? 'Stop' : 'Durdur')
                            : (language === 'en' ? 'Play' : 'Oynat')
                          }
                        >
                          {playingNoteId === note.id ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" rx="1" />
                              <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <div 
                          className="p-3 rounded-xl bg-cream-100 dark:bg-espresso-800 text-espresso-400 dark:text-cream-600"
                          title={language === 'en' ? 'No audio' : 'Ses yok'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        </div>
                      )}
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-3 text-espresso-400 hover:text-red-500 dark:text-cream-500 dark:hover:text-red-400 transition-all duration-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        aria-label={language === 'en' ? 'Delete note' : 'Notu sil'}
                        title={language === 'en' ? 'Delete note' : 'Notu sil'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative p-4 border-t border-cream-200 dark:border-espresso-700 bg-cream-50/50 dark:bg-espresso-900/50">
          <div className="flex items-center justify-between text-sm text-espresso-500 dark:text-cream-500">
            <span className="font-medium">
              {filteredNotes.length} {language === 'en' ? 'notes' : 'not'}
            </span>
            <span className="text-xs flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              {language === 'en' ? 'Click to open' : 'Açmak için tıklayın'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedNotes;
