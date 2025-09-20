import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface ChatShortcutsProps {
  conversationId?: number;
  context?: string;
  onShortcutClick: (message: string) => void;
  isLoading?: boolean;
}

export default function ChatShortcuts({
  conversationId,
  context,
  onShortcutClick,
  isLoading = false
}: ChatShortcutsProps) {
  const [shortcuts, setShortcuts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShortcuts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getShortcuts(conversationId, context);

      if (response.success && response.data) {
        setShortcuts(response.data.shortcuts || []);
      } else {
        throw new Error('Failed to fetch shortcuts');
      }
    } catch (error) {
      console.error('Error fetching shortcuts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load shortcuts');

      // Set fallback shortcuts
      setShortcuts([
        "Help with budgeting",
        "Investment advice",
        "Tax planning tips",
        "Savings guidance",
        "Loan options",
        "Emergency fund"
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shortcuts on mount and when conversationId/context changes
  useEffect(() => {
    fetchShortcuts();
  }, [conversationId, context]);

  const handleShortcutClick = (shortcut: string) => {
    if (isLoading) return; // Prevent clicks while message is being sent
    onShortcutClick(shortcut);
  };

  const handleRefresh = () => {
    fetchShortcuts();
  };

  if (loading && shortcuts.length === 0) {
    return (
      <Card className="p-6 bg-muted/30 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-financial" />
          <span className="text-sm font-medium">Loading suggestions...</span>
        </div>
      </Card>
    );
  }

  if (error && shortcuts.length === 0) {
    return (
      <Card className="p-6 bg-muted/30 rounded-2xl shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground font-medium">
            {error}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 p-0 rounded-lg hover:bg-financial/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  if (shortcuts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-financial/5 border-primary/30 rounded-2xl shadow-lg backdrop-blur-sm ring-1 ring-financial/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-5 w-5 text-financial" />
          <h3 className="text-sm font-semibold text-foreground">
            Quick Suggestions
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || isLoading}
          className="h-8 w-8 p-0 rounded-lg hover:bg-financial/10 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shortcuts.map((shortcut, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleShortcutClick(shortcut)}
            disabled={isLoading}
            className={`
              justify-start text-left h-auto py-3 px-4 rounded-xl
              border-financial/30 hover:border-financial/50
              hover:bg-financial/10 hover:shadow-md transition-all duration-200
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="text-xs leading-relaxed font-medium">
              {shortcut}
            </span>
          </Button>
        ))}
      </div>

      {error && (
        <div className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
          Using fallback suggestions
        </div>
      )}
    </Card>
  );
}