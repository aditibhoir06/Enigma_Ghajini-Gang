import React, { createContext, useContext, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation';
import { VoiceHelpDialog } from './VoiceHelpDialog';
import { cn } from '@/lib/utils';

interface VoiceNavigationContextType {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string) => void;
}

const VoiceNavigationContext = createContext<VoiceNavigationContextType | null>(null);

interface VoiceNavigationProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export const VoiceNavigationProvider: React.FC<VoiceNavigationProviderProps> = ({
  children,
  enabled = true
}) => {
  const voiceNavigation = useVoiceNavigation({
    enabled,
    language: 'en-IN',
    continuous: false, // Don't listen continuously by default
  });

  return (
    <VoiceNavigationContext.Provider value={voiceNavigation}>
      {children}
      {enabled && voiceNavigation.isSupported && (
        <VoiceNavigationFloatingButton />
      )}
    </VoiceNavigationContext.Provider>
  );
};

const VoiceNavigationFloatingButton: React.FC = () => {
  const context = useContext(VoiceNavigationContext);
  const location = useLocation();

  if (!context) return null;

  const { isListening, toggleListening, speak } = context;

  // Adjust positioning for chat page to avoid overlap with send button
  const isChatPage = location.pathname === '/app/chatbot';

  const handleHelpClick = () => {
    speak('Available voice commands: Go to schemes, Go to financial advisor, Go to quiz, Go to reviews, Go to profile, Help');
  };

  return (
    <div className={cn(
      "fixed right-4 z-50 flex flex-col gap-2",
      isChatPage
        ? "bottom-32 md:bottom-32" // Higher up on chat page to avoid input bar
        : "bottom-20 md:bottom-4"  // Normal position on other pages
    )}>
      {/* Help button */}
      <Button
        size="icon"
        variant="outline"
        onClick={handleHelpClick}
        className="w-12 h-12 rounded-full shadow-lg backdrop-blur-md bg-card/80 border-border/50 hover:bg-card/90 transition-all duration-200"
        title="Voice commands help"
        aria-label="Get help with voice commands"
        role="button"
      >
        <Volume2 className="h-5 w-5" aria-hidden="true" />
      </Button>

      {/* Main voice button */}
      <Button
        size="icon"
        onClick={toggleListening}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg backdrop-blur-md transition-all duration-200",
          isListening
            ? "bg-financial text-financial-foreground animate-pulse ring-4 ring-financial/30"
            : "bg-card/80 text-foreground border border-border/50 hover:bg-card/90"
        )}
        title={isListening ? "Stop voice navigation" : "Start voice navigation"}
        aria-label={isListening ? "Stop voice navigation" : "Start voice navigation"}
        aria-pressed={isListening}
        role="button"
      >
        {isListening ? (
          <MicOff className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Mic className="h-6 w-6" aria-hidden="true" />
        )}
      </Button>

      {/* Status indicator */}
      {isListening && (
        <div
          className="absolute -top-12 right-0 bg-financial text-financial-foreground text-xs px-3 py-1 rounded-full shadow-lg animate-fade-in-up"
          role="status"
          aria-live="polite"
          aria-label="Voice navigation is currently listening"
        >
          Listening...
        </div>
      )}
    </div>
  );
};

export const useVoiceNavigationContext = () => {
  const context = useContext(VoiceNavigationContext);
  if (!context) {
    throw new Error('useVoiceNavigationContext must be used within VoiceNavigationProvider');
  }
  return context;
};