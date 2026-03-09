"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  ArrowLeft, 
  Save, 
  Loader2, 
  Menu,
  PencilLine,
  Timer,
  Library,
  Bot,
  BookOpenText,
  Users,
  Trophy,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser, useDoc, useAuth } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { auth, firestore } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const profileRefStr = useMemo(() => (!user || user.isGuest) ? null : `users/${user.uid}`, [user]);
  const { data: profile, loading: profileLoading } = useDoc(profileRefStr);

  const [name, setName] = useState("");
  const [role, setRole] = useState("Student");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setRole(profile.role || "Student");
    } else if (user?.isGuest) {
      setName(user.displayName || "Demo Learner");
      setRole("Student");
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (user?.isGuest) {
      toast({ title: "Demo Mode", description: "Profile changes are local-only in demo mode." });
      return;
    }
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
    if (user?.isGuest) {
      localStorage.removeItem('demo_user');
      router.push('/');
      return;
    }
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  };

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const active = pathname === href;
    return (
      <Link 
        href={href} 
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200 group mb-2 bg-white",
          active 
            ? "border-primary bg-primary/5 text-primary shadow-sm" 
            : "border-transparent text-muted-foreground hover:bg-accent/5 hover:text-foreground"
        )}
      >
        <div className={cn(
          "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0",
          active ? "border-primary bg-primary" : "border-muted group-hover:border-primary/50"
        )}>
          {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
        </div>
        <Icon className="h-4 w-4" />
        <span className="font-medium text-sm">{label}</span>
      </Link>
    );
  };

  const NavContent = (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-8 px-3 pt-4">
        <div className="bg-primary p-2 rounded-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <span className="font-headline font-bold text-lg text-primary">SmartRead AI</span>
      </div>
      
      <nav className="flex-1 px-1">
        <NavItem href="/quiz/new" icon={PencilLine} label="Take Quiz" />
        <NavItem href="/quiz/speed" icon={Timer} label="Speed Quiz" />
        <NavItem href="/study/flashcards" icon={Library} label="Flashcards" />
        <NavItem href="/study/tutor" icon={Bot} label="AI Tutor" />
        <NavItem href="/study/guide" icon={BookOpenText} label="Study Guide" />
        <NavItem href="/parent" icon={Users} label="Parent Portal" />
        <NavItem href="/achievements" icon={Trophy} label="Achievements" />
        <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        
        <div className="mt-4 pt-4 border-t px-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-wider">Account</p>
          <Link href="/settings" className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === '/settings' ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
          )}>
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </nav>

      <div className="pt-6 border-t mt-6 pb-6 px-1">
        <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );

  if (userLoading || (profileLoading && !user?.isGuest)) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {!isMobile && (
        <aside className="w-64 border-r bg-white p-4 flex flex-col shrink-0 sticky top-0 h-screen">
          {NavContent}
        </aside>
      )}

      {isMobile && (
        <header className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="font-headline font-bold text-sm text-primary">SmartRead AI</span>
          </div>
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <SheetHeader className="sr-only">
                <SheetTitle>Settings Navigation</SheetTitle>
                <SheetDescription>Access your profile settings and features</SheetDescription>
              </SheetHeader>
              {NavContent}
            </SheetContent>
          </Sheet>
        </header>
      )}

      <main className="flex-1 p-4 md:p-10">
        <div className="max-w-3xl mx-auto">
          {user?.isGuest && (
             <Alert variant="destructive" className="mb-8 border-primary bg-primary/5 text-primary">
               <ShieldAlert className="h-4 w-4" />
               <AlertTitle className="font-bold">Guest Account</AlertTitle>
               <AlertDescription>
                 You are logged in via Demo Mode. Changes here will not be synced to the cloud.
               </AlertDescription>
             </Alert>
          )}

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
                  value={user?.email || "demo@smartread.ai"} 
                  readOnly 
                  disabled
                  className="h-12 bg-muted/30"
                />
                <p className="text-[10px] text-muted-foreground italic">Email changes are disabled.</p>
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
