"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  Loader2, 
  Sparkles,
  BookOpen,
  History,
  Trash2,
  MessageCircle,
  Plus,
  User,
  PanelLeft,
  X,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useUser, useCollection, useAuth, useDoc } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc, limit } from "firebase/firestore";
import { tutorChat } from "@/ai/flows/ai-tutor-chat";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AiTutorPage() {
  const { user } = useUser();
  const { firestore } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | "none">("none");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch User Sessions for context
  const sessionsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'), limit(10));
  }, [user, firestore]);
  const { data: sessions, error: sessionsError } = useCollection<any>(sessionsRef);

  // Fetch User Chat Histories
  const chatsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'tutorChats'), orderBy('lastMessageAt', 'desc'));
  }, [user, firestore]);
  const { data: chats, loading: chatsLoading, error: chatsError } = useCollection<any>(chatsRef);

  // Fetch Active Chat Details
  const activeChatPath = useMemo(() => {
    if (!user || !activeChatId) return null;
    return `users/${user.uid}/tutorChats/${activeChatId}`;
  }, [user, activeChatId]);
  const { data: activeChat, error: activeChatError } = useDoc<any>(activeChatPath);

  useEffect(() => {
    if (sessionsError || chatsError || activeChatError) {
      setError("We encountered a permission issue accessing your data. Please check your Firestore rules.");
    }
  }, [sessionsError, chatsError, activeChatError]);

  // Get Content of Selected Session
  const selectedSession = sessions?.find(s => s.id === selectedSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [activeChat?.messages, sending]);

  const handleStartNewChat = async () => {
    if (!user || !firestore) return;
    const title = selectedSession ? `Tutoring: ${selectedSession.title}` : "New Learning Chat";
    const newChat = {
      title,
      sessionId: selectedSessionId === "none" ? null : selectedSessionId,
      lastMessageAt: Date.now(),
      messages: [
        { role: 'model', text: "Hello! I'm your SmartRead AI Tutor. I'm ready to help you master your reading. What can I explain for you today?", timestamp: Date.now() }
      ]
    };

    try {
      const docRef = await addDoc(collection(firestore, 'users', user.uid, 'tutorChats'), newChat);
      setActiveChatId(docRef.id);
      setIsSidebarOpen(false);
      setError(null);
    } catch (err: any) {
      const permissionError = new FirestorePermissionError({
        path: `users/${user.uid}/tutorChats`,
        operation: 'create',
        requestResourceData: newChat,
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending || !user || !firestore || !activeChatId || !activeChat) return;

    const userMessage = { role: 'user' as const, text: input, timestamp: Date.now() };
    const updatedMessages = [...(activeChat.messages || []), userMessage];
    
    const chatRef = doc(firestore, 'users', user.uid, 'tutorChats', activeChatId);
    const originalInput = input;
    setInput("");
    setSending(true);

    try {
      await updateDoc(chatRef, { 
        messages: updatedMessages,
        lastMessageAt: Date.now()
      });

      const aiResponse = await tutorChat({
        message: originalInput,
        history: activeChat.messages.map((m: any) => ({ role: m.role, text: m.text })),
        context: selectedSession?.content || ""
      });

      const botMessage = { role: 'model' as const, text: aiResponse.response, timestamp: Date.now() };
      
      await updateDoc(chatRef, {
        messages: [...updatedMessages, botMessage],
        lastMessageAt: Date.now()
      });

    } catch (err: any) {
      toast({ 
        title: "Tutor error", 
        description: "Failed to process message. Please check your Gemini API key.",
        variant: "destructive" 
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'tutorChats', id));
      if (activeChatId === id) setActiveChatId(null);
      toast({ title: "Chat removed" });
    } catch (err: any) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const HistoryList = (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Conversations</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleStartNewChat}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {chatsLoading ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-primary/40" /></div>
      ) : chats && chats.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {chats.map((chat: any) => (
              <div key={chat.id} className="relative group">
                <Button 
                  variant={activeChatId === chat.id ? "secondary" : "ghost"} 
                  className={cn(
                    "w-full justify-start text-left h-auto py-3 px-4 rounded-xl border transition-all hover:bg-accent/50",
                    activeChatId === chat.id ? "border-primary/40 bg-primary/5 text-primary shadow-sm" : "border-transparent text-muted-foreground"
                  )}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  <div className="flex flex-col items-start gap-1 min-w-0 w-full">
                    <span className="font-bold text-sm truncate w-full">{chat.title}</span>
                    <span className="text-[10px] opacity-70">{new Date(chat.lastMessageAt).toLocaleDateString()}</span>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-2xl bg-muted/30">
          <MessageCircle className="h-8 w-8 text-muted-foreground/20 mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">No history found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md px-4 py-3 shrink-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" asChild>
              <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl shadow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-lg font-headline font-bold text-slate-900 leading-tight">AI Study Tutor</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">Powered by Gemini AI</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger className="w-[120px] md:w-[220px] h-9 rounded-full bg-slate-50 border-slate-200 text-xs font-medium">
                <SelectValue placeholder="Context" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">General Assistance</SelectItem>
                {sessions?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isMobile && (
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85%] p-6">
                  {HistoryList}
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 flex gap-8 overflow-hidden">
        {/* Sidebar - Desktop */}
        {!isMobile && (
          <aside className="w-72 flex flex-col shrink-0 overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
            {HistoryList}
          </aside>
        )}

        {/* Chat Section */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {activeChatId ? (
            <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
              <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto pb-32">
                  {activeChat?.messages?.map((msg: any, idx: number) => (
                    <div key={idx} className={cn(
                      "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105",
                        msg.role === 'user' ? "bg-primary text-white" : "bg-slate-900 text-white"
                      )}>
                        {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>
                      <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%]", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                          "p-4 md:p-5 rounded-3xl text-sm md:text-base leading-relaxed whitespace-pre-wrap shadow-sm",
                          msg.role === 'user' 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 mt-2 px-2 uppercase tracking-wider">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {sending && (
                    <div className="flex gap-4 items-start animate-pulse">
                      <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-slate-50 p-5 rounded-3xl rounded-tl-none border border-slate-100 flex items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 italic">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-slate-200/80 flex items-center gap-2">
                  <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                    <Input 
                      placeholder="Ask anything about your reading..." 
                      className="flex-1 h-12 border-none bg-transparent shadow-none focus-visible:ring-0 text-base px-4 font-medium"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={sending}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="h-11 w-11 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary" 
                      disabled={sending || !input.trim()}
                    >
                      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-[3rem] shadow-xl border border-slate-100">
               <div className="relative mb-8">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                 <div className="relative bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl inline-block rotate-3 hover:rotate-0 transition-transform duration-500">
                   <Bot className="h-20 w-20" />
                 </div>
                 <div className="absolute -top-4 -right-4 bg-yellow-400 p-3 rounded-full shadow-lg animate-bounce">
                   <Sparkles className="h-6 w-6 text-white" />
                 </div>
               </div>
               
               <h2 className="text-3xl md:text-5xl font-headline font-bold text-slate-900 mb-6 tracking-tight">Your Personal <span className="text-primary">Learning Guru</span></h2>
               <p className="text-slate-500 max-w-lg mb-12 text-lg md:text-xl font-medium leading-relaxed">
                 Stuck on a tricky concept? Want to dive deeper into your reading? I'm ready to help you unlock your full potential.
               </p>
               
               <Button 
                 size="lg" 
                 onClick={handleStartNewChat} 
                 className="rounded-full h-16 px-10 text-lg font-bold gap-3 shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95"
               >
                 <MessageCircle className="h-6 w-6" /> Start New Conversation
               </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}