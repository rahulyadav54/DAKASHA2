
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Flame, 
  Book, 
  Search,
  CheckCircle2,
  Lock
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useCollection, useUser, useAuth } from "@/firebase";
import { collection, query } from "firebase/firestore";

export default function AchievementsPage() {
  const { user } = useUser();
  const { firestore } = useAuth();

  const achievementsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'achievements'));
  }, [user, firestore]);

  const { data: unlocked } = useCollection<any>(achievementsRef);

  const badgeTemplates = [
    { id: 'first_quiz', title: 'First Steps', description: 'Complete your first reading assessment.', icon: <Book className="h-8 w-8" />, color: 'bg-blue-500' },
    { id: 'perfect_score', title: 'Perfect 100', description: 'Score 100% on any quiz.', icon: <Star className="h-8 w-8" />, color: 'bg-yellow-500' },
    { id: 'five_quizzes', title: 'Knowledge Seeker', description: 'Complete 5 reading sessions.', icon: <Zap className="h-8 w-8" />, color: 'bg-purple-500' },
    { id: 'speed_demon', title: 'Quick Thinker', description: 'Finish a speed quiz in record time.', icon: <Flame className="h-8 w-8" />, color: 'bg-orange-500' },
    { id: 'deep_diver', title: 'Deep Diver', description: 'Submit an answer with high semantic accuracy.', icon: <Search className="h-8 w-8" />, color: 'bg-cyan-500' },
    { id: 'consistent', title: 'Consistent Learner', description: 'Complete a quiz 3 days in a row.', icon: <Target className="h-8 w-8" />, color: 'bg-green-500' },
  ];

  const unlockedIds = unlocked?.map(a => a.id) || [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-headline flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Achievements
            </h1>
            <p className="text-muted-foreground">Track your progress and unlock educational milestones.</p>
          </div>
        </header>

        <Card className="mb-12 bg-primary text-primary-foreground shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="h-48 w-48" />
          </div>
          <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="text-center md:text-left">
               <h2 className="text-2xl font-headline mb-4">You've unlocked {unlockedIds.length} of {badgeTemplates.length} Badges</h2>
               <p className="text-lg opacity-80 mb-6">Every quiz you take brings you closer to mastering reading comprehension.</p>
               <Progress value={(unlockedIds.length / badgeTemplates.length) * 100} className="h-3 bg-white/20" />
            </div>
            <div className="shrink-0 bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20">
               <div className="flex gap-2">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                     {i < unlockedIds.length ? <Star className="h-5 w-5 text-yellow-300" /> : <Lock className="h-5 w-5 opacity-30" />}
                   </div>
                 ))}
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badgeTemplates.map((badge) => {
            const isUnlocked = unlockedIds.includes(badge.id);
            return (
              <Card key={badge.id} className={`shadow-md transition-all ${isUnlocked ? 'border-primary/50' : 'opacity-60 grayscale'}`}>
                <CardContent className="pt-8 flex flex-col items-center text-center">
                  <div className={`p-5 rounded-full text-white mb-6 shadow-lg ${badge.color}`}>
                    {badge.icon}
                  </div>
                  <h3 className="text-lg font-headline mb-2">{badge.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">{badge.description}</p>
                  
                  {isUnlocked ? (
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" /> Unlocked
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs bg-muted px-3 py-1 rounded-full">
                      <Lock className="h-3 w-3" /> Locked
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
