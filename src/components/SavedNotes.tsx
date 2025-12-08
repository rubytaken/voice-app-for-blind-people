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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-stone-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-stone-200 dark:border-stone-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
            {language === 'en' ? 'Saved Notes' : 'Kaydedilen Notlar'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-stone-500 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-stone-100 dark:border-stone-800">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
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
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:ring-2 focus:ring-stone-300 dark:focus:ring-stone-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-stone-300 dark:border-stone-600 border-t-stone-600 dark:border-t-stone-300 rounded-full animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg text-stone-500 dark:text-stone-400 font-medium">
                {searchQuery
                  ? language === 'en' ? 'No notes found' : 'Not bulunamadı'
                  : language === 'en' ? 'No saved notes yet' : 'Henüz kaydedilmiş not yok'}
              </p>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                {language === 'en' ? 'Start recording to create your first note' : 'İlk notunuzu oluşturmak için kayıt yapın'}
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className="group p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-600 transition-all cursor-pointer hover:shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200 truncate mb-1">
                        {note.title}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-2">
                        {note.transcript || (language === 'en' ? 'No transcript' : 'Metin yok')}
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(note.createdAt)}
                          </span>
                          {note.duration > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                              </svg>
                              {formatDuration(note.duration)}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-700 rounded text-xs font-medium">
                            {note.language === 'en' ? 'EN' : 'TR'}
                          </span>
                        </div>
                        {note.topics && note.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {note.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      {/* Play Button */}
                      {note.audioUrl && (
                        <button
                          onClick={(e) => handlePlay(note, e)}
                          className={`p-2 transition-all rounded-lg ${playingNoteId === note.id
                              ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                              : 'text-stone-400 hover:text-emerald-500 dark:hover:text-emerald-400 opacity-0 group-hover:opacity-100 hover:bg-stone-100 dark:hover:bg-stone-700'
                            }`}
                          aria-label={playingNoteId === note.id
                            ? (language === 'en' ? 'Stop' : 'Durdur')
                            : (language === 'en' ? 'Play' : 'Oynat')
                          }
                          title={playingNoteId === note.id
                            ? (language === 'en' ? 'Stop' : 'Durdur')
                            : (language === 'en' ? 'Play' : 'Oynat')
                          }
                        >
                          {playingNoteId === note.id ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16" rx="1" strokeWidth={2} />
                              <rect x="14" y="4" width="4" height="16" rx="1" strokeWidth={2} />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(note.id, e)}
                        className="p-2 text-stone-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700"
                        aria-label={language === 'en' ? 'Delete note' : 'Notu sil'}
                        title={language === 'en' ? 'Delete note' : 'Notu sil'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
            <span>
              {filteredNotes.length} {language === 'en' ? 'notes' : 'not'}
            </span>
            <span className="text-xs">
              {language === 'en' ? 'Click to open' : 'Açmak için tıklayın'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedNotes;
