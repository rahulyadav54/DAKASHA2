
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BookOpenText, 
  Sparkles, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  ListOrdered,
  BookMarked
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { generateStudyGuide, StudyGuideOutput } from "@/ai/flows/study-guide-generator";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function StudyGuidePage() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [guide, setGuide] = useState<StudyGuideOutput | null>(null);

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setGenerating(true);
    try {
      const result = await generateStudyGuide({ content });
      setGuide(result);
      toast({ title: "Study Guide Ready!" });
    } catch (err) {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <h1 className="text-2xl md:text-3xl font-headline flex items-center gap-2">
              <BookOpenText className="h-6 w-6 text-primary" />
              AI Study Guides
            </h1>
          </div>
          {guide && (
             <Button variant="outline" size="sm" onClick={() => setGuide(null)}>New Guide</Button>
          )}
        </header>

        {!guide ? (
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="text-center py-10">
              <div className="bg-primary/5 p-4 rounded-full inline-block mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Transform Text into a Study Guide</CardTitle>
              <p className="text-muted-foreground">Paste any text or notes, and we'll create a structured guide with key takeaways and vocabulary.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Textarea 
                placeholder="Paste your material here..." 
                className="min-h-[300px] text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button className="w-full h-14 text-lg rounded-xl shadow-md" disabled={generating || !content} onClick={handleGenerate}>
                {generating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Generate Study Guide
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-md border-none">
                <CardHeader className="bg-primary/5 rounded-t-lg">
                  <CardTitle className="font-headline text-xl">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{guide.summary}</p>
                  </div>
                  
                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <ListOrdered className="h-4 w-4" /> Key Takeaways
                    </h3>
                    <ul className="space-y-3">
                      {guide.keyPoints.map((point, i) => (
                        <li key={i} className="flex gap-3 text-sm md:text-base">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-accent" />
                    Vocabulary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guide.vocabulary.map((v, i) => (
                    <div key={i} className="space-y-1">
                      <span className="font-bold text-sm block text-accent">{v.word}</span>
                      <p className="text-xs text-muted-foreground">{v.definition}</p>
                      {i < guide.vocabulary.length - 1 && <Separator className="mt-2" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-accent text-accent-foreground shadow-lg">
                <CardContent className="pt-6">
                  <h3 className="font-headline mb-2">Ready to test?</h3>
                  <p className="text-sm opacity-80 mb-4">Turn this guide into a quiz to reinforce your memory.</p>
                  <Button variant="secondary" className="w-full" asChild>
                    <Link href="/quiz/new">Start Quiz</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
