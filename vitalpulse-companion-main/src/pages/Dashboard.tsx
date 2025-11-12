import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, MessageCircle, Activity, FileText, TrendingUp, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SymptomLogger from "@/components/SymptomLogger";
import HealthChatbot from "@/components/HealthChatbot";
import SymptomHistory from "@/components/SymptomHistory";
import HealthScore from "@/components/HealthScore";
import BadgesDisplay from "@/components/BadgesDisplay";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-health-gradient-soft">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-health-gradient-soft">
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-health-gradient p-2 rounded-xl">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HealthMate</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="symptoms">
              <Activity className="mr-2 h-4 w-4" />
              Log
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="score">
              <TrendingUp className="mr-2 h-4 w-4" />
              Score
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="mr-2 h-4 w-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <HealthChatbot userId={user?.id!} initialMessage={chatMessage} />
          </TabsContent>

          <TabsContent value="symptoms">
            <SymptomLogger userId={user?.id!} />
          </TabsContent>

          <TabsContent value="history">
            <SymptomHistory 
              userId={user?.id!} 
              onAskChatbot={(message) => {
                setChatMessage(message);
                setActiveTab("chat");
              }}
            />
          </TabsContent>

          <TabsContent value="score">
            <HealthScore userId={user?.id!} />
          </TabsContent>

          <TabsContent value="badges">
            <BadgesDisplay userId={user?.id!} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-12 py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p className="font-semibold text-destructive mb-2">⚠️ Medical Disclaimer</p>
        <p>
          HealthMate is an AI assistant for informational purposes only. It does not provide medical
          diagnosis or replace professional medical advice. Always consult with qualified healthcare
          professionals for medical concerns.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
