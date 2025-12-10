import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Briefcase,
  Clock,
  DollarSign,
  ExternalLink,
  Heart,
  Lightbulb,
  Loader2,
  MapPin,
  Sparkles,
  Target,
  Zap,
  Globe,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import type { Job } from "@shared/schema";

// Extended Job interface to match Figma design
interface ExtendedJob extends Partial<Job> {
  id: string | number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  salary?: string;
  postedDate?: string;
  posted?: string;
  requirements?: string;
  externalSource?: string;
  accessibilityFeatures?: string[];
  matchScore?: number;
  matchAnalysis?: {
    strengths: string;
    recommendation: string;
  };
  tips?: Array<{
    tip: string;
    importance: string;
    example: string;
  }>;
  accessible?: boolean;
}

interface JobCardProps {
  job: ExtendedJob;
  isSaved: boolean;
  onToggleSave: (id: number) => void;
  onApply?: (job: ExtendedJob) => void;
}

export function JobCard({ job, isSaved, onToggleSave, onApply }: JobCardProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { hasFeature, handleApiError } = useSubscriptionContext();
  const [matchScore, setMatchScore] = useState<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    strengths: string;
    recommendation: string;
  } | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [simplifiedDescription, setSimplifiedDescription] = useState<string | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [showSimplified, setShowSimplified] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [applicationTips, setApplicationTips] = useState<Array<{
    tip: string;
    importance: string;
    example: string;
  }> | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const loadMatchScore = useMutation({
    mutationFn: async () => {
      const profileResponse = await apiRequest("GET", "/api/profile");
      const profile = await profileResponse.json();
      const resumesResponse = await apiRequest("GET", "/api/resumes");
      const resumes = await resumesResponse.json();
      const allSkills = Array.from(
        new Set([
          ...(profile?.skills || []),
          ...(resumes?.flatMap((r: any) => r.skills || []) || []),
        ])
      );
      const response = await apiRequest("POST", "/api/ai/match-score", {
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.requirements,
        userSkills: [...new Set(allSkills)],
        userExperience: profile?.bio || "",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMatchScore(data);
      setIsLoadingScore(false);
    },
    onError: () => {
      setIsLoadingScore(false);
    },
  });

  const simplifyDescription = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/simplify-job", {
        jobTitle: job.title,
        description: job.description,
        requirements: job.requirements,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSimplifiedDescription(data.simplified);
      setIsSimplifying(false);
      setShowSimplified(true);
    },
    onError: () => {
      toast({
        title: "Failed to Simplify",
        description: "Could not simplify job description.",
        variant: "destructive",
      });
      setIsSimplifying(false);
    },
  });

  const loadApplicationTips = useMutation({
    mutationFn: async () => {
      const profileResponse = await apiRequest("GET", "/api/profile");
      const profile = await profileResponse.json();
      const response = await apiRequest("POST", "/api/ai/application-tips", {
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
        userSkills: profile?.skills || [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      setApplicationTips(data.tips || []);
      setIsLoadingTips(false);
    },
    onError: (error) => {
      if (handleApiError(error)) {
        setIsLoadingTips(false);
        return;
      }
      toast({
        title: "Failed to Load Tips",
        description: "Could not load application tips.",
        variant: "destructive",
      });
      setIsLoadingTips(false);
    },
  });

  const handleLoadScore = () => {
    if (!isAuthenticated || matchScore) return;
    setIsLoadingScore(true);
    loadMatchScore.mutate();
  };

  const handleSimplify = () => {
    if (simplifiedDescription) {
      setShowSimplified(!showSimplified);
      return;
    }
    setIsSimplifying(true);
    // Use API if available, otherwise create a simple summary like Figma
    if (isAuthenticated) {
      simplifyDescription.mutate();
    } else {
      // Simple mock like Figma design
      const mockSimplified = `Simplified Summary:
• ${job.title} position at ${job.company}
• ${job.type} role${job.salary ? ` with ${job.salary} salary` : ""}
• Key focus: ${job.description}
• Inclusive environment with accessibility support`;
      setTimeout(() => {
        setSimplifiedDescription(mockSimplified);
        setIsSimplifying(false);
        setShowSimplified(true);
      }, 1500);
    }
  };

  const handleLoadTips = () => {
    if (!hasFeature("aiApplicationTips")) return;
    setShowTips(true);
    if (!applicationTips) {
      setIsLoadingTips(true);
      loadApplicationTips.mutate();
    }
  };

  // Auto-load match score for authenticated users
  useEffect(() => {
    if (isAuthenticated && !matchScore && !isLoadingScore) {
      handleLoadScore();
    }
  }, [isAuthenticated]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  return (
    <Card className="overflow-visible hover:shadow-md transition-shadow" data-testid={`card-job-${job.id}`}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {job.externalSource ? (
                  <Globe className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Briefcase className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{job.title}</h3>
                  {job.externalSource && (
                    <Badge variant="outline" className="gap-1 text-xs" data-testid={`badge-source-${job.id}`}>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      {job.externalSource === "indeed" ? "Indeed" : job.externalSource}
                    </Badge>
                  )}
                  {/* AI Match Score Badge */}
                  {(job.matchScore !== undefined || (isAuthenticated && matchScore)) && (
                    <Badge 
                      className={`gap-1 ${getScoreColor(job.matchScore || matchScore?.score || 0)}`} 
                      variant="outline"
                    >
                      <Target className="h-3 w-3" aria-hidden="true" />
                      {job.matchScore || matchScore?.score || 0}% Match
                    </Badge>
                  )}
                  {isAuthenticated && isLoadingScore && !job.matchScore && (
                    <Badge variant="outline" className="gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      Calculating...
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
            </div>

            {/* AI Match Analysis */}
            {(job.matchAnalysis || (isAuthenticated && matchScore)) && (
              <div className="mt-4 rounded-lg border p-3 bg-muted/30">
                <p className="text-xs font-medium mb-1">AI Match Analysis</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {job.matchAnalysis?.strengths || matchScore?.strengths}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.matchAnalysis?.recommendation || matchScore?.recommendation}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {job.type}
              </div>
              {job.salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" aria-hidden="true" />
                  {job.salary}
                </div>
              )}
            </div>

            {/* Job Description with AI Simplifier */}
            <div className="mt-3">
              {showSimplified && simplifiedDescription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">Simplified Description</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSimplified(false)}
                    >
                      Show Original
                    </Button>
                  </div>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                      {simplifiedDescription}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 gap-2"
                    onClick={handleSimplify}
                    disabled={isSimplifying}
                  >
                    {isSimplifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Simplifying...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Simplify Description
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {job.accessible && (
              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-foreground">
                <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                Accessibility-friendly
              </div>
            )}

            {/* AI Application Tips */}
            {job.tips && job.tips.length > 0 && (
              <div className="mt-6">
                <Collapsible open={showTips} onOpenChange={setShowTips}>
                  <div className="rounded-lg border p-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                      >
                        <div className="flex items-center gap-3">
                          <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
                          <div className="text-left">
                            <p className="font-medium">AI Application Tips</p>
                            <p className="text-sm text-muted-foreground">
                              Get personalized tips for this application
                            </p>
                          </div>
                        </div>
                        <Zap className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="space-y-4 pt-2 border-t mt-2">
                        {job.tips.map((tip, index) => (
                          <Card key={index} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <h4 className="font-semibold mb-2">{tip.tip}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{tip.importance}</p>
                              <p className="text-sm">
                                <span className="font-medium">Example: </span>
                                {tip.example}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>
            )}
            {/* Fallback to API-based tips if job.tips not available */}
            {!job.tips && hasFeature("aiApplicationTips") && (
              <div className="mt-6">
                <Collapsible open={showTips} onOpenChange={setShowTips}>
                  <div className="rounded-lg border p-4">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto hover:bg-transparent"
                        onClick={handleLoadTips}
                      >
                        <div className="flex items-center gap-3">
                          <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
                          <div className="text-left">
                            <p className="font-medium">AI Application Tips</p>
                            <p className="text-sm text-muted-foreground">
                              Get personalized tips for this application
                            </p>
                          </div>
                        </div>
                        <Zap className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      {isLoadingTips ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
                        </div>
                      ) : applicationTips && applicationTips.length > 0 ? (
                        <div className="space-y-4 pt-2 border-t mt-2">
                          {applicationTips.map((tip, index) => (
                            <Card key={index} className="border-l-4 border-l-primary">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-2">{tip.tip}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{tip.importance}</p>
                                <p className="text-sm">
                                  <span className="font-medium">Example: </span>
                                  {tip.example}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : null}
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>
            )}

            <p className="mt-3 text-xs text-muted-foreground">
              Posted {job.posted}
            </p>
          </div>

          <div className="flex gap-2 md:flex-col">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleSave(Number(job.id))}
              aria-label="Save job"
              data-testid={`button-save-${job.id}`}
            >
              <Heart
                className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}
                aria-hidden="true"
              />
            </Button>
            <Button 
              className="gap-2 md:w-full" 
              onClick={() => onApply?.(job)} 
              data-testid={`button-apply-${job.id}`}
            >
              Apply
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

