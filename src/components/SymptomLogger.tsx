import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

interface Symptom {
  id: string;
  name: string;
  description: string | null;
}

interface SymptomLoggerProps {
  userId: string;
}

const SymptomLogger = ({ userId }: SymptomLoggerProps) => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSymptoms, setFetchingSymptoms] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from("symptoms")
        .select("*")
        .order("name");

      if (error) throw error;
      setSymptoms(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load symptoms",
        variant: "destructive",
      });
    } finally {
      setFetchingSymptoms(false);
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      toast({
        title: "No symptoms selected",
        description: "Please select at least one symptom",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("user_symptoms")
        .insert({
          user_id: userId,
          symptom_ids: selectedSymptoms,
          severity,
          notes: notes.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Symptoms logged",
        description: "Your symptoms have been recorded successfully",
      });

      setSelectedSymptoms([]);
      setSeverity(5);
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log symptoms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSymptoms) {
    return (
      <Card className="shadow-elevated">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          Log Your Symptoms
        </CardTitle>
        <CardDescription>
          Select your symptoms and provide additional details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Symptoms</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-4 bg-muted/30 rounded-lg">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={symptom.id}
                    checked={selectedSymptoms.includes(symptom.id)}
                    onCheckedChange={() => handleSymptomToggle(symptom.id)}
                  />
                  <label
                    htmlFor={symptom.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {symptom.name}
                    {symptom.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {symptom.description}
                      </p>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">
              Severity: {severity}/10
            </Label>
            <input
              id="severity"
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mild</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Describe your symptoms in more detail, when they started, any triggers..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" disabled={loading || selectedSymptoms.length === 0} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging symptoms...
              </>
            ) : (
              "Log Symptoms"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SymptomLogger;
