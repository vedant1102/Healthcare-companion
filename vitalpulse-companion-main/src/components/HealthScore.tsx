import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface HealthScore {
  score: number;
  factors: {
    recentSeverity: number;
    trend: string;
    recoveryRate: number;
  };
  created_at: string;
}

interface HealthScoreProps {
  userId: string;
}

const HealthScore = ({ userId }: HealthScoreProps) => {
  const [currentScore, setCurrentScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    calculateHealthScore();
  }, [userId]);

  const calculateHealthScore = async () => {
    try {
      // Get recent symptoms (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentLogs, error } = await supabase
        .from("user_symptoms")
        .select("severity, created_at")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!recentLogs || recentLogs.length === 0) {
        setCurrentScore({
          score: 85,
          factors: {
            recentSeverity: 0,
            trend: "stable",
            recoveryRate: 100,
          },
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      // Calculate average severity
      const avgSeverity = recentLogs.reduce((sum, log) => sum + (log.severity || 0), 0) / recentLogs.length;

      // Calculate trend (comparing first half vs second half)
      const midpoint = Math.floor(recentLogs.length / 2);
      const firstHalfAvg = recentLogs.slice(0, midpoint).reduce((sum, log) => sum + (log.severity || 0), 0) / midpoint;
      const secondHalfAvg = recentLogs.slice(midpoint).reduce((sum, log) => sum + (log.severity || 0), 0) / (recentLogs.length - midpoint);
      
      let trend = "stable";
      if (secondHalfAvg < firstHalfAvg - 1) trend = "improving";
      else if (secondHalfAvg > firstHalfAvg + 1) trend = "worsening";

      // Calculate recovery rate (lower severity = better recovery)
      const recoveryRate = Math.max(0, 100 - (avgSeverity * 10));

      // Calculate final score (0-100)
      let score = 100;
      score -= avgSeverity * 5; // Penalize for high severity
      if (trend === "improving") score += 10;
      else if (trend === "worsening") score -= 15;
      score = Math.max(0, Math.min(100, Math.round(score)));

      const scoreData = {
        score,
        factors: {
          recentSeverity: Math.round(avgSeverity * 10) / 10,
          trend,
          recoveryRate: Math.round(recoveryRate),
        },
        created_at: new Date().toISOString(),
      };

      setCurrentScore(scoreData);

      // Save to database
      await supabase.from("health_scores").insert({
        user_id: userId,
        score: scoreData.score,
        factors: scoreData.factors,
      });
    } catch (error: any) {
      console.error("Error calculating health score:", error);
      toast({
        title: "Error",
        description: "Failed to calculate health score",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentScore) {
    return (
      <Card className="shadow-elevated">
        <CardContent className="flex items-center justify-center py-12">
          <Activity className="h-8 w-8 animate-pulse text-primary" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (currentScore.factors.trend === "improving") return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (currentScore.factors.trend === "worsening") return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-yellow-500" />;
  };

  const getScoreColor = () => {
    if (currentScore.score >= 80) return "text-green-600";
    if (currentScore.score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Health Score
        </CardTitle>
        <CardDescription>AI-powered health assessment based on your symptom logs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor()}`}>{currentScore.score}</div>
          <p className="text-sm text-muted-foreground mt-2">out of 100</p>
        </div>

        <Progress value={currentScore.score} className="h-3" />

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Trend</p>
            <div className="flex items-center justify-center gap-1">
              {getTrendIcon()}
              <span className="text-sm font-medium capitalize">{currentScore.factors.trend}</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Avg Severity</p>
            <p className="text-sm font-medium">{currentScore.factors.recentSeverity}/10</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Recovery</p>
            <p className="text-sm font-medium">{currentScore.factors.recoveryRate}%</p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Based on your symptom logs from the last 30 days
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthScore;
