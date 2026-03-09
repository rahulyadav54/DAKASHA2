
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2, ArrowLeft, AlertCircle, ExternalLink, ShieldAlert, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const { auth } = useAuth();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [apiError, setApiError] = useState(false);
  const [blockedError, setBlockedError] = useState(false);
  const [rawError, setRawError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !userLoading) {
      router.push('/dashboard');
    }
  }, [user, userLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setApiError(false);
    setBlockedError(false);
    setRawError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMsg = error.message.toLowerCase();
      setRawError(error.message);
      
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
    if (!auth) return;
    setLoading(true);
    setApiError(false);
    setBlockedError(false);
    setRawError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Login Error:", error);
      setRawError(error.message);
      const errorMsg = error.message.toLowerCase();
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
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg">
              <BrainCircuit className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline">SmartRead AI Login</CardTitle>
          <CardDescription>Enter your details to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">API Not Enabled</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <p>The Identity Toolkit API is required. If you just enabled it, please wait 2 minutes.</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-destructive font-bold underline flex items-center gap-1" asChild>
                  <a href="https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=ramiyaa-ff272" target="_blank" rel="noopener noreferrer">
                    Enable API Now <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {blockedError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="font-bold">Method Blocked</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <p>Auth methods might still be propagating. <strong>Try refreshing the page or using an Incognito window.</strong></p>
                <Button variant="link" size="sm" className="h-auto p-0 text-destructive font-bold underline flex items-center gap-1" asChild>
                  <a href="https://console.firebase.google.com/project/ramiyaa-ff272/authentication/providers" target="_blank" rel="noopener noreferrer">
                    Verify Providers in Console <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {rawError && !apiError && !blockedError && (
             <Alert className="bg-muted border-muted-foreground/20">
               <Info className="h-4 w-4" />
               <AlertTitle className="text-xs font-bold">System Message</AlertTitle>
               <AlertDescription className="text-[10px] break-all opacity-70">
                 {rawError}
               </AlertDescription>
             </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@example.com" 
                required 
                className="h-12" 
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
                className="h-12" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg rounded-xl mt-2" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-12 rounded-xl flex items-center gap-2" onClick={handleGoogleLogin} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <Button variant="ghost" className="w-full h-12 rounded-xl border-dashed border-2 hover:bg-slate-50" asChild>
            <Link href="/dashboard">
              Skip to Dashboard (Guest)
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 border-t pt-6 bg-slate-50/50 rounded-b-lg text-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              Sign Up
            </Link>
          </div>
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
