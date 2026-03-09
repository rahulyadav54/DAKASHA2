
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader2, ArrowLeft, AlertCircle, ExternalLink, ShieldAlert } from "lucide-react";
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
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("identity-toolkit-api")) {
        setApiError(true);
      } else if (errorMsg.includes("blocked") || errorMsg.includes("operation-not-allowed")) {
        setBlockedError(true);
      }
      toast({
        title: "Login failed",
        description: error.message || "Check your credentials.",
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
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("identity-toolkit-api")) {
        setApiError(true);
      } else if (errorMsg.includes("blocked")) {
        setBlockedError(true);
      }
      toast({
        title: "Google login failed",
        description: error.message,
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
          <CardTitle className="text-2xl font-headline">Welcome back</CardTitle>
          <CardDescription>Enter your details to access your tutor dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">API Required</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <p>You must enable the <strong>Identity Toolkit API</strong> in your Google Cloud Console for login to work.</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-destructive font-bold underline flex items-center gap-1" asChild>
                  <a href="https://console.developers.google.com/apis/api/identitytoolkit.googleapis.com/overview?project=ramiyaa-ff272" target="_blank" rel="noopener noreferrer">
                    Click here to Enable API <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {blockedError && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle className="font-bold">Provider Blocked</AlertTitle>
              <AlertDescription className="text-xs space-y-2">
                <p>The <strong>Email/Password</strong> sign-in method is disabled in your Firebase settings.</p>
                <Button variant="link" size="sm" className="h-auto p-0 text-destructive font-bold underline flex items-center gap-1" asChild>
                  <a href="https://console.firebase.google.com/project/ramiyaa-ff272/authentication/providers" target="_blank" rel="noopener noreferrer">
                    Click here to Enable Providers <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <p className="font-bold mt-2">Steps: Add Provider > Email/Password > Enable > Save.</p>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="alex@example.com" 
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
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full h-12 rounded-xl" onClick={handleGoogleLogin} disabled={loading}>
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
