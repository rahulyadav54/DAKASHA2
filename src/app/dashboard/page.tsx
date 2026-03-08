
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Calendar, LayoutDashboard, LogOut, Settings, Award, Loader2, Menu, X, Plus } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser, useAuth, useCollection, useDoc } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function DashboardPage() {
  const router = useRouter();
  const { auth, firestore } = useAuth();
  const { user, loading: userLoading } = useUser();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user) return null;
    return `users/${user.uid}`;
  }, [user]);

  const { data: profile } = useDoc(userProfileRef);

  const sessionsCollection = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'));
  }, [firestore, user]);

  const { data: sessions, loading: sessionsLoading } = useCollection(sessionsCollection);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedSessions = sessions?.filter(s => !!s.results) || [];
  const recentSessions = completedSessions.slice(0, 3);
  const avgScore = completedSessions.length 
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.results?.score || 0), 0) / completedSessions.length) 
    : 0;

  const chartData = [...completedSessions].reverse().map(s => ({
    name: new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: s.results?.score || 0
  }));

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const NavContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-10 px-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="font-headline font-bold text-lg text-primary">SmartRead AI</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link href="/quiz/new" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
          <BookOpen className="h-4 w-4" />
          New Quiz
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>

      <div className="pt-6 border-t mt-6 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <aside className="w-64 border-r bg-white p-6 flex flex-col shrink-0 sticky top-0 h-screen">
          {NavContent}
        </aside>
      )}

      {/* Header - Mobile */}
      {isMobile && (
        <header className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-headline font-bold text-sm text-primary">SmartRead AI</span>
          </div>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              {NavContent}
            </SheetContent>
          </Sheet>
        </header>
      )}

      <main className="flex-1 p-4 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-headline mb-1">Welcome back, {profile?.name || user.displayName || 'Learner'}!</h1>
              <p className="text-sm md:text-base text-muted-foreground">You are currently set as a <strong>{profile?.role || 'Student'}</strong>.</p>
            </div>
            <Button size="lg" className="rounded-full gap-2 w-full md:w-auto" asChild>
              <Link href="/quiz/new">
                <Plus className="h-4 w-4" />
                Start New Reading
              </Link>
            </Button>
          </header>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            <Card className="shadow-sm">
              <CardContent className="pt-4 md:pt-6 p-4">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                  <div className="p-2 md:p-3 rounded-full bg-blue-100 text-blue-600">
                    <Award className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Avg. Score</p>
                    <h3 className="text-lg md:text-2xl font-bold">{avgScore}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-4 md:pt-6 p-4">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                  <div className="p-2 md:p-3 rounded-full bg-green-100 text-green-600">
                    <TrendingUp className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Quizzes</p>
                    <h3 className="text-lg md:text-2xl font-bold">{completedSessions.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm hidden md:block">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <h3 className="text-2xl font-bold">{profile?.role || 'Student'}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-4 md:pt-6 p-4">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                  <div className="p-2 md:p-3 rounded-full bg-orange-100 text-orange-600">
                    <Calendar className="h-4 w-4 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-medium text-muted-foreground">Last Quiz</p>
                    <h3 className="text-lg md:text-2xl font-bold">
                      {completedSessions[0] ? new Date(completedSessions[0].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="lg:col-span-2 shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-lg md:text-xl">Score History</CardTitle>
                <CardDescription>Your performance over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] md:h-[300px] pt-4">
                {sessionsLoading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
                ) : completedSessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} tickMargin={10} />
                      <YAxis domain={[0, 100]} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Take your first quiz to see analytics!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline text-lg md:text-xl">Recent Results</CardTitle>
                <CardDescription>Latest quiz sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <Link key={session.id} href={`/quiz/${session.id}/results`} className="block group">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate max-w-[150px] group-hover:text-primary transition-colors">{session.title}</p>
                          <span className="text-xs font-bold text-primary">{session.results?.score}%</span>
                        </div>
                        <Progress value={session.results?.score} className="h-1.5 md:h-2" />
                        <p className="text-[10px] text-muted-foreground">{new Date(session.timestamp).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-10">No recent quizzes found.</p>
                )}
                <Button variant="outline" className="w-full text-xs" asChild>
                  <Link href="/dashboard">View All History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
