import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, FileText, ClipboardCheck } from 'lucide-react';
import fwcLogo from '@/assets/fwc-logo.png';

const features = [
  { icon: Users, title: 'Member Management', description: 'Register and manage worship team members by voice section' },
  { icon: ClipboardCheck, title: 'Attendance Tracking', description: 'Take attendance quickly with one-tap marking' },
  { icon: Calendar, title: 'Meeting Schedule', description: 'View upcoming meetings and past events' },
  { icon: FileText, title: 'Meeting Minutes', description: 'Access published meeting minutes anytime' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="container relative py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-card shadow-xl animate-fade-in">
              <img src={fwcLogo} alt="FWC Logo" className="w-full h-full object-contain p-2" />
            </div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                FWC Worship Team
                <span className="block text-primary">Platform</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Your worship team hub. Track attendance, view meetings, prepare songs, and stay connected.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="touch-target text-lg px-8">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="touch-target text-lg px-8">
                <Link to="/auth?mode=signup">Join the Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-card hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FWC Worship Team. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
