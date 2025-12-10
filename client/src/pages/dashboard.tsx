import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  FileText,
  MessageSquare,
  ClipboardList,
  TrendingUp,
  Calendar,
  Building2,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Star,
  Plus,
  ArrowRight,
  BarChart3,
  Target,
  Sparkles,
  Loader2,
  Search,
} from "lucide-react";
import type { Application } from "@shared/schema";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  applied: { label: "Applied", icon: Send, variant: "secondary" },
  interviewing: { label: "Interviewing", icon: MessageSquare, variant: "default" },
  offered: { label: "Offered", icon: Star, variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" },
  saved: { label: "Saved", icon: Clock, variant: "outline" },
};

function StatCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <CardContent className="p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-20" />
      </CardContent>
    </Card>
  );
}

function ApplicationCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { hasFeature, handleApiError } = useSubscriptionContext();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Array<{ role: string; reason: string; searchTerms: string[] }> | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/applications/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Status Updated",
        description: "Application status has been updated.",
      });
    },
  });

  const stats = {
    total: applications?.length || 0,
    applied: applications?.filter((a) => a.status === "applied").length || 0,
    interviewing: applications?.filter((a) => a.status === "interviewing").length || 0,
    offered: applications?.filter((a) => a.status === "offered").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
    saved: applications?.filter((a) => a.status === "saved").length || 0,
  };

  const successRate = stats.total > 0
    ? Math.round(((stats.interviewing + stats.offered) / stats.total) * 100)
    : 0;

  const recentApplications = applications?.slice(0, 5) || [];

  const loadRecommendations = useMutation({
    mutationFn: async () => {
      const profileResponse = await apiRequest("GET", "/api/profile");
      const profile = await profileResponse.json();
      const resumesResponse = await apiRequest("GET", "/api/resumes");
      const resumes = await resumesResponse.json();
      const allSkills = Array.from(new Set([
        ...(profile?.skills || []),
        ...(resumes?.flatMap((r: any) => r.skills || []) || [])
      ]));
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

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-accent/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Your <span className="text-primary">Dashboard</span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Track your job search progress and manage applications.
              </p>
            </div>
            <Link href="/jobs">
              <Button className="gap-2" data-testid="button-find-jobs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Find New Jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Application Statistics</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <Card className="overflow-visible">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Applications</p>
                        <p className="mt-1 text-3xl font-bold" data-testid="text-stat-total">{stats.total}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardList className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-visible">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="mt-1 text-3xl font-bold" data-testid="text-stat-progress">{stats.applied + stats.interviewing}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/50">
                        <TrendingUp className="h-6 w-6 text-accent-foreground" aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-visible">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Interviews</p>
                        <p className="mt-1 text-3xl font-bold" data-testid="text-stat-interviews">{stats.interviewing}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <MessageSquare className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-visible">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="mt-1 text-3xl font-bold" data-testid="text-stat-success">{successRate}%</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-6 w-6 text-primary" aria-hidden="true" />
                      </div>
                    </div>
                    <Progress value={successRate} className="mt-3 h-2" aria-label="Success rate" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8" aria-labelledby="applications-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <Card className="overflow-visible">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div>
                    <CardTitle id="applications-heading">Recent Applications</CardTitle>
                    <CardDescription>
                      Track and manage your job applications
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <ApplicationCardSkeleton />
                      <ApplicationCardSkeleton />
                      <ApplicationCardSkeleton />
                    </div>
                  ) : recentApplications.length > 0 ? (
                    <div className="space-y-4">
                      {recentApplications.map((application) => {
                        const config = statusConfig[application.status] || statusConfig.applied;
                        const StatusIcon = config.icon;
                        return (
                          <div
                            key={application.id}
                            className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                            data-testid={`card-application-${application.id}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-muted sm:flex">
                                <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                              </div>
                              <div>
                                <h3 className="font-medium">{application.jobTitle}</h3>
                                <p className="text-sm text-muted-foreground">{application.company}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" aria-hidden="true" />
                                  Applied {application.appliedDate}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Select
                                value={application.status}
                                onValueChange={(value) =>
                                  updateStatusMutation.mutate({ id: application.id, status: value })
                                }
                              >
                                <SelectTrigger className="w-36" data-testid={`select-status-${application.id}`}>
                                  <SelectValue>
                                    <Badge variant={config.variant} className="gap-1">
                                      <StatusIcon className="h-3 w-3" aria-hidden="true" />
                                      {config.label}
                                    </Badge>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(statusConfig).map(([key, cfg]) => (
                                    <SelectItem key={key} value={key}>
                                      <div className="flex items-center gap-2">
                                        <cfg.icon className="h-4 w-4" aria-hidden="true" />
                                        {cfg.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
                      <h3 className="text-lg font-semibold">No applications yet</h3>
                      <p className="mt-2 text-muted-foreground">
                        Start applying to jobs and track your progress here.
                      </p>
                      <Link href="/jobs">
                        <Button className="mt-4 gap-2" data-testid="button-start-applying">
                          Find Jobs
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* AI Job Recommendations */}
              {hasFeature("aiJobRecommendations") && (
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
              )}

              <Card className="overflow-visible">
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/jobs" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-quick-find-jobs">
                      <Briefcase className="h-4 w-4" aria-hidden="true" />
                      Find New Jobs
                    </Button>
                  </Link>
                  <Link href="/resume" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-quick-resume">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      Build Resume
                    </Button>
                  </Link>
                  <Link href="/interview" className="block">
                    <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-quick-interview">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      Practice Interview
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="overflow-visible">
                <CardHeader>
                  <CardTitle className="text-base">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const count = stats[key as keyof typeof stats] || 0;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={key}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <config.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            {config.label}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
