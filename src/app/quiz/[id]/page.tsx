
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuizResult, AnswerEvaluation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  BookOpen, 
  Info,
  FileText,
  HelpCircle,
  AlertCircle,
  Timer
} from "lucide-react";
import { semanticAnswerEvaluator } from "@/ai/flows/semantic-answer-evaluator-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useDoc, useAuth } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function QuizSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useAuth();
  const isMobile = useIsMobile();
  
  const sessionRefStr = useMemo(() => {
    if (!user || !id) return null;
    return `users/${user.uid}/sessions/${id}`;
  }, [user, id]);

  const { data: session, loading: sessionLoading } = useDoc<any>(sessionRefStr);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("question");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const allQuestions = useMemo(() => {
    if (!session?.questions) return [];
    return [
      ...(session.questions.multipleChoiceQuestions || []).map((q: any) => ({ ...q, type: 'mcq' })),
      ...(session.questions.trueFalseQuestions || []).map((q: any) => ({ ...q, type: 'tf' })),
      ...(session.questions.fillInTheBlanksQuestions || []).map((q: any) => ({ ...q, type: 'fitb' })),
      ...(session.questions.shortAnswerQuestions || []).map((q: any) => ({ ...q, type: 'sa' }))
    ];
  }, [session]);

  const handleSubmit = useCallback(async () => {
    if (!firestore || !user || !session || submitting) return;
    setSubmitting(true);
    try {
      const evaluations: AnswerEvaluation[] = [];
      let totalWeightedScore = 0;

      for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        const studentAnswer = (answers[i] || "").toString().trim();
        
        let evalResult;
        if (q.type === 'sa') {
          evalResult = await semanticAnswerEvaluator({
            question: q.question as string,
            correctAnswer: q.referenceAnswer || "",
            studentAnswer,
            context: session.content || ""
          });
        } else if (q.type === 'tf') {
          const isTrueValue = (q.isTrue ?? "").toString().toLowerCase();
          const isCorrect = studentAnswer.toLowerCase() === isTrueValue;
          evalResult = {
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Correct!" : "Incorrect.",
            suggestionsForImprovement: ""
          };
        } else {
          const correctAnswerText = (q.correctAnswer ?? "").toString().toLowerCase().trim();
          const isCorrect = studentAnswer.toLowerCase().trim() === correctAnswerText;
          evalResult = {
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Correct!" : "Incorrect.",
            suggestionsForImprovement: ""
          };
        }

        evaluations.push({
          questionId: i.toString(),
          questionText: q.question || q.sentenceWithBlank || "Unknown Question",
          studentAnswer,
          correctAnswer: (q.correctAnswer ?? q.referenceAnswer ?? q.isTrue ?? "").toString(),
          isCorrect: (evalResult?.correctnessScore || 0) > 70,
          score: evalResult?.correctnessScore || 0,
          feedback: evalResult?.explanationFeedback || "",
          suggestions: evalResult?.suggestionsForImprovement || ""
        });

        totalWeightedScore += evalResult?.correctnessScore || 0;
      }

      // Calculate final score based on totalMarks if defined, otherwise as percentage
      const avgPercentage = allQuestions.length > 0 ? totalWeightedScore / allQuestions.length : 0;
      const finalScore = session.totalMarks 
        ? Math.round((avgPercentage / 100) * session.totalMarks)
        : Math.round(avgPercentage);

      const results: QuizResult = {
        score: finalScore,
        totalQuestions: allQuestions.length,
        evaluations,
        feedback: "Assessment complete."
      };

      const docRef = doc(firestore, 'users', user.uid, 'sessions', id as string);
      await updateDoc(docRef, { results });
      router.push(`/quiz/${id}/results`);

    } catch (error) {
      toast({
        title: "Grading failed",
        description: "There was a problem grading your quiz.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }, [firestore, user, session, allQuestions, answers, submitting, id, router, toast]);

  // Timer logic
  useEffect(() => {
    if (session?.timer && timeLeft === null) {
      setTimeLeft(session.timer * 60);
    }
  }, [session, timeLeft]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      toast({ title: "Time's up!", description: "Submitting your quiz automatically." });
      handleSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, handleSubmit, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quiz Not Found</AlertTitle>
          <AlertDescription>The quiz session could not be found.</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const totalSteps = allQuestions.length;
  const currentQuestion = allQuestions[currentIdx];
  const progress = totalSteps > 0 ? ((currentIdx + 1) / totalSteps) * 100 : 0;

  const handleNext = () => {
    if (currentIdx < totalSteps - 1) {
      setCurrentIdx(currentIdx + 1);
      setActiveTab("question");
    } else {
      handleSubmit();
    }
  };

  const setAnswer = (val: string) => {
    setAnswers({ ...answers, [currentIdx]: val });
  };

  const PassageContent = (
    <Card className={`${isMobile ? 'min-h-[400px]' : 'h-[calc(100vh-160px)]'} overflow-hidden flex flex-col shadow-sm border-none md:border`}>
      <CardHeader className="border-b bg-accent/5 shrink-0">
        <CardTitle className="text-sm font-headline flex items-center gap-2">
          <Info className="h-4 w-4" /> Reference Passage
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 md:p-6 font-body whitespace-pre-wrap text-sm md:text-base leading-relaxed">
         {session.content || "No content available."}
      </CardContent>
    </Card>
  );

  const QuizContent = (
    <Card className="flex-1 shadow-md border-primary/20 flex flex-col min-h-[400px]">
      <CardHeader className="border-b pb-4">
         <CardTitle className="text-lg md:text-xl font-headline leading-tight">
           {currentQuestion?.question || currentQuestion?.sentenceWithBlank || "Question missing"}
         </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 pt-6 md:pt-8">
        {currentQuestion.type === 'mcq' && (
          <RadioGroup value={answers[currentIdx] || ""} onValueChange={setAnswer} className="space-y-3">
            {(currentQuestion.options || []).map((opt: string, i: number) => (
              <div key={i} onClick={() => setAnswer(opt)} className={`flex items-center space-x-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-colors ${answers[currentIdx] === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-muted'}`}>
                <RadioGroupItem value={opt} id={`opt-${i}`} />
                <Label htmlFor={`opt-${i}`} className="flex-1 text-sm md:text-base cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.type === 'tf' && (
          <RadioGroup value={answers[currentIdx] || ""} onValueChange={setAnswer} className="grid grid-cols-2 gap-4">
            {['true', 'false'].map((opt) => (
              <div key={opt} onClick={() => setAnswer(opt)} className={`flex items-center justify-center p-6 md:p-8 rounded-xl border-2 cursor-pointer transition-colors ${answers[currentIdx] === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-muted'}`}>
                <RadioGroupItem value={opt} id={`tf-${opt}`} className="sr-only" />
                <Label htmlFor={`tf-${opt}`} className="text-base md:text-lg font-bold capitalize cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {currentQuestion.type === 'fitb' && (
          <Input placeholder="Missing word..." className="h-12 md:h-14 text-base md:text-lg" value={answers[currentIdx] || ""} onChange={(e) => setAnswer(e.target.value)} />
        )}

        {currentQuestion.type === 'sa' && (
          <Textarea placeholder="Your explanation..." className="min-h-[150px] md:min-h-[200px] text-base md:text-lg" value={answers[currentIdx] || ""} onChange={(e) => setAnswer(e.target.value)} />
        )}
      </CardContent>

      <CardFooter className="border-t p-4 md:p-6 flex justify-between">
        <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0 || submitting}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Previous
        </Button>
        <Button size={isMobile ? "sm" : "default"} onClick={handleNext} disabled={submitting || !answers[currentIdx]}>
          {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : currentIdx === totalSteps - 1 ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white p-3 md:p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-sm font-bold truncate max-w-[120px] md:max-w-[200px]">{session.title}</h2>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 flex-1 max-w-md">
            <Progress value={progress} className="h-1.5 md:h-2 flex-1" />
            <span className="text-[10px] md:text-xs font-bold text-muted-foreground whitespace-nowrap">{currentIdx + 1}/{totalSteps}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-mono font-bold text-xs md:text-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                <Timer className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')} className="h-8 text-[10px] md:text-xs">Exit</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        {isMobile ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-4">
            <TabsList className="grid w-full grid-cols-2 h-11 bg-muted p-1 rounded-xl">
              <TabsTrigger value="passage" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4 mr-2" /> Passage
              </TabsTrigger>
              <TabsTrigger value="question" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <HelpCircle className="h-4 w-4 mr-2" /> Question
              </TabsTrigger>
            </TabsList>
            <TabsContent value="passage" className="mt-0">{PassageContent}</TabsContent>
            <TabsContent value="question" className="mt-0">{QuizContent}</TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-start">
            {PassageContent}
            {QuizContent}
          </div>
        )}
      </main>
    </div>
  );
}
