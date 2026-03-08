"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  BookOpenText, 
  Sparkles, 
  Loader2, 
  FileText, 
  CheckCircle2, 
  ListOrdered,
  BookMarked,
  HelpCircle,
  Upload,
  FileType,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { generateStudyGuide, StudyGuideOutput } from "@/ai/flows/study-guide-generator";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { extractTextFromPdf } from "@/lib/pdf-utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function StudyGuidePage() {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [guide, setGuide] = useState<StudyGuideOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF document.",
        variant: "destructive"
      });
      return;
    }

    setParsing(true);
    setFileName(file.name);
    try {
      const text = await extractTextFromPdf(file);
      setContent(text);
      toast({ title: "PDF text extracted successfully!" });
    } catch (error) {
      toast({
        title: "Extraction Error",
        description: "Failed to read the PDF. Try pasting the text manually.",
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  };

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
              <CardTitle className="text-2xl font-headline">Generate Your Custom Study Guide</CardTitle>
              <CardDescription className="max-w-lg mx-auto">
                Paste any text or upload a PDF to extract summaries, key points, vocabulary, and important questions with answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="text"><FileText className="h-4 w-4 mr-2" /> Paste Text</TabsTrigger>
                  <TabsTrigger value="file"><Upload className="h-4 w-4 mr-2" /> Upload PDF</TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="mt-0">
                  <Textarea 
                    placeholder="Paste your reading material or notes here..." 
                    className="min-h-[300px] text-base p-4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="file" className="mt-0">
                  <div 
                    className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer hover:bg-accent/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf"
                      onChange={handleFileChange} 
                    />
                    {parsing ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        <p className="text-sm font-medium">Extracting text...</p>
                      </div>
                    ) : fileName ? (
                      <div className="flex flex-col items-center space-y-2">
                        <FileType className="h-12 w-12 text-primary" />
                        <p className="font-semibold text-primary">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Click to replace file</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-primary/10 p-4 rounded-full">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">Drop your PDF here</p>
                          <p className="text-sm text-muted-foreground">We'll automatically read the text for you.</p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                className="w-full h-14 text-lg rounded-xl shadow-md transition-all active:scale-[0.98]" 
                disabled={generating || parsing || !content.trim()} 
                onClick={handleGenerate}
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate AI Study Guide
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              {/* Summary & Key Points */}
              <Card className="shadow-md border-none overflow-hidden">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="font-headline text-xl">{guide.title}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">Automated Study Companion</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Summary
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                      {guide.summary}
                    </p>
                  </div>
                  
                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <ListOrdered className="h-4 w-4" /> Key Takeaways
                    </h3>
                    <div className="grid gap-3">
                      {guide.keyPoints.map((point, i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
                          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                          <span className="text-sm md:text-base leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Questions */}
              <div className="space-y-4">
                <h2 className="text-2xl font-headline flex items-center gap-3">
                  <HelpCircle className="h-7 w-7 text-primary" />
                  Important Questions & Answers
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {guide.studyQuestions.map((sq, i) => (
                    <AccordionItem key={i} value={`q-${i}`} className="border rounded-xl bg-white px-4 overflow-hidden shadow-sm">
                      <AccordionTrigger className="hover:no-underline py-4 text-left font-semibold">
                        {sq.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="p-5 rounded-lg bg-green-50 border border-green-100 text-sm md:text-base leading-relaxed">
                          <span className="block text-[10px] font-bold text-green-600 uppercase mb-2">Answer</span>
                          {sq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            <div className="space-y-6">
              {/* Vocabulary Sidebar */}
              <Card className="shadow-md border-primary/10">
                <CardHeader className="bg-accent/5">
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-accent" />
                    Key Vocabulary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {guide.vocabulary.map((v, i) => (
                    <div key={i} className="space-y-2">
                      <span className="font-bold text-sm block text-accent">{v.word}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{v.definition}</p>
                      {i < guide.vocabulary.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Card */}
              <Card className="bg-primary text-primary-foreground shadow-lg overflow-hidden relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <CardContent className="pt-8">
                  <h3 className="font-headline text-lg mb-2">Mastered the material?</h3>
                  <p className="text-sm opacity-90 mb-6">Test your knowledge with a generated quiz based on this study guide.</p>
                  <Button variant="secondary" className="w-full h-12 font-bold" asChild>
                    <Link href="/quiz/new">Take Final Quiz</Link>
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
