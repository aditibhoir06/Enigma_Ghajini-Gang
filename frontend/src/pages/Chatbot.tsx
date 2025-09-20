import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import ChatShortcuts from "@/components/ChatShortcuts";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isError?: boolean;
}

const welcomeMessages: Message[] = [
  {
    id: 1,
    text: "Namaste! 🙏 I'm your AI financial advisor from SachivJi. I'm here to help you with money matters, government schemes, savings, and financial planning in India.",
    isBot: true,
    timestamp: new Date()
  },
  {
    id: 2,
    text: "You can ask me about budgeting, investments, loans, tax planning, or government schemes. Try using the quick suggestions below, or just type your question!",
    isBot: true,
    timestamp: new Date()
  }
];

const MD_BREAKPOINT = 768;
const MOBILE_NAVBAR_HEIGHT = 64;

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(welcomeMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  const [bottomSpace, setBottomSpace] = useState<number>(120);

  // 🎤 Voice-to-Text (button-controlled)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isStartingRef = useRef(false);
  const desiredListeningRef = useRef(false); // user toggle state

  // For clean composition (prevents repetition)
  const snapshotRef = useRef<string>("");   // input value when mic started
  const finalSoFarRef = useRef<string>(""); // only final transcripts
  const latestInputRef = useRef<string>(""); // mirror of inputText (so onstart can read it)

  // keep latest input in a ref
  useEffect(() => {
    latestInputRef.current = inputText;
  }, [inputText]);

  // ----- Init SpeechRecognition ONCE (no dependency on inputText) -----
  useEffect(() => {
    const SR: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SR) {
      recognitionRef.current = null;
      return;
    }

    const r = new SR();
    r.lang = "en-IN";            // switch to "hi-IN" if needed
    r.continuous = true;         // allow longer sessions; we still commit in onend
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
      // take a snapshot of current input using the ref (not state)
      snapshotRef.current = (latestInputRef.current || "").trim();
      finalSoFarRef.current = "";
      setIsListening(true);
      isStartingRef.current = false;
    };

    r.onresult = (event: any) => {
      let finalThis = "";
      let interimThis = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalThis += t;
        else interimThis += t;
      }

      if (finalThis) {
        finalSoFarRef.current = [finalSoFarRef.current, finalThis]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      }

      const composed = [snapshotRef.current, finalSoFarRef.current, interimThis]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      // Overwrite input with composed text (no incremental append)
      setInputText(composed);
    };

    r.onerror = (e: any) => {
      setIsListening(false);
      isStartingRef.current = false;
      // No auto-retry here; onend will decide based on desiredListeningRef
      if (e?.error === "not-allowed") {
        toast.error("Microphone blocked. Please allow mic permissions.");
      } else if (e?.error !== "no-speech" && e?.error !== "aborted") {
        toast.error("Voice input error: " + e.error);
      }
    };

    r.onend = () => {
      // Commit only snapshot + finalSoFar (discard interim)
      const committed = [snapshotRef.current, finalSoFarRef.current]
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      setInputText(committed);
      setIsListening(false);
      isStartingRef.current = false;

      // 🔁 Controlled restart only if user still wants mic ON
      if (desiredListeningRef.current) {
        setTimeout(() => {
          // get the current instance (avoid stale closure)
          const current = recognitionRef.current;
          if (current && !isStartingRef.current && desiredListeningRef.current) {
            try {
              isStartingRef.current = true;
              current.start();
            } catch {}
          }
        }, 150);
      }
    };

    recognitionRef.current = r;

    return () => {
      try { r.stop(); } catch {}
      recognitionRef.current = null;
      desiredListeningRef.current = false;
      isStartingRef.current = false;
      setIsListening(false);
    };
  }, []); // 👈 initialize once

  // ----- Toggle mic ON/OFF (button only) -----
  const toggleListening = async () => {
    const r = recognitionRef.current;
    if (!r) {
      toast.info("Voice input not supported. Try Chrome/Edge over HTTPS or localhost.");
      return;
    }

    // Turn OFF
    if (desiredListeningRef.current || isListening || isStartingRef.current) {
      desiredListeningRef.current = false;
      try { r.stop(); } catch {}
      return;
    }

    // Turn ON
    try {
      isStartingRef.current = true;
      desiredListeningRef.current = true;
      // Pre-warm mic (permission + more stable start)
      await navigator.mediaDevices.getUserMedia({ audio: true });
      // Optional: choose language dynamically based on your UI
      // r.lang = document.documentElement.lang || "en-IN";
      r.start();
    } catch (err) {
      desiredListeningRef.current = false;
      isStartingRef.current = false;
      toast.error("Microphone not available. Please allow mic permissions.");
      console.error(err);
    }
  };

  // ----- Scrolling -----
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ----- Reserve space for fixed input bar (and mobile bottom navbar) -----
  useEffect(() => {
    const computeSpace = () => {
      const inputH = inputBarRef.current?.offsetHeight ?? 0;
      const isMobile = window.innerWidth < MD_BREAKPOINT;
      const breathing = 16;
      const mobileNav = isMobile ? MOBILE_NAVBAR_HEIGHT : 0;
      setBottomSpace(inputH + mobileNav + breathing);
    };
    computeSpace();
    const onResize = () => computeSpace();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    const ro = new ResizeObserver(() => computeSpace());
    if (inputBarRef.current) ro.observe(inputBarRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      ro.disconnect();
    };
  }, []);

  // ----- Chat flow -----
  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputText.trim();
    if (!text || isLoading) return;
    if (!messageText) setInputText("");

    const userMessage: Message = {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiClient.sendMessage(text, conversationId);

      if (response.success && response.data) {
        if (!conversationId) setConversationId(response.data.conversationId);

        const aiMessage: Message = {
          id: Date.now() + 1,
          text: response.data.aiResponse.text,
          isBot: true,
          timestamp: new Date(response.data.aiResponse.timestamp),
          isError: response.data.aiResponse.isError
        };

        setMessages(prev => [...prev, aiMessage]);

        if (response.data.aiResponse.isError) {
          toast.warning("AI service is experiencing issues, but I'm still here to help!");
        }
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isBot: true,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleShortcutClick = (message: string) => {
    handleSendMessage(message);
  };

  const getContextForShortcuts = () => {
    const recentMessages = messages.slice(-4);
    return recentMessages
      .map(msg => `${msg.isBot ? "AI" : "User"}: ${msg.text}`)
      .join("\n");
  };

  return (
    <div className="min-h-screen md:min-h-[calc(100vh-4rem)] flex flex-col bg-gradient-to-br from-background via-background to-financial/5 md:bg-transparent">
      {/* Header */}
      <div className="bg-gradient-financial text-financial-foreground p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-financial-foreground/20 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm">
            <Bot className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Financial Advisor</h1>
            <p className="text-sm opacity-90 font-medium">Your trusted money companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6"
        style={{ paddingBottom: bottomSpace }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start space-x-3",
              message.isBot ? "justify-start animate-slide-in-left" : "justify-end animate-slide-in-right"
            )}
          >
            {message.isBot && (
              <div className="w-10 h-10 bg-gradient-financial rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-financial/20">
                <Bot className="h-5 w-5 text-financial-foreground" />
              </div>
            )}

            <Card
              className={cn(
                "max-w-[85%] p-4 shadow-lg transition-all duration-300 hover:shadow-xl",
                message.isBot
                  ? message.isError
                    ? "bg-destructive/10 border-destructive/30 rounded-2xl rounded-tl-md"
                    : "bg-card border-financial/30 rounded-2xl rounded-tl-md backdrop-blur-sm ring-1 ring-financial/10"
                  : "bg-gradient-primary text-primary-foreground border-none rounded-2xl rounded-tr-md shadow-primary/20"
              )}
            >
              <p
                className={cn(
                  "text-sm whitespace-pre-wrap leading-relaxed font-medium",
                  message.isError && message.isBot ? "text-destructive" : ""
                )}
              >
                {message.text}
              </p>
              <p
                className={cn(
                  "text-xs mt-3 opacity-70 font-medium",
                  message.isBot ? "text-muted-foreground" : "text-primary-foreground/70"
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
                {message.isError && (
                  <span className="ml-2 text-destructive">⚠️</span>
                )}
              </p>
            </Card>

            {!message.isBot && (
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-primary/20">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start space-x-3 justify-start">
            <div className="w-10 h-10 bg-gradient-financial rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-financial/20 animate-pulse">
              <Bot className="h-5 w-5 text-financial-foreground" />
            </div>
            <Card className="max-w-[85%] p-4 shadow-lg bg-card border-financial/30 rounded-2xl rounded-tl-md backdrop-blur-sm ring-1 ring-financial/10">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-financial" />
                <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-financial/40 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-financial/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-financial/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Shortcuts */}
      <div
        className="px-6"
        style={{ paddingBottom: Math.max(bottomSpace - 8, 0) }}
      >
        <ChatShortcuts
          conversationId={conversationId}
          context={getContextForShortcuts()}
          onShortcutClick={handleShortcutClick}
          isLoading={isLoading}
        />
      </div>

      {/* Fixed Input Bar */}
      <div
        ref={inputBarRef}
        className="fixed left-0 right-0 bg-card/80 backdrop-blur-md border-t border-border/50 p-6 shadow-lg"
        style={{
          bottom:
            typeof window !== "undefined" && window.innerWidth < MD_BREAKPOINT
              ? MOBILE_NAVBAR_HEIGHT
              : 0,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)"
        }}
      >
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
          <Input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about budgeting, investments, loans, tax planning..."
            className="flex-1 h-12 px-4 rounded-xl border-2 border-border/50 focus:border-financial/50 focus:ring-2 focus:ring-financial/20 transition-all duration-200 bg-background/50 backdrop-blur-sm shadow-md"
            disabled={isLoading}
            maxLength={2000}
          />

          {/* 🎤 Mic button — controlled start/stop & restart loop while ON */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "shrink-0 h-12 w-12 rounded-xl border-2 transition-all duration-200 shadow-md hover:shadow-lg",
              isListening
                ? "bg-financial/10 border-financial/50 text-financial hover:bg-financial/20"
                : "border-border/50 hover:border-financial/30 hover:bg-financial/5"
            )}
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Start voice input"}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-xl bg-gradient-financial hover:scale-105 hover:shadow-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:scale-100"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
