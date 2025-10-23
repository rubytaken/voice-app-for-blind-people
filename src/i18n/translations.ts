import { Translations } from '../types';

export const translations: Translations = {
  en: {
    appTitle: 'Voice Recorder',
    status: {
      idle: 'Ready - Say "start recording" to begin',
      recording: 'Recording in progress...',
      playing: 'Playing recording...',
      stopped: 'Recording stopped - Say "play" to listen',
    },
    instructions: {
      startRecording: 'Start Recording: Say "start recording" or "kayda başla"',
      stopRecording: 'Stop: Say "stop" or "dur"',
      playRecording: 'Play: Say "play" or "oynat"',
      switchLanguage: 'Switch Language: Say "switch language" or "dil değiştir" or press Alt+L',
    },
    messages: {
      microphoneAccess: 'Requesting microphone access...',
      recordingStarted: 'Recording started',
      recordingStopped: 'Recording stopped',
      playingRecording: 'Playing recording',
      noRecording: 'No recording available',
      languageSwitched: 'Language switched to English',
    },
    accessibility: {
      mainRegion: 'Voice recorder application',
      statusRegion: 'Recording status',
      transcriptRegion: 'Live transcription',
    },
  },
  tr: {
    appTitle: 'Ses Kaydedici',
    status: {
      idle: 'Hazır - Başlamak için "kayda başla" deyin',
      recording: 'Kayıt devam ediyor...',
      playing: 'Kayıt oynatılıyor...',
      stopped: 'Kayıt durduruldu - Dinlemek için "oynat" deyin',
    },
    instructions: {
      startRecording: 'Kayda Başla: "start recording" veya "kayda başla" deyin',
      stopRecording: 'Durdur: "stop" veya "dur" deyin',
      playRecording: 'Oynat: "play" veya "oynat" deyin',
      switchLanguage: 'Dil Değiştir: "switch language" veya "dil değiştir" deyin ya da Alt+L tuşuna basın',
    },
    messages: {
      microphoneAccess: 'Mikrofon erişimi isteniyor...',
      recordingStarted: 'Kayıt başladı',
      recordingStopped: 'Kayıt durduruldu',
      playingRecording: 'Kayıt oynatılıyor',
      noRecording: 'Kayıt bulunamadı',
      languageSwitched: 'Dil Türkçe olarak değiştirildi',
    },
    accessibility: {
      mainRegion: 'Ses kaydedici uygulaması',
      statusRegion: 'Kayıt durumu',
      transcriptRegion: 'Canlı transkripsiyon',
    },
  },
};

