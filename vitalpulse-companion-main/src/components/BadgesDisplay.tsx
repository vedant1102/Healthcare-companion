import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BadgeType {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgesDisplayProps {
  userId: string;
}

const BadgesDisplay = ({ userId }: BadgesDisplayProps) => {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBadges();
    checkAndAwardBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const [badgesRes, earnedRes] = await Promise.all([
        supabase.from("badges").select("*").order("requirement_value"),
        supabase.from("user_badges").select("*").eq("user_id", userId),
      ]);

      if (badgesRes.error) throw badgesRes.error;
      if (earnedRes.error) throw earnedRes.error;

      setBadges(badgesRes.data || []);
      setEarnedBadges(earnedRes.data || []);
    } catch (error: any) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndAwardBadges = async () => {
    try {
      // Get user stats
      const { data: logs, error } = await supabase
        .from("user_symptoms")
        .select("created_at")
        .eq("user_id", userId)
        .order("created_at");

      if (error) throw error;

      const logsCount = logs?.length || 0;

      // Calculate streak
      let currentStreak = 0;
      if (logs && logs.length > 0) {
        const sortedDates = logs.map(l => new Date(l.created_at).toDateString());
        const uniqueDates = [...new Set(sortedDates)].reverse();
        
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < uniqueDates.length; i++) {
            const currentDate = new Date(uniqueDates[i]);
            const prevDate = new Date(uniqueDates[i - 1]);
            const diffDays = Math.floor((prevDate.getTime() - currentDate.getTime()) / 86400000);
            
            if (diffDays === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      // Get all badges
      const { data: allBadges } = await supabase.from("badges").select("*");
      const { data: userBadges } = await supabase.from("user_badges").select("badge_id").eq("user_id", userId);
      
      const earnedBadgeIds = new Set(userBadges?.map(b => b.badge_id) || []);
      
      // Check each badge
      for (const badge of allBadges || []) {
        if (earnedBadgeIds.has(badge.id)) continue;
        
        let shouldAward = false;
        if (badge.requirement_type === "logs_count" && logsCount >= badge.requirement_value) {
          shouldAward = true;
        } else if (badge.requirement_type === "streak_days" && currentStreak >= badge.requirement_value) {
          shouldAward = true;
        }
        
        if (shouldAward) {
          await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
          });
          
          toast({
            title: "🎉 New Badge Earned!",
            description: `You've earned the "${badge.name}" badge!`,
          });
          
          earnedBadgeIds.add(badge.id);
        }
      }
      
      fetchBadges();
    } catch (error: any) {
      console.error("Error checking badges:", error);
    }
  };

  const isBadgeEarned = (badgeId: string) => {
    return earnedBadges.some(eb => eb.badge_id === badgeId);
  };

  if (loading) {
    return (
      <Card className="shadow-elevated">
        <CardContent className="flex items-center justify-center py-12">
          <Award className="h-8 w-8 animate-pulse text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Achievements
        </CardTitle>
        <CardDescription>
          Earn badges by logging symptoms consistently
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const earned = isBadgeEarned(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  earned
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-muted bg-muted/30 opacity-60"
                }`}
              >
                <div className="text-4xl mb-2 relative">
                  {earned ? (
                    badge.icon
                  ) : (
                    <div className="relative inline-block">
                      <span className="opacity-30">{badge.icon}</span>
                      <Lock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-semibold text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
                {earned && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Earned
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgesDisplay;
