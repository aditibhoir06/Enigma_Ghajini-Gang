import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface VoiceCommand {
  patterns: string[];
  action: () => void;
  description: string;
}

interface VoiceNavigationOptions {
  enabled?: boolean;
  language?: string;
  continuous?: boolean;
  customCommands?: VoiceCommand[];
}

export const useVoiceNavigation = (options: VoiceNavigationOptions = {}) => {
  const {
    enabled = true,
    language = 'en-IN',
    continuous = true,
    customCommands = []
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  // Text-to-speech functionality
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, [language]);

  // Default navigation commands
  const defaultCommands: VoiceCommand[] = [
    {
      patterns: ['go to schemes', 'open schemes', 'show schemes', 'government schemes'],
      action: () => {
        navigate('/schemes');
        speak('Navigating to government schemes page');
      },
      description: 'Navigate to schemes page'
    },
    {
      patterns: ['go to financial advisor', 'open chatbot', 'financial help', 'chat'],
      action: () => {
        navigate('/chatbot');
        speak('Opening financial advisor');
      },
      description: 'Navigate to financial advisor'
    },
    {
      patterns: ['go to quiz', 'open quiz', 'take quiz', 'start quiz'],
      action: () => {
        navigate('/quiz');
        speak('Opening quiz page');
      },
      description: 'Navigate to quiz page'
    },
    {
      patterns: ['go to reviews', 'open reviews', 'show reviews', 'service reviews'],
      action: () => {
        navigate('/reviews');
        speak('Opening reviews page');
      },
      description: 'Navigate to reviews page'
    },
    {
      patterns: ['go to profile', 'open profile', 'my profile', 'user profile'],
      action: () => {
        navigate('/profile');
        speak('Opening your profile');
      },
      description: 'Navigate to profile page'
    },
    {
      patterns: ['go home', 'home page', 'main page'],
      action: () => {
        navigate('/');
        speak('Going to home page');
      },
      description: 'Navigate to home page'
    },
    {
      patterns: ['help', 'voice help', 'what can i say', 'voice commands'],
      action: () => {
        const commands = [...defaultCommands, ...customCommands];
        const helpText = commands.map(cmd => cmd.description).join(', ');
        speak(`Available voice commands: ${helpText}`);
        toast.info('Voice commands spoken aloud', {
          description: 'Listen for the available commands'
        });
      },
      description: 'Get help with voice commands'
    }
  ];

  const allCommands = [...defaultCommands, ...customCommands];

  // Process voice command
  const processCommand = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();

    for (const command of allCommands) {
      for (const pattern of command.patterns) {
        if (normalizedTranscript.includes(pattern.toLowerCase())) {
          command.action();
          return true;
        }
      }
    }

    // If no command matches, provide feedback
    speak('Voice command not recognized. Say "help" for available commands.');
    toast.warning('Command not recognized', {
      description: 'Say "help" to hear available voice commands'
    });
    return false;
  }, [allCommands, speak]);

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

    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission required for voice navigation');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
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
  }, [enabled, language, continuous, processCommand]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current || isListening) return;

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      toast.success('Voice navigation activated', {
        description: 'Say commands like "go to schemes" or "help"'
      });
    } catch (error) {
      toast.error('Microphone access required for voice navigation');
    }
  }, [isSupported, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      toast.info('Voice navigation deactivated');
    }
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    speak,
    addCommand: (command: VoiceCommand) => {
      customCommands.push(command);
    }
  };
};