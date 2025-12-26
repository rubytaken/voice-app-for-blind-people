# Voice Recorder for Visually Impaired Users

An accessible voice-controlled audio recording web application designed for **blind and visually impaired users**. Built with React and modern web APIs, featuring full voice control, multi-language support (English & Turkish), and local storage for notes.

> **Graduation Project** for **SWE491** course at **Near East University**  
> Developed by **Emre Tosman**
> **Student No: 20210999**

## 🌐 Live Demo

**[https://voice-app-for-blind-people.vercel.app/](https://voice-app-for-blind-people.vercel.app/)**

---

## ✨ Features

### Voice-Controlled Interface
- **Fully hands-free operation** - Control the entire app with voice commands
- **Bilingual commands** - Supports both English and Turkish voice commands simultaneously
- **Voice feedback** - Audio announcements for all actions and state changes

### Audio Recording & Playback
- **High-quality recording** using MediaRecorder API with noise suppression
- **Instant playback** of recorded audio
- **Live transcription** - Real-time speech-to-text during recording

### Note Management
- **Save notes** with automatic intelligent naming from transcript content
- **View saved notes** in an accessible modal interface
- **Play back saved notes** with audio
- **Delete notes** with confirmation
- **Local storage** - All notes saved in browser localStorage (no account required)

### Accessibility
- **ARIA labels** throughout the application
- **Live regions** for screen reader announcements
- **Keyboard shortcuts** for common actions
- **High contrast** light and dark themes
- **Large touch targets** for easy interaction
- **Audio unlock prompt** for mobile browser compatibility

### Theme Support
- **Light and dark mode** with system preference detection
- **Persistent theme** saved in localStorage
- **Smooth transitions** between themes

---

## 🎤 Voice Commands

| Action | English | Turkish |
|--------|---------|---------|
| Start Recording | "start recording", "start" | "kayda başla", "başla" |
| Stop Recording | "stop" | "dur", "durdur" |
| Play Recording | "play" | "oynat", "çal" |
| Save Note | "save note", "save" | "notu kaydet", "kaydet" |
| Open Notes | "open notes", "show notes" | "notları aç", "notları göster" |
| New Note | "new note" | "yeni not" |
| Play Saved Note | "play note" | "notu oynat" |
| Switch Language | "switch language" | "dil değiştir" |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Stop recording |
| `P` | Play recording |
| `Alt + L` | Switch language |

---

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **TailwindCSS** for responsive styling
- **Web Speech API** for voice recognition
- **MediaRecorder API** for audio recording
- **Web Audio API** for audio context management
- **localStorage** for note persistence

---

## 📋 Prerequisites

- **Node.js** v14 or higher
- Modern web browser supporting:
  - Web Speech API (Chrome, Edge, Safari)
  - MediaRecorder API
  - getUserMedia API

> ⚠️ **Note:** Firefox does not support Web Speech API. Use Chrome, Edge, or Safari for full functionality.

---

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/rubytaken/voice-app-for-blind-people.git

# Navigate to project directory
cd voice-app-for-blind-people

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `build` folder.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── VoiceRecorder.tsx      # Main app component
│   ├── RecordingControls.tsx  # Status indicator
│   ├── TranscriptionDisplay.tsx # Live transcription
│   ├── SaveControls.tsx       # Save note controls
│   ├── SavedNotes.tsx         # Notes modal
│   └── ThemeToggle.tsx        # Theme switcher
├── hooks/
│   ├── useVoiceRecognition.ts # Speech recognition hook
│   ├── useAudioRecorder.ts    # Audio recording hook
│   └── useLanguage.ts         # Language management
├── services/
│   ├── voiceCommandService.ts # Command parsing
│   ├── audioService.ts        # Audio utilities
│   └── storageService.ts      # LocalStorage operations
├── contexts/
│   ├── LanguageContext.tsx    # Language state
│   └── ThemeContext.tsx       # Theme state
├── i18n/
│   └── translations.ts        # UI translations
└── types/
    └── index.ts               # TypeScript definitions
```

---

## 🌍 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 33+ | ✅ Full |
| Edge 79+ | ✅ Full |
| Safari 14.1+ | ✅ Full |
| Firefox | ⚠️ Limited (No Web Speech API) |

---

## 📱 Mobile Usage

When opening the app on a mobile device:
1. Tap the **"Enable Audio"** button that appears on first load
2. Grant microphone permission when prompted
3. Use voice commands as normal

---

## 🐛 Troubleshooting

**Microphone not working?**
- Check browser microphone permissions
- Ensure no other app is using the microphone
- Try refreshing the page

**Voice commands not recognized?**
- Speak clearly at a moderate pace
- Use supported commands listed above
- Verify you're using Chrome, Edge, or Safari

**Audio playback not working?**
- Tap the "Enable Audio" button on first load
- Check device volume
- Ensure HTTPS is being used

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👨‍💻 Author

**Emre Tosman**
Student No: 20210999  
Near East University  
SWE491 - Graduation Project

---

Built with ❤️ for accessibility
