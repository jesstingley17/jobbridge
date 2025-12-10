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
  Building2,
  Globe,
  Accessibility,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import type { Job } from "@shared/schema";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

export function JobCard({ job, onApply, onSave, isSaved = false }: JobCardProps) {
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
    simplifyDescription.mutate();
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
                  <Building2 className="h-6 w-6" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-semibold">
                    <button
                      className="text-left hover:text-primary transition-colors"
                      data-testid={`link-job-title-${job.id}`}
                    >
                      {job.title}
                    </button>
                  </h3>
                  {job.externalSource && (
                    <Badge variant="outline" className="gap-1 text-xs" data-testid={`badge-source-${job.id}`}>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      {job.externalSource === "indeed" ? "Indeed" : job.externalSource}
                    </Badge>
                  )}
                  {isAuthenticated && matchScore && (
                    <Badge className={`gap-1 ${getScoreColor(matchScore.score)}`} variant="outline">
                      <Target className="h-3 w-3" aria-hidden="true" />
                      {matchScore.score}% Match
                    </Badge>
                  )}
                  {isAuthenticated && isLoadingScore && (
                    <Badge variant="outline" className="gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                      Calculating...
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                    {job.type}
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" aria-hidden="true" />
                      {job.salary}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    {job.postedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Match Analysis */}
            {isAuthenticated && matchScore && (
              <div className="mt-4 rounded-lg border p-3 bg-muted/30">
                <p className="text-xs font-medium mb-1">AI Match Analysis</p>
                <p className="text-xs text-muted-foreground mb-2">{matchScore.strengths}</p>
                <p className="text-xs text-muted-foreground">{matchScore.recommendation}</p>
              </div>
            )}

            {/* Job Description with AI Simplifier */}
            <div className="mt-4">
              {showSimplified && simplifiedDescription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-primary">Simplified Description</p>
                    <Button variant="ghost" size="sm" onClick={() => setShowSimplified(false)}>
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
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
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

            {job.accessibilityFeatures && job.accessibilityFeatures.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.accessibilityFeatures.map((feature) => (
                  <Badge key={feature} variant="secondary" className="gap-1">
                    <Accessibility className="h-3 w-3" aria-hidden="true" />
                    {feature}
                  </Badge>
                ))}
              </div>
            )}

            {/* AI Application Tips */}
            {hasFeature("aiApplicationTips") && (
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
          </div>

          <div className="flex gap-2 md:flex-col">
            {onSave && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSave(job.id)}
                aria-label="Save job"
                data-testid={`button-save-${job.id}`}
              >
                <Heart
                  className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            )}
            <Button onClick={() => onApply(job)} className="gap-2 md:w-full" data-testid={`button-apply-${job.id}`}>
              Apply
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

