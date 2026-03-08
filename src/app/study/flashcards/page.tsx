
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Library, 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sparkles,
  Loader2,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useUser, useCollection, useAuth } from "@/firebase";
import { collection, query, orderBy, addDoc } from "firebase/firestore";
import { generateFlashcards } from "@/ai/flows/flashcards-generator";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function FlashcardsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useAuth();
  const { toast } = useToast();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [open, setOpen] = useState(false);

  const flashcardsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'flashcards'), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: sets, loading } = useCollection<any>(flashcardsRef);

  const activeSet = sets?.[0] || null;
  const cards = activeSet?.cards || [];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleGenerate = async () => {
    if (!newContent.trim() || !user || !firestore) return;
    setGenerating(true);
    try {
      const result = await generateFlashcards({ content: newContent });
      await addDoc(collection(firestore, 'users', user.uid, 'flashcards'), {
        ...result,
        timestamp: Date.now()
      });
      setOpen(false);
      setNewContent("");
      toast({ title: "Flashcards Created!" });
    } catch (err) {
      toast({ title: "Failed to generate", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline flex items-center gap-2">
                <Library className="h-6 w-6 text-primary" />
                AI Flashcards
              </h1>
              <p className="text-sm text-muted-foreground">Master key terms from your reading material.</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2 shadow-md">
                <Plus className="h-4 w-4" /> New Set
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Generate Flashcards</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Label>Paste Content</Label>
                <Textarea 
                  placeholder="Paste a passage to generate flashcards..." 
                  className="min-h-[200px]"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <Button className="w-full h-12" onClick={handleGenerate} disabled={generating || !newContent}>
                  {generating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate with AI
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {cards.length > 0 ? (
          <div className="flex flex-col items-center gap-8">
            <div className="w-full max-w-lg aspect-[4/3] perspective-1000 group">
              <div 
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              >
                {/* Front */}
                <Card className="absolute inset-0 backface-hidden shadow-xl border-primary/20 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <span className="absolute top-4 left-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Question</span>
                  <h2 className="text-xl md:text-2xl font-bold">{cards[currentIdx].term}</h2>
                  <div className="absolute bottom-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <RotateCw className="h-3 w-3" /> Click to flip
                  </div>
                </Card>
                
                {/* Back */}
                <Card className="absolute inset-0 backface-hidden rotate-y-180 shadow-xl border-accent/20 flex flex-col items-center justify-center p-8 text-center bg-accent/5">
                  <span className="absolute top-4 left-4 text-[10px] font-bold text-accent uppercase tracking-widest">Definition</span>
                  <p className="text-base md:text-lg leading-relaxed">{cards[currentIdx].definition}</p>
                  <div className="absolute bottom-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <RotateCw className="h-3 w-3" /> Click to flip back
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full h-12 w-12 shadow-sm">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="font-bold text-muted-foreground">{currentIdx + 1} / {cards.length}</span>
              <Button variant="outline" size="icon" onClick={handleNext} className="rounded-full h-12 w-12 shadow-sm">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {sets.slice(1, 4).map((set: any) => (
                <Card key={set.id} className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm" onClick={() => {
                  toast({ title: `Loaded: ${set.title}` });
                  setCurrentIdx(0);
                  setIsFlipped(false);
                }}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm truncate">{set.title}</CardTitle>
                    <CardDescription className="text-xs">{set.cards.length} cards • {new Date(set.timestamp).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-12 text-center shadow-md border-dashed">
            <Library className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="text-xl font-headline mb-2">No flashcards yet</h2>
            <p className="text-muted-foreground mb-6">Create your first set of flashcards using AI to start studying!</p>
            <Button onClick={() => setOpen(true)}>Create First Set</Button>
          </Card>
        )}
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
