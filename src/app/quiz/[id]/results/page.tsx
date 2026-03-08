"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { QuizSession } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  LayoutDashboard, 
  Award,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Share2
} from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function QuizResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<QuizSession | null>(null);

  useEffect(() => {
    const s = store.getSession(id as string);
    if (s && s.results) setSession(s);
    else if (s) router.push(`/quiz/${id}`);
    else router.push('/dashboard');
  }, [id, router]);

  if (!session || !session.results) return null;

  const results = session.results;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <Button variant="ghost" className="gap-2" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Exit to Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <Share2 className="h-4 w-4" />
              Share Progress
            </Button>
          </div>
        </div>

        {/* Hero Score Card */}
        <Card className="mb-8 shadow-xl border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award className="h-48 w-48 text-primary" />
          </div>
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="relative h-48 w-48 flex items-center justify-center shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                 <circle
                   cx="50%"
                   cy="50%"
                   r="85"
                   stroke="currentColor"
                   strokeWidth="12"
                   fill="transparent"
                   className="text-muted"
                 />
                 <circle
                   cx="50%"
                   cy="50%"
                   r="85"
                   stroke="currentColor"
                   strokeWidth="12"
                   fill="transparent"
                   strokeDasharray={2 * Math.PI * 85}
                   strokeDashoffset={2 * Math.PI * 85 * (1 - results.score / 100)}
                   strokeLinecap="round"
                   className="text-primary transition-all duration-1000 ease-out"
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-headline font-bold">{results.score}%</span>
                 <span className="text-sm font-bold text-muted-foreground">OVERALL</span>
               </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-headline mb-4">Reading Mastery: {session.title}</h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {results.score >= 80 ? "Exceptional work! You've demonstrated deep comprehension of the text." : 
                 results.score >= 60 ? "Good progress. You caught the main ideas but missed some critical nuances." : 
                 "You're building your foundation. Re-reading the marked sections would be very beneficial."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                 <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-primary/10">
                   <span className="block text-xs text-muted-foreground font-bold uppercase tracking-widest">Grade Level</span>
                   <span className="text-lg font-bold">Grade 8 (Optimal)</span>
                 </div>
                 <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-primary/10">
                   <span className="block text-xs text-muted-foreground font-bold uppercase tracking-widest">Difficulty</span>
                   <span className="text-lg font-bold">Intermediate</span>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
           <div className="lg:col-span-2">
             <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
               <HelpCircle className="h-6 w-6 text-primary" />
               Question Review
             </h2>
             <Accordion type="single" collapsible className="space-y-4">
               {results.evaluations.map((evalItem, idx) => (
                 <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-xl bg-white px-4 overflow-hidden shadow-sm">
                   <AccordionTrigger className="hover:no-underline py-4">
                     <div className="flex items-center gap-4 text-left">
                        {evalItem.isCorrect ? 
                          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" /> : 
                          <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                        }
                        <span className="font-medium line-clamp-1">{evalItem.questionText}</span>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6">
                     <div className="grid gap-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-slate-50 border">
                            <span className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Your Answer</span>
                            <p className="text-sm italic">{evalItem.studentAnswer || "(No answer provided)"}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50 border-green-100">
                            <span className="block text-[10px] font-bold text-green-600 uppercase mb-1">Correct Answer</span>
                            <p className="text-sm font-medium">{evalItem.correctAnswer}</p>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex items-start gap-3">
                             <div className="p-1 rounded-full bg-blue-100 mt-0.5">
                               <Info className="h-4 w-4 text-blue-600" />
                             </div>
                             <div>
                               <p className="text-sm font-bold">AI Feedback</p>
                               <p className="text-sm text-muted-foreground leading-relaxed">{evalItem.feedback}</p>
                             </div>
                          </div>
                          {evalItem.suggestions && (
                            <div className="flex items-start gap-3">
                               <div className="p-1 rounded-full bg-orange-100 mt-0.5">
                                 <Lightbulb className="h-4 w-4 text-orange-600" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold">Suggested Improvement</p>
                                 <p className="text-sm text-muted-foreground leading-relaxed">{evalItem.suggestions}</p>
                               </div>
                            </div>
                          )}
                       </div>
                     </div>
                   </AccordionContent>
                 </AccordionItem>
               ))}
             </Accordion>
           </div>

           <div className="space-y-6">
             <Card className="shadow-md">
               <CardHeader className="pb-2">
                 <CardTitle className="text-lg font-headline">Recommended Next Steps</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-accent/5">
                    <BookOpen className="h-5 w-5 text-accent mt-0.5" />
                    <p className="text-sm">Read the section on <strong>Photosynthesis Mechanisms</strong> again.</p>
                  </div>
                  <div className="flex gap-3 items-start p-3 rounded-lg bg-accent/5">
                    <Award className="h-5 w-5 text-accent mt-0.5" />
                    <p className="text-sm">Difficulty increased! Your next quiz will be at <strong>Advanced Level</strong>.</p>
                  </div>
                  <Button className="w-full mt-2" asChild>
                    <Link href="/quiz/new">New Assessment</Link>
                  </Button>
               </CardContent>
             </Card>

             <Card className="shadow-md bg-accent text-accent-foreground">
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Parent/Teacher Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-90 leading-relaxed mb-4">
                    Alex showed a strong grasp of foundational concepts but struggled with inferential questions. 
                    Targeted practice on "Why" and "How" questions is recommended for the next session.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full" asChild>
                    <Link href="/dashboard">View Full Progress Report</Link>
                  </Button>
                </CardContent>
             </Card>
           </div>
        </div>
      </div>
    </div>
  );
}