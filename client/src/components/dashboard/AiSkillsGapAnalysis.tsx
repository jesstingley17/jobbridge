import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
  Target,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionContext } from "@/contexts/subscription-context";

export function AiSkillsGapAnalysis() {
  const { toast } = useToast();
  const { hasFeature, handleApiError } = useSubscriptionContext();
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skillsGapAnalysis, setSkillsGapAnalysis] = useState<{
    matchingSkills: string[];
    skillGaps: Array<{
      name: string;
      priority: string;
      timeToLearn: string;
      resources: string[];
    }>;
  } | null>(null);

  const analyzeSkillsGap = useMutation({
    mutationFn: async () => {
      const profileResponse = await apiRequest("GET", "/api/profile");
      const profile = await profileResponse.json();
      const currentSkills = profile?.skills || [];
      const response = await apiRequest("POST", "/api/ai/skills-gap", {
        currentSkills,
        targetRole,
        jobDescription: jobDescription || undefined,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSkillsGapAnalysis(data.analysis);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      if (handleApiError(error)) {
        setIsAnalyzing(false);
        return;
      }
      toast({
        title: "Analysis Failed",
        description: "Could not analyze skills gap.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    },
  });

  const handleAnalyzeSkillsGap = () => {
    if (!hasFeature("aiSkillsGap") || !targetRole.trim()) {
      toast({
        title: "Target Role Required",
        description: "Please enter a target role to analyze.",
        variant: "destructive",
      });
      return;
    }
    setIsAnalyzing(true);
    analyzeSkillsGap.mutate();
  };

  if (!hasFeature("aiSkillsGap")) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          AI Skills Gap Analysis
        </CardTitle>
        <CardDescription>
          Identify skills you need to develop for your target role
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-role">Target Role</Label>
          <Input
            id="target-role"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Software Developer, Project Manager"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-description">Job Description (Optional)</Label>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste a job description for more accurate analysis..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleAnalyzeSkillsGap}
          disabled={isAnalyzing || !targetRole.trim()}
          className="w-full gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4" aria-hidden="true" />
              Analyze Skills Gap
            </>
          )}
        </Button>

        {skillsGapAnalysis && (
          <div className="mt-6 space-y-4 rounded-lg border p-4">
            {skillsGapAnalysis.matchingSkills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
                  Skills You Already Have
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skillsGapAnalysis.matchingSkills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-50 text-green-700">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {skillsGapAnalysis.skillGaps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" aria-hidden="true" />
                  Skills to Develop
                </h4>
                <div className="space-y-3">
                  {skillsGapAnalysis.skillGaps.map((gap, i) => (
                    <Card key={i} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium">{gap.name}</h5>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                gap.priority === "high"
                                  ? "destructive"
                                  : gap.priority === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {gap.priority} priority
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {gap.timeToLearn}
                            </Badge>
                          </div>
                        </div>
                        {gap.resources.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Learning Resources:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {gap.resources.map((resource, j) => (
                                <Badge key={j} variant="outline" className="text-xs gap-1">
                                  <BookOpen className="h-3 w-3" aria-hidden="true" />
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


