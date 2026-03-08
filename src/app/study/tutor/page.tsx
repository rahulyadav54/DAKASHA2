
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AiTutorPlaceholder() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 flex flex-col items-center justify-center text-center">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <div className="max-w-md w-full">
        <div className="bg-primary/10 p-6 rounded-full inline-block mb-6">
          <Bot className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-headline mb-4">AI Tutor is coming soon!</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We're training your personalized AI reading assistant. Soon you'll be able to chat, ask questions about your passages, and get instant help with complex concepts.
        </p>
        <div className="flex gap-2 justify-center">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border shadow-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Under Development</span>
          </div>
        </div>
      </div>
    </div>
  );
}
