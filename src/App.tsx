import React from 'react';
import './App.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import VoiceRecorder from './components/VoiceRecorder';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <div className="relative min-h-screen">
                    {/* Theme Toggle - Fixed Position */}
                    <ThemeToggle />

                    {/* Main Content */}
                    <VoiceRecorder />
                </div>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
