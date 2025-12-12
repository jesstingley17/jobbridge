import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSubscriptionContext } from "@/contexts/subscription-context";

interface Recommendation {
  role: string;
  reason: string;
  searchTerms: string[];
}

export function AiJobRecommendations() {
  const { toast } = useToast();
  const { hasFeature, handleApiError } = useSubscriptionContext();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);

  const loadRecommendations = useMutation({
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
      const response = await apiRequest("POST", "/api/ai/recommendations", {
        skills: allSkills,
        preferredJobTypes: profile?.preferredJobTypes || [],
        preferredLocations: profile?.preferredLocations || [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      setRecommendations(data.recommendations || []);
      setIsLoadingRecommendations(false);
    },
    onError: (error) => {
      if (handleApiError(error)) {
        setIsLoadingRecommendations(false);
        return;
      }
      toast({
        title: "Failed to Load Recommendations",
        description: "Could not load job recommendations.",
        variant: "destructive",
      });
      setIsLoadingRecommendations(false);
    },
  });

  const handleLoadRecommendations = () => {
    if (!hasFeature("aiJobRecommendations")) return;
    setShowRecommendations(true);
    if (!recommendations) {
      setIsLoadingRecommendations(true);
      loadRecommendations.mutate();
    }
  };

  if (!hasFeature("aiJobRecommendations")) {
    return null;
  }

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            AI Job Recommendations
          </CardTitle>
          {!showRecommendations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadRecommendations}
              disabled={isLoadingRecommendations}
            >
              {isLoadingRecommendations ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                "Load"
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      {showRecommendations && (
        <CardContent>
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-1">{rec.role}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.searchTerms.map((term, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {term}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/jobs?query=${encodeURIComponent(rec.role)}`}>
                      <Button variant="ghost" size="sm" className="mt-3 gap-2">
                        Search Jobs
                        <Search className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recommendations available. Update your profile to get personalized suggestions.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}


