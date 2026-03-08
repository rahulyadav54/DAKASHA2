import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, BookOpen, BarChart3, Users, CheckCircle2, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <span className="font-headline text-xl font-bold text-primary">SmartRead AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
          </nav>
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm mb-6 animate-bounce">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-semibold uppercase tracking-wider">AI-Powered Learning</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6 max-w-4xl mx-auto leading-tight">
              Personalized Reading Mastery with <span className="text-primary">SmartRead AI</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform any text or PDF into interactive comprehension quizzes. 
              Our AI evaluates answers semantically and adapts to your reading level.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
                <Link href="/quiz/new">Start Your First Quiz</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full" asChild>
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl mb-4">Powerful Features for Modern Learning</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Everything you need to boost reading comprehension skills in one intuitive platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BrainCircuit className="h-8 w-8 text-primary" />,
                  title: "AI Question Generation",
                  description: "Automatically create MCQs, short answers, and true/false questions from any uploaded text."
                },
                {
                  icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
                  title: "Semantic Evaluation",
                  description: "Our AI understands meaning, checking if your answer is correct even if you use your own words."
                },
                {
                  icon: <Zap className="h-8 w-8 text-primary" />,
                  title: "Adaptive Learning",
                  description: "Quizzes automatically get harder or easier based on your past performance."
                },
                {
                  icon: <BookOpen className="h-8 w-8 text-primary" />,
                  title: "Reading Level Detection",
                  description: "Analyze the complexity of texts to ensure they are age and grade appropriate."
                },
                {
                  icon: <BarChart3 className="h-8 w-8 text-primary" />,
                  title: "Detailed Analytics",
                  description: "Track progress for students, parents, and teachers with comprehensive visual dashboards."
                },
                {
                  icon: <Users className="h-8 w-8 text-primary" />,
                  title: "Multi-Role Support",
                  description: "Specific experiences designed for students, parents, teachers, and administrators."
                }
              ].map((feature, idx) => (
                <Card key={idx} className="border-none shadow-md hover:shadow-xl transition-shadow bg-background/50">
                  <CardContent className="pt-8 pb-8">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl mb-3 font-headline">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof / Call to Action */}
        <section className="py-24 bg-accent text-accent-foreground overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
             <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl mb-8 font-headline leading-tight">Empower the next generation of readers with AI.</h2>
              <p className="text-lg opacity-80 mb-10">Join thousands of students and educators who are transforming the way we learn from written content.</p>
              <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full" asChild>
                <Link href="/dashboard">Try SmartRead Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg font-bold">SmartRead AI</span>
          </div>
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} SmartRead AI Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}