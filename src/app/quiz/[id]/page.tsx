
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuizResult, AnswerEvaluation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  BookOpen, 
  SendHorizontal,
  Info
} from "lucide-react";
import { semanticAnswerEvaluator } from "@/ai/flows/semantic-answer-evaluator-flow";
import { useToast } from "@/hooks/use-toast";
import { useUser, useDoc, useAuth } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function QuizSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useAuth();
  
  const sessionRefStr = useMemo(() => {
    if (!user || !id) return null;
    return `users/${user.uid}/sessions/${id}`;
  }, [user, id]);

  const { data: session, loading: sessionLoading } = useDoc(sessionRefStr);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/dashboard');
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  const allQuestions = [
    ...(session.questions.multipleChoiceQuestions || []).map((q: any) => ({ ...q, type: 'mcq' })),
    ...(session.questions.trueFalseQuestions || []).map((q: any) => ({ ...q, type: 'tf' })),
    ...(session.questions.fillInTheBlanksQuestions || []).map((q: any) => ({ ...q, type: 'fitb' })),
    ...(session.questions.shortAnswerQuestions || []).map((q: any) => ({ ...q, type: 'sa' }))
  ];

  const totalSteps = allQuestions.length;
  const currentQuestion = allQuestions[currentIdx];
  const progress = ((currentIdx + 1) / totalSteps) * 100;

  async function handleSubmit() {
    if (!firestore || !user) return;
    setSubmitting(true);
    try {
      const evaluations: AnswerEvaluation[] = [];
      let totalScore = 0;

      for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        const studentAnswer = answers[i] || "";
        
        let evalResult;
        if (q.type === 'sa') {
          evalResult = await semanticAnswerEvaluator({
            question: q.question as string,
            correctAnswer: q.referenceAnswer,
            studentAnswer,
            context: session!.content
          });
        } else if (q.type === 'tf') {
          const isTrueValue = q.isTrue?.toString().toLowerCase();
          const isCorrect = studentAnswer.toLowerCase() === isTrueValue;
          evalResult = {
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Perfect!" : "Incorrect.",
            suggestionsForImprovement: ""
          };
        } else {
          const correctAnswerText = q.correctAnswer?.toString().toLowerCase().trim() || "";
          const isCorrect = studentAnswer.toLowerCase().trim() === correctAnswerText;
          evalResult = {
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Perfect!" : "Incorrect.",
            suggestionsForImprovement: ""
          };
        }

        evaluations.push({
          questionId: i.toString(),
          questionText: q.question || q.sentenceWithBlank,
          studentAnswer,
          correctAnswer: q.correctAnswer?.toString() || q.referenceAnswer || q.isTrue?.toString(),
          isCorrect: evalResult.correctnessScore > 70,
          score: evalResult.correctnessScore,
          feedback: evalResult.explanationFeedback,
          suggestions: evalResult.suggestionsForImprovement
        });

        totalScore += evalResult.correctnessScore;
      }

      const results: QuizResult = {
        score: Math.round(totalScore / allQuestions.length),
        totalQuestions: allQuestions.length,
        evaluations,
        feedback: "Assessment complete."
      };

      const docRef = doc(firestore, 'users', user.uid, 'sessions', id as string);
      updateDoc(docRef, { results });
      router.push(`/quiz/${id}/results`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleNext = () => {
    if (currentIdx < totalSteps - 1) setCurrentIdx(currentIdx + 1);
    else handleSubmit();
  };

  const setAnswer = (val: string) => {
    setAnswers({ ...answers, [currentIdx]: val });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold truncate max-w-[200px]">{session.title}</h2>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-md mx-6">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs font-bold text-muted-foreground">{currentIdx + 1}/{totalSteps}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>Exit</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <Card className="h-[calc(100vh-160px)] overflow-hidden flex flex-col">
          <CardHeader className="border-b bg-accent/5 shrink-0">
            <CardTitle className="text-sm font-headline flex items-center gap-2">
              <Info className="h-4 w-4" /> Reference Passage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6 font-body whitespace-pre-wrap">
             {session.content}
          </CardContent>
        </Card>

        <Card className="flex-1 shadow-md border-primary/20 flex flex-col">
          <CardHeader className="border-b pb-4">
             <CardTitle className="text-xl font-headline leading-tight">
               {currentQuestion.question || currentQuestion.sentenceWithBlank}
             </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 pt-8">
            {currentQuestion.type === 'mcq' && (
              <RadioGroup value={answers[currentIdx] || ""} onValueChange={setAnswer} className="space-y-3">
                {currentQuestion.options.map((opt: string, i: number) => (
                  <div key={i} onClick={() => setAnswer(opt)} className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer ${answers[currentIdx] === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-muted'}`}>
                    <RadioGroupItem value={opt} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 text-base cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'tf' && (
              <RadioGroup value={answers[currentIdx] || ""} onValueChange={setAnswer} className="grid grid-cols-2 gap-4">
                {['true', 'false'].map((opt) => (
                  <div key={opt} onClick={() => setAnswer(opt)} className={`flex items-center justify-center p-8 rounded-xl border-2 cursor-pointer ${answers[currentIdx] === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-muted'}`}>
                    <RadioGroupItem value={opt} id={`tf-${opt}`} className="sr-only" />
                    <Label htmlFor={`tf-${opt}`} className="text-lg font-bold capitalize cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'fitb' && (
              <Input placeholder="Missing word..." className="h-14 text-lg" value={answers[currentIdx] || ""} onChange={(e) => setAnswer(e.target.value)} />
            )}

            {currentQuestion.type === 'sa' && (
              <Textarea placeholder="Your explanation..." className="min-h-[200px] text-lg" value={answers[currentIdx] || ""} onChange={(e) => setAnswer(e.target.value)} />
            )}
          </CardContent>

          <CardFooter className="border-t p-6 flex justify-between">
            <Button variant="ghost" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0 || submitting}>
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={submitting || !answers[currentIdx]}>
              {submitting ? <Loader2 className="animate-spin" /> : currentIdx === totalSteps - 1 ? 'Finish' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
