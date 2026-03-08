"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Calendar, LayoutDashboard, LogOut, Settings, Award } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = store.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
    }
  }, [router]);

  if (!user) return null;

  const sessions = store.getSessions().filter(s => !!s.results);
  const recentSessions = [...sessions].reverse().slice(0, 3);
  const avgScore = sessions.length ? Math.round(sessions.reduce((acc, s) => acc + (s.results?.score || 0), 0) / sessions.length) : 0;

  const chartData = sessions.map(s => ({
    name: new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    score: s.results?.score || 0
  }));

  const handleLogout = () => {
    store.logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
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
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
            <Calendar className="h-4 w-4" />
            History
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </Link>
        </nav>

        <div className="pt-6 border-t mt-6 space-y-1">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-headline mb-1">Welcome back, {user.name}!</h1>
              <p className="text-muted-foreground">You are currently set as a <strong>{user.role}</strong>.</p>
            </div>
            <Button size="lg" className="rounded-full gap-2" asChild>
              <Link href="/quiz/new">
                <BookOpen className="h-4 w-4" />
                Start New Reading
              </Link>
            </Button>
          </header>

          {/* Quick Stats */}
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
                    <h3 className="text-2xl font-bold">{sessions.length}</h3>
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
                    <p className="text-sm font-medium text-muted-foreground">Reading Level</p>
                    <h3 className="text-2xl font-bold">Grade 8</h3>
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
                    <p className="text-sm font-medium text-muted-foreground">Streak</p>
                    <h3 className="text-2xl font-bold">4 Days</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline">Score History</CardTitle>
                <CardDescription>Your performance over time.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-4">
                {sessions.length > 0 ? (
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

            {/* Recent Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Recent Results</CardTitle>
                <CardDescription>Latest quiz sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => (
                    <div key={session.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate max-w-[150px]">{session.title}</p>
                        <span className="text-xs font-bold text-primary">{session.results?.score}%</span>
                      </div>
                      <Progress value={session.results?.score} className="h-2" />
                      <p className="text-[10px] text-muted-foreground">{new Date(session.timestamp).toLocaleDateString()}</p>
                    </div>
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
