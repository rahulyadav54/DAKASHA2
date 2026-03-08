
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, LayoutDashboard, LogOut, Settings, User as UserIcon, ArrowLeft, Save, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser, useDoc, useAuth } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function SettingsPage() {
  const router = useRouter();
  const { auth, firestore } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const profileRefStr = useMemo(() => user ? `users/${user.uid}` : null, [user]);
  const { data: profile, loading: profileLoading } = useDoc(profileRefStr);

  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setRole(profile.role || "Student");
    }
  }, [profile]);

  useEffect(() => {
    if (!userLoading && !user) router.push('/login');
  }, [user, userLoading, router]);

  const handleSave = async () => {
    if (!user || !firestore) return;
    setSaving(true);
    try {
      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        role,
        email: user.email,
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`
      }, { merge: true });
      toast({ title: "Profile Updated" });
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  if (userLoading || profileLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const NavContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-10 px-3">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="font-headline font-bold text-lg text-primary">SmartRead AI</span>
      </div>
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50">
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </nav>
      <Button variant="ghost" className="w-full justify-start gap-3 mt-6 text-muted-foreground" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
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

      <main className="flex-1 p-4 md:p-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 flex items-center gap-4">
             <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link></Button>
             <h1 className="text-2xl md:text-3xl font-headline">Account Settings</h1>
          </header>

          <Card className="shadow-md border-none md:border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <UserIcon className="h-5 w-5" /> Profile Settings
              </CardTitle>
              <CardDescription>Manage your public profile and educational preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Educational Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <Input 
                  value={user.email || ""} 
                  readOnly 
                  disabled
                  className="h-12 bg-muted/30"
                />
                <p className="text-[10px] text-muted-foreground italic">Email changes are disabled for this account type.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 px-6 py-4 rounded-b-lg">
              <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto h-11 px-8 rounded-xl">
                {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
