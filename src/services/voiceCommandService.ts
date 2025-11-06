import { VoiceCommand } from '../types';

// Voice commands in both English and Turkish
const commandMap: { [key: string]: VoiceCommand['action'] } = {
  // Start recording commands
  'start recording': 'START_RECORDING',
  'kayda başla': 'START_RECORDING',
  'kayda basla': 'START_RECORDING',
  'başla': 'START_RECORDING',
  'basla': 'START_RECORDING',
  
  // Stop recording commands
  'stop': 'STOP_RECORDING',
  'dur': 'STOP_RECORDING',
  'durdur': 'STOP_RECORDING',
  
  // Play current recording commands
  'play': 'PLAY_RECORDING',
  'oynat': 'PLAY_RECORDING',
  'çal': 'PLAY_RECORDING',
  'cal': 'PLAY_RECORDING',
  
  // Switch language commands
  'switch language': 'SWITCH_LANGUAGE',
  'dil değiştir': 'SWITCH_LANGUAGE',
  'dil degistir': 'SWITCH_LANGUAGE',
  'dili değiştir': 'SWITCH_LANGUAGE',
  'dili degistir': 'SWITCH_LANGUAGE',
  
  // Save note commands
  'save note': 'SAVE_NOTE',
  'notu kaydet': 'SAVE_NOTE',
  'kaydet': 'SAVE_NOTE',
  'save': 'SAVE_NOTE',
  
  // Open saved notes commands
  'open saved notes': 'OPEN_SAVED_NOTES',
  'open notes': 'OPEN_SAVED_NOTES',
  'show notes': 'OPEN_SAVED_NOTES',
  'kayıtlı notları aç': 'OPEN_SAVED_NOTES',
  'kayitli notlari ac': 'OPEN_SAVED_NOTES',
  'notları aç': 'OPEN_SAVED_NOTES',
  'notlari ac': 'OPEN_SAVED_NOTES',
  'notları göster': 'OPEN_SAVED_NOTES',
  'notlari goster': 'OPEN_SAVED_NOTES',
  
  // New note commands
  'new note': 'NEW_NOTE',
  'create new note': 'NEW_NOTE',
  'yeni not': 'NEW_NOTE',
  'yeni not oluştur': 'NEW_NOTE',
  'yeni not olustur': 'NEW_NOTE',
  
  // Play saved note commands
  'play note': 'PLAY_SAVED_NOTE',
  'notu oynat': 'PLAY_SAVED_NOTE',
  'notu çal': 'PLAY_SAVED_NOTE',
  'notu cal': 'PLAY_SAVED_NOTE',
  'şu notu oynat': 'PLAY_SAVED_NOTE',
  'su notu oynat': 'PLAY_SAVED_NOTE',
};

/**
 * Parse voice input and determine if it matches a command
 * @param transcript - The voice input transcript
 * @returns VoiceCommand object if matched, null otherwise
 */
export const parseVoiceCommand = (transcript: string): VoiceCommand | null => {
  if (!transcript) return null;

  const normalizedTranscript = transcript.toLowerCase().trim();

  // Check for exact matches first
  for (const [commandText, action] of Object.entries(commandMap)) {
    if (normalizedTranscript === commandText || normalizedTranscript.includes(commandText)) {
      return {
        command: commandText,
        action,
      };
    }
  }

  return null;
};

/**
 * Check if the transcript contains any voice command
 * @param transcript - The voice input transcript
 * @returns boolean indicating if a command was detected
 */
export const hasVoiceCommand = (transcript: string): boolean => {
  return parseVoiceCommand(transcript) !== null;
};

/**
 * Get all available commands for display
 * @returns Array of command text
 */
export const getAllCommands = (): string[] => {
  return Object.keys(commandMap);
};

