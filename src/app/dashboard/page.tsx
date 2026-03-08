
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Calendar, LayoutDashboard, LogOut, Settings, Award, Loader2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser, useAuth, useCollection, useDoc } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function DashboardPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const { user, loading: userLoading } = useUser();

  const userProfileRef = useMemo(() => {
    if (!user) return null;
    return `users/${user.uid}`;
  }, [user]);

  const { data: profile } = useDoc(userProfileRef);

  const sessionsQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(auth?.app.options.databaseURL ? auth?.app.options.databaseURL as any : 'unused' as any, 'users', user.uid, 'sessions'),
      orderBy('timestamp', 'desc')
    );
  }, [user, auth]);

  // Fallback for query if the above memo is tricky with direct collection calls
  // Better use the standard Firestore instance
  const { firestore } = useAuth();
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

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-10">
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
      </aside>

      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-headline mb-1">Welcome back, {profile?.name || user.displayName || 'Learner'}!</h1>
              <p className="text-muted-foreground">You are currently set as a <strong>{profile?.role || 'Student'}</strong>.</p>
            </div>
            <Button size="lg" className="rounded-full gap-2" asChild>
              <Link href="/quiz/new">
                <BookOpen className="h-4 w-4" />
                Start New Reading
              </Link>
            </Button>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                    <h3 className="text-2xl font-bold">{avgScore}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quizzes Taken</p>
                    <h3 className="text-2xl font-bold">{completedSessions.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Quiz</p>
                    <h3 className="text-2xl font-bold">
                      {completedSessions[0] ? new Date(completedSessions[0].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'N/A'}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline">Score History</CardTitle>
                <CardDescription>Your performance over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                {sessionsLoading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>
                ) : completedSessions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#2680D9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Take your first quiz to see analytics!
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Recent Results</CardTitle>
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
                        <Progress value={session.results?.score} className="h-2" />
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
