import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Mic, Navigation, MessageSquare, FileText, Star, User } from 'lucide-react';

interface VoiceCommand {
  category: string;
  icon: React.ReactNode;
  commands: {
    phrase: string;
    description: string;
  }[];
}

const voiceCommands: VoiceCommand[] = [
  {
    category: 'Navigation',
    icon: <Navigation className="h-4 w-4" />,
    commands: [
      { phrase: 'Go to schemes', description: 'Navigate to government schemes page' },
      { phrase: 'Go to financial advisor', description: 'Open financial chatbot' },
      { phrase: 'Go to quiz', description: 'Navigate to quiz page' },
      { phrase: 'Go to reviews', description: 'Open service reviews page' },
      { phrase: 'Go to profile', description: 'Navigate to your profile' },
      { phrase: 'Go home', description: 'Return to home page' },
    ]
  },
  {
    category: 'Schemes Page',
    icon: <FileText className="h-4 w-4" />,
    commands: [
      { phrase: 'I am [age] years old', description: 'Set your age' },
      { phrase: 'I am male/female', description: 'Set your gender' },
      { phrase: 'I am from [state]', description: 'Set your state' },
      { phrase: 'Submit form', description: 'Find matching schemes' },
      { phrase: 'Clear form', description: 'Reset the form' },
    ]
  },
  {
    category: 'Reviews Page',
    icon: <Star className="h-4 w-4" />,
    commands: [
      { phrase: 'Add review', description: 'Open review form' },
      { phrase: 'Sort by newest', description: 'Sort reviews by date' },
      { phrase: 'Sort by rating', description: 'Sort by highest rated' },
      { phrase: 'Show positive reviews', description: 'Filter positive reviews' },
      { phrase: 'Show negative reviews', description: 'Filter negative reviews' },
      { phrase: 'Cancel', description: 'Close current form' },
    ]
  },
  {
    category: 'General Actions',
    icon: <Mic className="h-4 w-4" />,
    commands: [
      { phrase: 'Help', description: 'Get voice commands help' },
      { phrase: 'Scroll up', description: 'Scroll to top of page' },
      { phrase: 'Scroll down', description: 'Scroll to bottom of page' },
      { phrase: 'Go back', description: 'Go to previous page' },
      { phrase: 'Refresh', description: 'Reload current page' },
      { phrase: 'Read page', description: 'Read page content aloud' },
    ]
  }
];

export const VoiceHelpDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          aria-label="Voice commands help"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Voice Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-financial" />
            Voice Navigation Commands
          </DialogTitle>
          <DialogDescription>
            Use these voice commands to navigate and interact with SachivJi without using your hands.
            Click the microphone button or say "Help" to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {voiceCommands.map((category) => (
            <div key={category.category} className="space-y-3">
              <div className="flex items-center gap-2">
                {category.icon}
                <h3 className="font-semibold text-lg">{category.category}</h3>
              </div>

              <div className="grid gap-2">
                {category.commands.map((command, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className="flex-1">
                      <Badge variant="outline" className="font-mono text-xs mb-1">
                        "{command.phrase}"
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {command.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Tips for Best Results
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Speak clearly and at a normal pace</li>
              <li>Make sure your microphone is working and permissions are granted</li>
              <li>Use Chrome or Edge browsers for best compatibility</li>
              <li>Commands work in both English and Hindi</li>
              <li>You can say "Help" anytime to hear available commands</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};