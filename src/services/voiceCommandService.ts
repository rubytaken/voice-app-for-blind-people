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
  
  // Play recording commands
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

