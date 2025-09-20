import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceFormOptions {
  onVoiceInput?: (transcript: string) => boolean;
  language?: string;
  enabled?: boolean;
}

export const useVoiceForm = (options: VoiceFormOptions = {}) => {
  const {
    onVoiceInput,
    language = 'en-IN',
    enabled = true
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

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
      if (onVoiceInput) {
        const handled = onVoiceInput(transcript);
        if (!handled) {
          toast.info('Voice input not recognized', {
            description: 'Try speaking more clearly or use different words'
          });
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission required');
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
  }, [enabled, language, onVoiceInput]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current || isListening) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognitionRef.current.start();
      toast.success('Voice input activated', {
        description: 'Speak now to fill the form'
      });
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