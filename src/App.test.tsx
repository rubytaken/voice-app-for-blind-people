import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple smoke test that doesn't require full app rendering
describe('Basic Tests', () => {
  test('React is working', () => {
    const TestComponent = () => <div data-testid="test">Hello</div>;
    render(<TestComponent />);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });
});

// Note: Full App tests would require extensive mocking of:
// - SpeechRecognition API
// - MediaRecorder API
// - speechSynthesis API
// - localStorage
// These are browser APIs not available in Jest's jsdom environment
