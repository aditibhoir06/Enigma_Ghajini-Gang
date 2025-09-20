import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

interface KeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions) => {
  const { shortcuts, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const altMatches = !!shortcut.altKey === event.altKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);

  // Common keyboard shortcuts that work everywhere
  const commonShortcuts: KeyboardShortcut[] = [
    {
      key: 'Home',
      action: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      description: 'Scroll to top (Home key)'
    },
    {
      key: 'End',
      action: () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      },
      description: 'Scroll to bottom (End key)'
    },
    {
      key: 'F5',
      action: () => {
        window.location.reload();
      },
      description: 'Refresh page (F5)'
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or forms
        const activeElement = document.activeElement as HTMLElement;
        activeElement?.blur();
      },
      description: 'Close modals/lose focus (Escape)'
    }
  ];

  return {
    commonShortcuts
  };
};