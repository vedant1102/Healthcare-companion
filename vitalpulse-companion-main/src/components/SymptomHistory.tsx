import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Activity, MessageCircle, Download } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface SymptomLog {
  id: string;
  severity: number;
  notes: string | null;
  created_at: string;
  symptom_ids: string[];
}

interface SymptomHistoryProps {
  userId: string;
  onAskChatbot?: (message: string) => void;
}

const SymptomHistory = ({ userId, onAskChatbot }: SymptomHistoryProps) => {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [symptoms, setSymptoms] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const askChatbotAboutLog = (log: SymptomLog) => {
    const symptomNames = log.symptom_ids.map(id => symptoms[id] || "Unknown").join(", ");
    const message = `I have these symptoms: ${symptomNames}. Severity: ${log.severity}/10. ${log.notes ? `Additional notes: ${log.notes}. ` : ""}What possible diseases could this indicate? What medications would you suggest? Any home remedies?`;
    
    if (onAskChatbot) {
      onAskChatbot(message);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("HealthMate - Symptom History Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), "PPP")}`, 20, 30);
    doc.text(`Total Entries: ${logs.length}`, 20, 38);
    
    let yPos = 50;
    
    logs.forEach((log, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`Entry ${index + 1} - ${format(new Date(log.created_at), "PPp")}`, 20, yPos);
      yPos += 8;
      
      doc.setFontSize(11);
      doc.text(`Severity: ${log.severity}/10`, 20, yPos);
      yPos += 6;
      
      const symptomNames = log.symptom_ids.map(id => symptoms[id] || "Unknown").join(", ");
      const symptomLines = doc.splitTextToSize(`Symptoms: ${symptomNames}`, 170);
      doc.text(symptomLines, 20, yPos);
      yPos += symptomLines.length * 6;
      
      if (log.notes) {
        const notesLines = doc.splitTextToSize(`Notes: ${log.notes}`, 170);
        doc.text(notesLines, 20, yPos);
        yPos += notesLines.length * 6;
      }
      
      yPos += 10;
    });
    
    doc.save(`healthmate-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
    toast({
      title: "Success",
      description: "PDF report generated successfully",
    });
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const [logsResponse, symptomsResponse] = await Promise.all([
        supabase
          .from("user_symptoms")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("symptoms").select("id, name"),
      ]);

      if (logsResponse.error) throw logsResponse.error;
      if (symptomsResponse.error) throw symptomsResponse.error;

      setLogs(logsResponse.data || []);
      
      const symptomMap = (symptomsResponse.data || []).reduce((acc, s) => {
        acc[s.id] = s.name;
        return acc;
      }, {} as Record<string, string>);
      setSymptoms(symptomMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load symptom history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Symptom History
            </CardTitle>
            <CardDescription>View your recent symptom logs and track your health</CardDescription>
          </div>
          {logs.length > 0 && (
            <Button variant="outline" onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No symptom logs yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start logging your symptoms to track your health over time
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg border border-border bg-card hover:shadow-soft transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(log.created_at), "PPp")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Severity:</span>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        log.severity <= 3
                          ? "bg-green-100 text-green-700"
                          : log.severity <= 6
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.severity}/10
                    </span>
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm font-medium mb-2">Symptoms:</p>
                  <div className="flex flex-wrap gap-2">
                    {log.symptom_ids.map((id) => (
                      <span
                        key={id}
                        className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full"
                      >
                        {symptoms[id] || "Unknown"}
                      </span>
                    ))}
                  </div>
                </div>
                
                {log.notes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                  </div>
                )}
                
                {onAskChatbot && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => askChatbotAboutLog(log)}
                      className="w-full"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Ask HealthMate AI
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SymptomHistory;
