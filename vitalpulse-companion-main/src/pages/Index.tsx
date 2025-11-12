import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Activity, MessageCircle, Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-health.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-health-gradient-soft">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={heroImage} 
            alt="Health and Wellness" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-6">
              <div className="bg-health-gradient p-4 rounded-3xl shadow-elevated">
                <Heart className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HealthMate
            </h1>
            <p className="text-xl md:text-2xl text-foreground mb-8">
              Your AI-powered health companion for symptom tracking, health insights, and personalized wellness guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="text-lg shadow-elevated"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={() => navigate("/auth")}
                    className="text-lg shadow-elevated"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="text-lg"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Health Tracking
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor and understand your health in one place
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Health Chat</h3>
              <p className="text-muted-foreground">
                Chat with our intelligent health assistant for personalized advice, symptom analysis, and wellness tips
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Symptom Tracking</h3>
              <p className="text-muted-foreground">
                Log your symptoms with severity levels and notes to track patterns and share with healthcare providers
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your health data is encrypted and secure. Only you have access to your personal health information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-health-gradient text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your Health Journey Today
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of users tracking their health and getting AI-powered insights
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/auth")}
              className="text-lg shadow-elevated"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-health-gradient p-2 rounded-lg">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">HealthMate</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            AI-powered health companion for better wellness
          </p>
          <p className="text-xs text-destructive font-semibold">
            ⚠️ Not a substitute for professional medical advice
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
