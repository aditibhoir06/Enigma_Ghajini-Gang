import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceShortcut {
  patterns: string[];
  action: () => void;
  description: string;
}

interface VoiceShortcutsOptions {
  shortcuts: VoiceShortcut[];
  enabled?: boolean;
  language?: string;
  speak?: (text: string) => void;
}

export const useVoiceShortcuts = (options: VoiceShortcutsOptions) => {
  const {
    shortcuts,
    enabled = true,
    language = 'en-IN',
    speak
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Process voice command
  const processCommand = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();

    // Common shortcuts that work everywhere
    const commonShortcuts: VoiceShortcut[] = [
      {
        patterns: ['scroll up', 'scroll to top', 'go to top'],
        action: () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          speak?.('Scrolling to top');
        },
        description: 'Scroll to top of page'
      },
      {
        patterns: ['scroll down', 'scroll to bottom', 'go to bottom'],
        action: () => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          speak?.('Scrolling to bottom');
        },
        description: 'Scroll to bottom of page'
      },
      {
        patterns: ['go back', 'back', 'previous page'],
        action: () => {
          window.history.back();
          speak?.('Going back');
        },
        description: 'Go back to previous page'
      },
      {
        patterns: ['refresh', 'reload', 'refresh page'],
        action: () => {
          window.location.reload();
          speak?.('Refreshing page');
        },
        description: 'Refresh the page'
      },
      {
        patterns: ['read page', 'read content', 'read this page'],
        action: () => {
          const content = document.body.innerText;
          const firstParagraph = content.split('\n').slice(0, 3).join(' ').substring(0, 200);
          speak?.(firstParagraph);
        },
        description: 'Read page content aloud'
      }
    ];

    const allShortcuts = [...commonShortcuts, ...shortcuts];

    for (const shortcut of allShortcuts) {
      for (const pattern of shortcut.patterns) {
        if (normalizedTranscript.includes(pattern.toLowerCase())) {
          shortcut.action();
          return true;
        }
      }
    }

    return false;
  }, [shortcuts, speak]);

  // Initialize speech recognition
  useEffect(() => {
    if (!enabled) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const handled = processCommand(transcript);
      if (!handled) {
        speak?.('Voice command not recognized');
        toast.info('Command not recognized', {
          description: 'Try saying "help" for available commands'
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(`Voice recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [enabled, language, processCommand]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported');
      return;
    }

    if (!recognitionRef.current || isListening) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
    } catch (error) {
      toast.error('Microphone access required');
    }
  }, [isSupported, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
};