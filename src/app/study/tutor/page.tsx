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
  User
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

export default function AiTutorPage() {
  const { user } = useUser();
  const { firestore } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | "none">("none");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Fetch User Sessions for context
  const sessionsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'), limit(10));
  }, [user, firestore]);
  const { data: sessions } = useCollection<any>(sessionsRef);

  // Fetch User Chat Histories
  const chatsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'tutorChats'), orderBy('lastMessageAt', 'desc'));
  }, [user, firestore]);
  const { data: chats, loading: chatsLoading } = useCollection<any>(chatsRef);

  // Fetch Active Chat Details
  const activeChatPath = useMemo(() => {
    if (!user || !activeChatId) return null;
    return `users/${user.uid}/tutorChats/${activeChatId}`;
  }, [user, activeChatId]);
  const { data: activeChat } = useDoc<any>(activeChatPath);

  // Get Content of Selected Session
  const selectedSession = sessions?.find(s => s.id === selectedSessionId);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
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
        { role: 'model', text: "Hello! I'm your SmartRead AI Tutor. How can I help you understand your reading material today?", timestamp: Date.now() }
      ]
    };

    try {
      const docRef = await addDoc(collection(firestore, 'users', user.uid, 'tutorChats'), newChat);
      setActiveChatId(docRef.id);
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
      // Optimistic Update
      await updateDoc(chatRef, { 
        messages: updatedMessages,
        lastMessageAt: Date.now()
      });

      // AI Call
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
        description: "Failed to process message. Please check your connection.",
        variant: "destructive" 
      });
      console.error(err);
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

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      <header className="border-b bg-white p-4 shrink-0">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-headline font-bold">AI Tutor</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="w-[180px] md:w-[240px] h-9">
                  <SelectValue placeholder="Tutoring Context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Help</SelectItem>
                  {sessions?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
             <Button size="sm" onClick={handleStartNewChat} className="rounded-full gap-2">
               <Plus className="h-4 w-4" /> New Chat
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex gap-6 overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-72 flex-col gap-4 overflow-y-auto pr-2 border-r h-full">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Chats</h3>
          </div>
          {chatsLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : chats && chats.length > 0 ? (
            <div className="space-y-3">
              {chats.map((chat: any) => (
                <div key={chat.id} className="relative group">
                  <Button 
                    variant={activeChatId === chat.id ? "secondary" : "ghost"} 
                    className={cn(
                      "w-full justify-start text-left h-auto py-3 px-4 rounded-xl border transition-all",
                      activeChatId === chat.id ? "border-primary/40 bg-primary/5" : "border-transparent"
                    )}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className="flex flex-col items-start gap-1 min-w-0 w-full">
                      <span className="font-bold text-sm truncate w-full">{chat.title}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(chat.lastMessageAt).toLocaleDateString()}</span>
                    </div>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl">
              <MessageCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-[10px] text-muted-foreground uppercase font-bold">No history</p>
            </div>
          )}
        </aside>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border overflow-hidden h-full">
          {activeChatId ? (
            <>
              <ScrollArea className="flex-1" ref={scrollRef}>
                <div className="p-4 md:p-8 space-y-6 max-w-3xl mx-auto pb-24">
                  {activeChat?.messages?.map((msg: any, idx: number) => (
                    <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        msg.role === 'user' ? "bg-primary" : "bg-accent"
                      )}>
                        {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                      </div>
                      <div className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
                          msg.role === 'user' 
                            ? "bg-primary text-primary-foreground rounded-tr-none" 
                            : "bg-muted text-foreground rounded-tl-none border border-border"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3 items-start animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted p-4 rounded-2xl rounded-tl-none border flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-xs font-medium italic">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-slate-50/80 backdrop-blur-sm shrink-0">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center max-w-4xl mx-auto">
                  <Input 
                    placeholder="Type your question here..." 
                    className="flex-1 h-12 rounded-xl bg-white border-primary/20 shadow-sm focus-visible:ring-primary/30"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shadow-md transition-all active:scale-95" disabled={sending || !input.trim()}>
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  AI Tutor can make mistakes. Verify important information.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-transparent to-primary/5">
               <div className="bg-white p-8 rounded-3xl shadow-xl border mb-6 relative">
                 <Bot className="h-16 w-16 text-primary animate-bounce" />
                 <div className="absolute -top-2 -right-2">
                   <Sparkles className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                 </div>
               </div>
               <h2 className="text-3xl font-headline font-bold mb-3">Hello! I'm your AI Study Buddy.</h2>
               <p className="text-muted-foreground max-w-md mb-10 text-lg leading-relaxed">
                 Need a simple explanation of a complex topic? Or help understanding a specific reading session? I'm here to help 24/7.
               </p>
               <Button size="lg" onClick={handleStartNewChat} className="rounded-2xl h-14 px-10 text-lg gap-3 shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                 <MessageCircle className="h-6 w-6" /> Start First Chat
               </Button>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 w-full max-w-3xl">
                 <div className="p-4 rounded-2xl bg-white shadow-sm border text-center">
                    <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Contextual</h4>
                    <p className="text-[10px] text-muted-foreground">References your specific quiz readings.</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white shadow-sm border text-center">
                    <Sparkles className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Adaptive</h4>
                    <p className="text-[10px] text-muted-foreground">Explanations tuned to your level.</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-white shadow-sm border text-center">
                    <Plus className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Always On</h4>
                    <p className="text-[10px] text-muted-foreground">Get help whenever you're stuck.</p>
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}