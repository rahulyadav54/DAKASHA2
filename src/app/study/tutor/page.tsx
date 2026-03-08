
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
  Plus
} from "lucide-react";
import Link from "next/link";
import { useUser, useCollection, useAuth, useDoc } from "@/firebase";
import { collection, query, orderBy, addDoc, doc, updateDoc, deleteDoc, limit, Timestamp } from "firebase/firestore";
import { tutorChat } from "@/ai/flows/ai-tutor-chat";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AiTutorPage() {
  const { user } = useUser();
  const { firestore } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | "none">("none");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // 1. Fetch User Sessions (for context)
  const sessionsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'), limit(10));
  }, [user, firestore]);
  const { data: sessions } = useCollection<any>(sessionsRef);

  // 2. Fetch User Chat Histories
  const chatsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'tutorChats'), orderBy('lastMessageAt', 'desc'));
  }, [user, firestore]);
  const { data: chats, loading: chatsLoading } = useCollection<any>(chatsRef);

  // 3. Fetch Active Chat Details
  const activeChatPath = useMemo(() => {
    if (!user || !activeChatId) return null;
    return `users/${user.uid}/tutorChats/${activeChatId}`;
  }, [user, activeChatId]);
  const { data: activeChat } = useDoc<any>(activeChatPath);

  // 4. Get Content of Selected Session for context
  const selectedSession = sessions?.find(s => s.id === selectedSessionId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [activeChat?.messages]);

  const handleStartNewChat = async () => {
    if (!user || !firestore) return;
    const title = selectedSession ? `Tutoring: ${selectedSession.title}` : "New Learning Chat";
    const newChat = {
      title,
      sessionId: selectedSessionId === "none" ? null : selectedSessionId,
      lastMessageAt: Date.now(),
      messages: [
        { role: 'model', text: "Hello! I'm your SmartRead AI Tutor. How can I help you today?", timestamp: Date.now() }
      ]
    };
    try {
      const docRef = await addDoc(collection(firestore, 'users', user.uid, 'tutorChats'), newChat);
      setActiveChatId(docRef.id);
    } catch (err) {
      toast({ title: "Failed to start chat", variant: "destructive" });
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sending || !user || !firestore || !activeChatId || !activeChat) return;

    const userMessage = { role: 'user' as const, text: input, timestamp: Date.now() };
    const updatedMessages = [...activeChat.messages, userMessage];
    
    setInput("");
    setSending(true);

    try {
      // 1. Optimistic update local
      const chatRef = doc(firestore, 'users', user.uid, 'tutorChats', activeChatId);
      updateDoc(chatRef, { 
        messages: updatedMessages,
        lastMessageAt: Date.now()
      });

      // 2. Call AI
      const aiResponse = await tutorChat({
        message: input,
        history: activeChat.messages.map((m: any) => ({ role: m.role, text: m.text })),
        context: selectedSession?.content || ""
      });

      // 3. Update with AI response
      const botMessage = { role: 'model' as const, text: aiResponse.response, timestamp: Date.now() };
      updateDoc(chatRef, {
        messages: [...updatedMessages, botMessage],
        lastMessageAt: Date.now()
      });

    } catch (err) {
      toast({ title: "Failed to get AI response", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (id: string) => {
    if (!user || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'tutorChats', id));
      if (activeChatId === id) setActiveChatId(null);
      toast({ title: "Chat deleted" });
    } catch (err) {
      toast({ title: "Failed to delete chat", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white p-4 sticky top-0 z-50">
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

      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)] overflow-hidden">
        {/* Sidebar - Chat History */}
        <aside className="hidden md:flex w-72 flex-col gap-4 overflow-y-auto pr-2 border-r">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Chats</h3>
          </div>
          {chatsLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : chats && chats.length > 0 ? (
            chats.map((chat: any) => (
              <div key={chat.id} className="relative group">
                <Button 
                  variant={activeChatId === chat.id ? "secondary" : "ghost"} 
                  className={cn("w-full justify-start text-left h-auto py-3 px-4 rounded-xl border flex flex-col items-start gap-1", activeChatId === chat.id && "border-primary/30")}
                  onClick={() => setActiveChatId(chat.id)}
                >
                  <span className="font-bold text-sm truncate w-full">{chat.title}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(chat.lastMessageAt).toLocaleDateString()}</span>
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
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-10">No recent chats found.</p>
          )}
        </aside>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-md border overflow-hidden relative">
          {activeChatId ? (
            <>
              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 md:p-6" viewportRef={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                  {activeChat?.messages.map((msg: any, idx: number) => (
                    <div key={idx} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                      <div className={cn(
                        "max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted text-foreground rounded-tl-none border border-border"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 mx-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex items-start">
                      <div className="bg-muted p-4 rounded-2xl rounded-tl-none border border-border flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm italic">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <CardFooter className="p-4 border-t bg-slate-50">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2 items-center">
                  <Input 
                    placeholder="Ask your tutor anything..." 
                    className="flex-1 h-12 rounded-xl bg-white border-primary/20"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                  />
                  <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shadow-md" disabled={sending || !input.trim()}>
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
               <div className="bg-primary/10 p-6 rounded-full mb-6">
                 <Bot className="h-12 w-12 text-primary" />
               </div>
               <h2 className="text-2xl font-headline mb-3">Your AI Learning Companion</h2>
               <p className="text-muted-foreground max-w-sm mb-8">
                 Select a chat from the sidebar or start a new one to begin your personalized tutoring session.
               </p>
               <Button size="lg" onClick={handleStartNewChat} className="rounded-xl gap-2 shadow-lg">
                 <Sparkles className="h-5 w-5" /> Start First Tutoring Session
               </Button>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-lg">
                 <Card className="bg-accent/5 border-none shadow-sm">
                   <CardContent className="pt-6">
                     <BookOpen className="h-5 w-5 text-accent mb-2" />
                     <h3 className="font-bold text-sm mb-1">Context Aware</h3>
                     <p className="text-xs text-muted-foreground">Tutor knows what you're studying if you pick a session.</p>
                   </CardContent>
                 </Card>
                 <Card className="bg-accent/5 border-none shadow-sm">
                   <CardContent className="pt-6">
                     <MessageCircle className="h-5 w-5 text-accent mb-2" />
                     <h3 className="font-bold text-sm mb-1">Explain Anything</h3>
                     <p className="text-xs text-muted-foreground">Ask for simplified explanations or detailed deep dives.</p>
                   </CardContent>
                 </Card>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
