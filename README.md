# Voice Recorder - Accessible Audio Recording App

A React web application designed specifically for **blind users**, featuring voice-controlled audio recording with multi-language support (English and Turkish).

## Features

### Core Functionality

- **Voice-Controlled Recording**: Start and stop audio recording using voice commands
- **Audio Playback**: Play back recorded audio with voice commands
- **Multi-Language Support**: Full support for English and Turkish
- **Live Transcription**: Real-time speech-to-text display during recording
- **High Contrast UI**: Black and white minimal design for maximum accessibility

### Voice Commands

The app recognizes commands in both **English** and **Turkish** simultaneously:

| Action          | English Command   | Turkish Command |
| --------------- | ----------------- | --------------- |
| Start Recording | "start recording" | "kayda başla"   |
| Stop Recording  | "stop"            | "dur"           |
| Play Recording  | "play"            | "oynat"         |
| Switch Language | "switch language" | "dil değiştir"  |

### Keyboard Shortcuts

- **Alt + L**: Switch between English and Turkish interface

## Technology Stack

- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Web Speech API** for voice recognition
- **MediaRecorder API** for audio recording
- **React Context** for state management

## Prerequisites

- Node.js (v14 or higher)
- Modern web browser with support for:
  - Web Speech API (Chrome, Edge, Safari)
  - MediaRecorder API
  - getUserMedia API

## Installation

1. Clone or download the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Grant Permissions**: When first loading the app, grant microphone access when prompted
2. **Voice Commands**: Simply speak one of the supported voice commands:
   - Say **"start recording"** or **"kayda başla"** to begin recording
   - Say **"stop"** or **"dur"** to stop recording
   - Say **"play"** or **"oynat"** to play back your recording
3. **Language Switching**: Press **Alt + L** or say **"switch language"** / **"dil değiştir"**
4. **View Transcription**: Watch the live transcription appear on screen while recording

## Project Structure

```
src/
├── components/          # React components
│   ├── VoiceRecorder.tsx         # Main component
│   ├── RecordingControls.tsx    # Status indicators
│   └── TranscriptionDisplay.tsx # Live transcription
├── hooks/              # Custom React hooks
│   ├── useVoiceRecognition.ts   # Web Speech API hook
│   ├── useAudioRecorder.ts      # MediaRecorder hook
│   └── useLanguage.ts           # Language management
├── services/           # Business logic
│   ├── voiceCommandService.ts   # Command parsing
│   └── audioService.ts          # Audio operations
├── contexts/           # React contexts
│   └── LanguageContext.tsx      # Language state
├── types/              # TypeScript definitions
│   └── index.ts
├── i18n/               # Internationalization
│   └── translations.ts
└── utils/              # Utilities
    └── supabaseConfig.ts        # Future backend integration
```

## Future Enhancements

### Supabase Integration (Prepared)

The project is structured to easily integrate with Supabase for:

- **User Authentication**: Sign up and login functionality
- **Cloud Storage**: Save recordings to cloud storage
- **Database**: Store recording metadata and user preferences
- **Sync Across Devices**: Access recordings from any device

To enable Supabase integration:

1. Install Supabase client:

```bash
npm install @supabase/supabase-js
```

2. Create a `.env` file with your credentials:

```env
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

3. Uncomment the code in `src/utils/supabaseConfig.ts`
4. Set up the database schema (included in the file comments)

### Potential Features

- Save recordings history
- Export recordings to different formats
- Share recordings via link
- User profiles and preferences
- Recording categorization with tags
- Additional language support
- Offline mode with sync

## Accessibility Features

- **ARIA Labels**: Comprehensive ARIA labels for screen readers
- **Live Regions**: Status updates announced to assistive technologies
- **Keyboard Navigation**: Full keyboard support
- **High Contrast**: Black and white color scheme
- **Large Touch Targets**: Easy-to-interact UI elements
- **Audio Feedback**: Voice announcements for state changes
- **Reduced Motion Support**: Respects user motion preferences

## Browser Support

| Browser | Version | Support                        |
| ------- | ------- | ------------------------------ |
| Chrome  | 33+     | ✅ Full                        |
| Edge    | 79+     | ✅ Full                        |
| Safari  | 14.1+   | ✅ Full                        |
| Firefox | Limited | ⚠️ Partial (no Web Speech API) |

**Note**: Firefox does not support the Web Speech API. For best experience, use Chrome, Edge, or Safari.

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Troubleshooting

### Microphone Not Working

- Ensure microphone permissions are granted in browser settings
- Check if microphone is working in other applications
- Try reloading the page

### Voice Commands Not Recognized

- Speak clearly and at moderate pace
- Ensure you're using supported commands
- Check browser console for errors
- Verify Web Speech API is supported in your browser

### Language Issues

- Try switching language with Alt + L
- Clear localStorage and refresh page
- Check browser language settings

## Contributing

This project is structured for easy extension. Key areas for contribution:

- Additional language support
- More voice commands
- UI/UX improvements
- Performance optimizations
- Testing and bug fixes

## License

This project is open source and available for use and modification.

## Support

For issues or questions, please check:

1. Browser compatibility
2. Microphone permissions
3. Console error messages
4. Network connectivity (for future cloud features)

---

**Built with accessibility in mind** 💙
