import React from 'react';
import './App.css';
import { LanguageProvider } from './contexts/LanguageContext';
import VoiceRecorder from './components/VoiceRecorder';

function App() {
  return (
    <LanguageProvider>
      <VoiceRecorder />
    </LanguageProvider>
  );
}

export default App;
