"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { User, Role } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Shield, 
  Bell, 
  ArrowLeft,
  Save,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Student");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = store.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
    } else {
      setUser(currentUser);
      setName(currentUser.name);
      setRole(currentUser.role);
    }
  }, [router]);

  if (!user) return null;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      store.updateUser({ name, role });
      setUser(store.getCurrentUser());
      setSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your settings have been successfully saved.",
      });
    }, 800);
  };

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
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/quiz/new" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors">
            <BookOpen className="h-4 w-4" />
            New Quiz
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="pt-6 border-t mt-6">
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8 flex items-center gap-4">
             <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
             </Button>
             <div>
               <h1 className="text-3xl font-headline">Account Settings</h1>
               <p className="text-muted-foreground">Manage your profile and application preferences.</p>
             </div>
          </header>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your public profile details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Educational Role</Label>
                    <Select value={role} onValueChange={(val: Role) => setRole(val)}>
                      <SelectTrigger>
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
              </CardContent>
              <CardFooter className="border-t bg-muted/20 px-6 py-4">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <LayoutDashboard className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Manage your password and account security settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Choose how you want to be notified about quiz results.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-bold">Email Results</p>
                      <p className="text-xs text-muted-foreground">Receive a summary of quiz results via email.</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
