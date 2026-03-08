"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { QuizSession, AnswerEvaluation, QuizResult } from "@/lib/types";
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
  BrainCircuit, 
  SendHorizontal,
  Info
} from "lucide-react";
import { semanticAnswerEvaluator } from "@/ai/flows/semantic-answer-evaluator-flow";
import { useToast } from "@/hooks/use-toast";

export default function QuizSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = store.getSession(id as string);
    if (s) setSession(s);
    else router.push('/dashboard');
  }, [id, router]);

  if (!session) return null;

  const allQuestions = [
    ...session.questions.multipleChoiceQuestions.map(q => ({ ...q, type: 'mcq' })),
    ...session.questions.trueFalseQuestions.map(q => ({ ...q, type: 'tf' })),
    ...session.questions.fillInTheBlanksQuestions.map(q => ({ ...q, type: 'fitb' })),
    ...session.questions.shortAnswerQuestions.map(q => ({ ...q, type: 'sa' }))
  ];

  const totalSteps = allQuestions.length;
  const currentQuestion = allQuestions[currentIdx];
  const progress = ((currentIdx + 1) / totalSteps) * 100;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const evaluations: AnswerEvaluation[] = [];
      let totalScore = 0;

      for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        const studentAnswer = answers[i] || "";
        
        let evalResult;
        if (q.type === 'sa') {
          // Use AI for Short Answer Semantic Similarity
          evalResult = await semanticAnswerEvaluator({
            question: q.question as string,
            correctAnswer: (q as any).referenceAnswer,
            studentAnswer,
            context: session!.content
          });
        } else {
          // Simple string matching for others
          const isCorrect = studentAnswer.toLowerCase().trim() === (q as any).correctAnswer?.toString().toLowerCase().trim() || 
                           (q.type === 'tf' && studentAnswer === (q as any).isTrue?.toString());
          evalResult = {
            correctnessScore: isCorrect ? 100 : 0,
            explanationFeedback: isCorrect ? "Perfect! Your answer matches the expected content." : "Not quite. Check the reference answer.",
            suggestionsForImprovement: isCorrect ? "" : "Try to revisit the passage section specifically discussing this point."
          };
        }

        evaluations.push({
          questionId: i.toString(),
          questionText: (q as any).question || (q as any).sentenceWithBlank,
          studentAnswer,
          correctAnswer: (q as any).correctAnswer?.toString() || (q as any).referenceAnswer || (q as any).isTrue?.toString(),
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
        feedback: "Great job completing the reading assessment. Review your feedback below to improve further."
      };

      const updatedSession = { ...session!, results };
      store.updateSession(updatedSession);
      router.push(`/quiz/${session!.id}/results`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "An error occurred while evaluating your answers. Please try again.",
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

  const handlePrev = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const setAnswer = (val: string) => {
    setAnswers({ ...answers, [currentIdx]: val });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold truncate max-w-[200px]">{session.title}</h2>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Reading Comprehension</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-md mx-6">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              {currentIdx + 1} of {totalSteps}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>Exit</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left: Content Reference */}
        <Card className="h-[calc(100vh-160px)] overflow-hidden flex flex-col">
          <CardHeader className="border-b bg-accent/5 shrink-0">
            <CardTitle className="text-sm font-headline flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              Reference Passage
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
             <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap font-body">
               {session.content}
             </p>
          </CardContent>
        </Card>

        {/* Right: Question Interface */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1 shadow-md border-primary/20 flex flex-col">
            <CardHeader className="border-b pb-4">
               <div className="flex items-center gap-2 mb-2">
                 <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                   {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 
                    currentQuestion.type === 'sa' ? 'Short Answer' : 
                    currentQuestion.type === 'tf' ? 'True / False' : 'Fill in the Blank'}
                 </span>
               </div>
               <CardTitle className="text-xl font-headline leading-tight">
                 {(currentQuestion as any).question || (currentQuestion as any).sentenceWithBlank}
               </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 pt-8">
              {currentQuestion.type === 'mcq' && (
                <RadioGroup 
                  value={answers[currentIdx] || ""} 
                  onValueChange={setAnswer} 
                  className="space-y-3"
                >
                  {(currentQuestion as any).options.map((opt: string, i: number) => (
                    <div key={i} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${answers[currentIdx] === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-background hover:bg-muted'}`}>
                      <RadioGroupItem value={opt} id={`opt-${i}`} />
                      <Label htmlFor={`opt-${i}`} className="flex-1 text-base cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'tf' && (
                <RadioGroup 
                  value={answers[currentIdx] || ""} 
                  onValueChange={setAnswer} 
                  className="grid grid-cols-2 gap-4"
                >
                  {['true', 'false'].map((opt) => (
                    <div key={opt} className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all cursor-pointer ${answers[currentIdx] === opt ? 'border-primary bg-primary/5' : 'border-transparent bg-background hover:bg-muted'}`}>
                      <RadioGroupItem value={opt} id={`tf-${opt}`} className="sr-only" />
                      <Label htmlFor={`tf-${opt}`} className="text-lg font-bold capitalize cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQuestion.type === 'fitb' && (
                <div className="space-y-4 pt-10">
                  <Label className="text-sm font-semibold">Your Answer</Label>
                  <Input 
                    placeholder="Type the missing word or phrase..." 
                    className="h-14 text-lg border-2" 
                    value={answers[currentIdx] || ""} 
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>
              )}

              {currentQuestion.type === 'sa' && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">In your own words...</Label>
                  <Textarea 
                    placeholder="Write your explanation here..." 
                    className="min-h-[200px] text-lg leading-relaxed p-4 border-2" 
                    value={answers[currentIdx] || ""} 
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t p-6 flex justify-between bg-white">
              <Button 
                variant="ghost" 
                onClick={handlePrev} 
                disabled={currentIdx === 0 || submitting}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <Button 
                className="gap-2 px-8 shadow-lg transition-transform active:scale-95" 
                onClick={handleNext}
                disabled={submitting || !answers[currentIdx]}
              >
                {submitting ? (
                   <>
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Evaluating Answers...
                   </>
                ) : (
                  <>
                    {currentIdx === totalSteps - 1 ? 'Finish & See Results' : 'Next Question'}
                    {currentIdx === totalSteps - 1 ? <SendHorizontal className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}