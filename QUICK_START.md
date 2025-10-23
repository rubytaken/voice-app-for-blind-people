# Quick Start Guide

## Running the Application

### Development Mode

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

## First Time Setup

1. **Grant Microphone Permission**

   - When you first load the app, your browser will ask for microphone access
   - Click "Allow" to enable voice commands and recording

2. **Test Voice Recognition**
   - The app starts listening for voice commands immediately
   - You'll see a "Listening" indicator in the header

## Voice Commands Quick Reference

### English Commands

- **"start recording"** - Begin audio recording
- **"stop"** - Stop the current recording
- **"play"** - Play back your recording
- **"switch language"** - Change UI to Turkish

### Turkish Commands

- **"kayda başla"** - Kaydı başlat
- **"dur"** - Kaydı durdur
- **"oynat"** - Kaydı oynat
- **"dil değiştir"** - Dili İngilizce'ye değiştir

## Keyboard Shortcuts

- **Alt + L** - Switch between English and Turkish

## Testing the App

### Test Recording

1. Say **"start recording"**
2. Speak naturally - watch the live transcription appear
3. Say **"stop"** when finished
4. Say **"play"** to hear your recording

### Test Language Switching

1. Press **Alt + L** or say **"switch language"**
2. Notice the UI text changes
3. Commands still work in both languages

## Browser Requirements

✅ **Recommended Browsers:**

- Google Chrome (version 33+)
- Microsoft Edge (version 79+)
- Safari (version 14.1+)

⚠️ **Not Supported:**

- Firefox (no Web Speech API support)

## Troubleshooting

### "Microphone not working"

1. Check browser permissions (click lock icon in address bar)
2. Verify microphone is enabled in system settings
3. Try refreshing the page

### "Voice commands not recognized"

1. Speak clearly and at normal pace
2. Check that you're using the correct commands
3. Verify the "Listening" indicator is active
4. Check browser console for errors (F12)

### "No sound during playback"

1. Check system volume
2. Verify audio output device
3. Try recording again

## Development Notes

### File Structure

```
src/
├── components/     # UI components
├── hooks/         # Custom React hooks
├── services/      # Business logic
├── contexts/      # React contexts
├── types/         # TypeScript types
├── i18n/          # Translations
└── utils/         # Utilities
```

### Key Technologies

- React 18 with TypeScript
- TailwindCSS for styling
- Web Speech API for voice recognition
- MediaRecorder API for audio recording

### Future Integration

The project is structured for easy Supabase integration:

- Database schemas are documented in `src/utils/supabaseConfig.ts`
- Service layer is abstracted for easy API integration
- Type definitions include backend data models

## Support

For technical issues:

1. Check browser console (F12)
2. Verify API support in browser
3. Review error messages in the UI
4. Check microphone permissions

---

**Enjoy using the Voice Recorder!** 🎤
