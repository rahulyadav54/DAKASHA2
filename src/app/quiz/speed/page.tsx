
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Zap, ArrowLeft, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SpeedQuizPage() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center justify-center text-center">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <div className="max-w-md w-full">
        <div className="bg-orange-100 p-6 rounded-full inline-block mb-6">
          <Timer className="h-16 w-16 text-orange-600" />
        </div>
        <h1 className="text-4xl font-headline mb-4">Speed Quiz Mode</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Challenge yourself with timed reading assessments! This feature is being tuned for optimal performance.
        </p>
        <div className="space-y-4">
          <Card className="bg-white border-primary/20 shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4 text-left">
              <Zap className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-bold">Standard Quiz</p>
                <p className="text-xs text-muted-foreground">In the meantime, try a standard AI-generated quiz.</p>
              </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full rounded-xl" asChild>
            <Link href="/quiz/new">Take Standard Quiz</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
