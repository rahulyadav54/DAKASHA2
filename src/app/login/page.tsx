"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2, ArrowLeft, AlertCircle, ExternalLink, ShieldAlert, Info, Key, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { auth, firestore } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [apiError, setApiError] = useState(false);
  const [blockedError, setBlockedError] = useState(false);

  useEffect(() => {
    if (user && !userLoading) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleDemoMode = () => {
    const mockUser = {
      uid: 'demo-user-' + Math.random().toString(36).substr(2, 5),
      displayName: 'Demo Learner',
      email: 'demo@smartread.ai',
      photoURL: 'https://picsum.photos/seed/demo/100/100'
    };
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    toast({
      title: "Demo Mode Active",
      description: "You are now exploring SmartRead AI in guest mode.",
    });
    router.push('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setApiError(false);
    setBlockedError(false);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('demo_user'); // Clear demo if real login works
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMsg = (error.message || "").toLowerCase();
      
      if (errorMsg.includes("identity-toolkit-api")) {
        setApiError(true);
      } else if (errorMsg.includes("blocked") || errorMsg.includes("operation-not-allowed")) {
        setBlockedError(true);
      }
      
      toast({
        title: "Login failed",
        description: error.code || "Check your credentials.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return;
    setLoading(true);
    setApiError(false);
    setBlockedError(false);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      const userDocRef = doc(firestore, 'users', loggedUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: loggedUser.displayName || "New Learner",
          email: loggedUser.email,
          role: "Student",
          avatar: loggedUser.photoURL || `https://picsum.photos/seed/${loggedUser.uid}/100/100`,
          createdAt: Date.now()
        });
      }

      localStorage.removeItem('demo_user');
      toast({
        title: "Welcome!",
        description: `Signed in as ${loggedUser.displayName || loggedUser.email}`,
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Login Error:", error);
      const errorMsg = (error.message || "").toLowerCase();
      if (errorMsg.includes("identity-toolkit-api")) {
        setApiError(true);
      } else if (errorMsg.includes("blocked") || errorMsg.includes("operation-not-allowed")) {
        setBlockedError(true);
      }
      toast({
        title: "Google login failed",
        description: error.code || "Authentication failed.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10 overflow-hidden">
        <CardHeader className="text-center space-y-1 pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg animate-in zoom-in duration-500">
              <BrainCircuit className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline">SmartRead AI</CardTitle>
          <CardDescription>Master your reading with AI assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 border-2 hover:bg-slate-50 transition-all font-bold shadow-sm group" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-medium">Or use email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com" 
                required 
                className="h-12 rounded-xl" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                className="h-12 rounded-xl" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-2 font-bold shadow-md" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          {(apiError || blockedError) && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive mt-6 rounded-2xl">
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle className="font-bold">Configuration Required</AlertTitle>
              <AlertDescription className="text-xs space-y-4 pt-2">
                <p>Firebase is blocking login for: <strong className="underline">ramiyaa-ff272</strong></p>
                
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-sm font-bold">
                     <AlertCircle className="h-4 w-4" /> Step 1: Enable the Identity Toolkit API
                   </div>
                   <Button variant="outline" size="sm" className="w-full bg-white text-destructive border-destructive/30" asChild>
                     <a href="https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=ramiyaa-ff272" target="_blank" rel="noopener noreferrer">
                       Enable Toolkit API <ExternalLink className="ml-2 h-3 w-3" />
                     </a>
                   </Button>

                   <div className="flex items-center gap-2 text-sm font-bold pt-2">
                     <Key className="h-4 w-4" /> Step 2: Remove API Key Restrictions
                   </div>
                   <Button variant="outline" size="sm" className="w-full bg-white text-destructive border-destructive/30" asChild>
                     <a href="https://console.cloud.google.com/apis/credentials?project=ramiyaa-ff272" target="_blank" rel="noopener noreferrer">
                       Check Key Restrictions <ExternalLink className="ml-2 h-3 w-3" />
                     </a>
                   </Button>
                   <p className="text-[10px] italic opacity-80">Find the key ending in <strong>HrFU</strong> and set "API restrictions" to "None".</p>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="pt-2">
            <Button variant="secondary" className="w-full h-14 rounded-2xl border-2 border-primary/10 hover:bg-primary/5 text-primary font-bold shadow-sm gap-2" onClick={handleDemoMode}>
              <Sparkles className="h-4 w-4" /> Demo Mode (Bypass Login)
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2 italic">Use Demo Mode if your Firebase API is currently blocked.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50/50 text-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Sign Up
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2 rounded-full">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
