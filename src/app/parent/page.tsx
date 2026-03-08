
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Award, 
  Calendar,
  ChevronRight,
  Loader2,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useUser, useDoc, useCollection, useAuth } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ParentPortalPage() {
  const { user } = useUser();
  const { firestore } = useAuth();

  const profileRef = useMemo(() => user ? `users/${user.uid}` : null, [user]);
  const { data: profile } = useDoc(profileRef);

  const sessionsRef = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'sessions'), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: sessions, loading } = useCollection<any>(sessionsRef);

  const stats = useMemo(() => {
    if (!sessions) return { avg: 0, count: 0, best: 0 };
    const completed = sessions.filter(s => !!s.results);
    const count = completed.length;
    const avg = count ? Math.round(completed.reduce((acc, s) => acc + s.results.score, 0) / count) : 0;
    const best = count ? Math.max(...completed.map(s => s.results.score)) : 0;
    return { avg, count, best };
  }, [sessions]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-headline flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Parent Portal
              </h1>
              <p className="text-sm text-muted-foreground">Monitoring performance for {profile?.name || 'Student'}</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full shadow-sm">Invite Parent/Teacher</Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Average Mastery</p>
                <h3 className="text-2xl font-bold">{stats.avg}%</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 text-green-600"><BookOpen className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Readings Finished</p>
                <h3 className="text-2xl font-bold">{stats.count}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600"><Award className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Best Performance</p>
                <h3 className="text-2xl font-bold">{stats.best}%</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="shadow-md">
             <CardHeader>
               <CardTitle className="text-lg font-headline">Weekly Progress</CardTitle>
               <CardDescription>Reading comprehension growth over time.</CardDescription>
             </CardHeader>
             <CardContent className="h-[300px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions?.filter(s => !!s.results).reverse().map(s => ({ 
                    name: new Date(s.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
                    score: s.results.score 
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </CardContent>
           </Card>

           <Card className="shadow-md">
             <CardHeader>
               <CardTitle className="text-lg font-headline">Detailed Activity Log</CardTitle>
               <CardDescription>Recent quiz sessions and results.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               {sessions?.slice(0, 5).map((session) => (
                 <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-accent/5 group hover:bg-accent/10 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{session.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{new Date(session.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="text-right">
                         <span className="text-xs font-bold text-primary">{session.results?.score || 0}%</span>
                         <Progress value={session.results?.score || 0} className="h-1 w-16" />
                       </div>
                       <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                 </div>
               ))}
               <Button variant="ghost" className="w-full text-xs">View Full Report</Button>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
