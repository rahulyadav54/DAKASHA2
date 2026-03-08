"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Upload, FileText, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { generateQuestions } from "@/ai/flows/ai-question-generator";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function NewQuizPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleGenerate() {
    if (!content || !title) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and some content to generate questions.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const questions = await generateQuestions({ content });
      
      const newSession = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        content,
        questions,
        timestamp: Date.now()
      };

      store.addSession(newSession);
      router.push(`/quiz/${newSession.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation failed",
        description: "There was an error generating your quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" className="mb-6 gap-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="shadow-lg border-primary/10 overflow-hidden">
          <CardHeader className="bg-primary/5 pb-10 pt-10 px-8 text-center border-b">
            <div className="bg-white p-3 rounded-2xl shadow-sm inline-block mb-4">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Create New Reading Quiz</CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              Our AI will analyze your content to create a personalized comprehension assessment.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Quiz Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Photosynthesis Chapter 1" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Input Source</Label>
                  <Tabs defaultValue="text" className="w-auto">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text" className="text-xs">
                        <FileText className="h-3 w-3 mr-2" /> Paste Text
                      </TabsTrigger>
                      <TabsTrigger value="file" className="text-xs" disabled>
                        <Upload className="h-3 w-3 mr-2" /> Upload PDF
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="relative group">
                  <Textarea 
                    placeholder="Paste your reading passage here..." 
                    className="min-h-[300px] text-base leading-relaxed p-4 resize-none transition-all border-2 focus-visible:ring-primary/20"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded border">
                    {content.length} characters
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-xl transition-all shadow-md active:scale-[0.98]" 
                disabled={loading || !content || !title}
                onClick={handleGenerate}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Content & Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate AI Quiz
                  </>
                )}
              </Button>
              
              <p className="text-center text-xs text-muted-foreground px-4">
                AI technology provides advanced insights but may occasionally generate inaccuracies. Please verify key educational facts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}