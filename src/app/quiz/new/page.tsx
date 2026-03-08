"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Upload, FileText, Loader2, Sparkles, ArrowLeft, FileType } from "lucide-react";
import { generateQuestions } from "@/ai/flows/ai-question-generator";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { extractTextFromPdf } from "@/lib/pdf-utils";
import { useAuth, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function NewQuizPage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useAuth();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      if (text.length < 50) {
        toast({
          title: "Text extraction warning",
          description: "We couldn't extract enough text from this PDF. It might be scanned or image-heavy.",
          variant: "destructive"
        });
      }
      setContent(text);
      if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
    } catch (error) {
      console.error(error);
      toast({
        title: "PDF Parsing Error",
        description: "Failed to read the PDF. Please try pasting the text manually.",
        variant: "destructive"
      });
    } finally {
      setParsing(false);
    }
  }

  async function handleGenerate() {
    if (!content || !title || !user || !firestore) {
      toast({
        title: "Missing requirements",
        description: "Please provide content and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const questions = await generateQuestions({ content });
      
      const sessionId = Math.random().toString(36).substr(2, 9);
      const sessionRef = doc(firestore, 'users', user.uid, 'sessions', sessionId);

      const newSession = {
        id: sessionId,
        title,
        content,
        questions,
        timestamp: Date.now()
      };

      setDoc(sessionRef, newSession)
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: sessionRef.path,
            operation: 'create',
            requestResourceData: newSession,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      router.push(`/quiz/${sessionId}`);
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
                <Tabs defaultValue="text" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-semibold">Input Source</Label>
                    <TabsList className="grid w-auto grid-cols-2">
                      <TabsTrigger value="text" className="text-xs">
                        <FileText className="h-3 w-3 mr-2" /> Paste Text
                      </TabsTrigger>
                      <TabsTrigger value="file" className="text-xs">
                        <Upload className="h-3 w-3 mr-2" /> Upload PDF
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="text" className="mt-0">
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
                          <p className="text-sm font-medium">Extracting text from PDF...</p>
                        </div>
                      ) : fileName ? (
                        <div className="flex flex-col items-center space-y-2">
                          <FileType className="h-12 w-12 text-primary" />
                          <p className="font-semibold text-primary">{fileName}</p>
                          <p className="text-xs text-muted-foreground">Click to replace file</p>
                          <div className="pt-4 w-full">
                            <Textarea 
                              value={content.slice(0, 500) + (content.length > 500 ? "..." : "")}
                              readOnly
                              className="bg-muted text-xs h-24"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="bg-primary/10 p-4 rounded-full">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">PDF (MAX. 10MB)</p>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-lg rounded-xl transition-all shadow-md active:scale-[0.98]" 
                disabled={loading || parsing || !content || !title}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
