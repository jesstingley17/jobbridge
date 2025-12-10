import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Accessibility,
  Heart,
  Building2,
  Filter,
  X,
  ExternalLink,
  Globe,
  Loader2,
  Sparkles,
  FileText,
  Send,
  CheckCircle,
  Target,
  Lightbulb,
  Sparkles as SparklesIcon,
  BarChart3,
  Zap,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionContext } from "@/contexts/subscription-context";
import type { Job } from "@shared/schema";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { JobCard, type ExtendedJob } from "@/components/jobs/JobCard";

const accessibilityFilters = [
  { id: "remote", label: "Remote Work Available" },
  { id: "flexible", label: "Flexible Hours" },
  { id: "wheelchair", label: "Wheelchair Accessible" },
  { id: "screen-reader", label: "Screen Reader Compatible" },
  { id: "mental-health", label: "Mental Health Support" },
  { id: "quiet-space", label: "Quiet Workspace" },
];

const jobTypes = [
  { value: "all", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "contract", label: "Contract" },
];

function JobCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function ApplyDialog({ 
  job, 
  open, 
  onOpenChange 
}: { 
  job: Job; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const { hasFeature, handleApiError } = useSubscriptionContext();
  const [generateCoverLetter, setGenerateCoverLetter] = useState(true);
  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [applicationTips, setApplicationTips] = useState<Array<{ tip: string; importance: string; example: string }> | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/cover-letter/generate", {
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter || "");
      setIsGenerating(false);
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate cover letter. You can write one manually.",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const response = await apiRequest("POST", "/api/applications", {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status: "applied",
        appliedDate: today,
        coverLetter: coverLetter || null,
        notes: null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: `Your application to ${job.company} has been tracked.`,
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCoverLetter = () => {
    setIsGenerating(true);
    generateMutation.mutate();
  };

  const handleSubmit = () => {
    submitMutation.mutate();
  };

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

  const handleLoadTips = () => {
    if (!hasFeature("aiApplicationTips")) return;
    setShowTips(true);
    if (!applicationTips) {
      setIsLoadingTips(true);
      loadApplicationTips.mutate();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCoverLetter("");
      setIsSubmitted(false);
      setGenerateCoverLetter(true);
      setShowTips(false);
      setApplicationTips(null);
    }, 300);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl">Application Submitted</DialogTitle>
            <DialogDescription className="mt-2">
              Your application to {job.company} for the {job.title} position has been tracked. 
              {job.applyUrl && " Don't forget to also apply on the company's website."}
            </DialogDescription>
            <div className="mt-6 flex gap-3">
              {job.applyUrl && (
                <Button asChild>
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    Apply on Site
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={handleClose} data-testid="button-close-dialog">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" aria-hidden="true" />
            Apply to {job.title}
          </DialogTitle>
          <DialogDescription>
            {job.company} - {job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Application Tips */}
          {hasFeature("aiApplicationTips") && (
            <Collapsible open={showTips} onOpenChange={setShowTips}>
              <div className="rounded-lg border p-4">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                    onClick={handleLoadTips}
                  >
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
                      <div className="text-left">
                        <p className="font-medium">AI Application Tips</p>
                        <p className="text-sm text-muted-foreground">Get personalized tips for this application</p>
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
                    <div className="space-y-4">
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
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="font-medium">AI Cover Letter</p>
                <p className="text-sm text-muted-foreground">Generate a personalized cover letter</p>
              </div>
            </div>
            <Switch
              checked={generateCoverLetter}
              onCheckedChange={setGenerateCoverLetter}
              data-testid="switch-cover-letter"
            />
          </div>

          {generateCoverLetter && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Cover Letter
                </Label>
                {!coverLetter && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateCoverLetter}
                    disabled={isGenerating}
                    className="gap-2"
                    data-testid="button-generate-cover-letter"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                )}
              </div>
              <Textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Click 'Generate with AI' to create a cover letter, or write your own..."
                className="min-h-48"
                data-testid="textarea-cover-letter"
              />
              {coverLetter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGenerating}
                  className="gap-2"
                  data-testid="button-regenerate-cover-letter"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  )}
                  Regenerate
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} data-testid="button-cancel-apply">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="gap-2"
            data-testid="button-submit-application"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Track Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function Jobs() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [jobType, setJobType] = useState("all");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const handleApplyClick = (job: Job | ExtendedJob) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for jobs and track your applications.",
        variant: "destructive",
      });
      return;
    }
    // Convert ExtendedJob to Job format if needed
    const jobForState: Job = 'createdAt' in job ? job as Job : {
      id: String(job.id),
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary ?? null,
      description: job.description,
      requirements: job.requirements ?? '',
      accommodations: null,
      postedDate: job.postedDate ?? '',
      accessibilityFeatures: job.accessibilityFeatures ?? null,
      externalId: null,
      externalSource: job.externalSource ?? null,
      applyUrl: null,
      createdAt: null,
    };
    setApplyJob(jobForState);
  };

  const toggleSave = (jobId: number) => {
    const jobIdStr = String(jobId);
    setSavedJobs((prev) =>
      prev.includes(jobIdStr) ? prev.filter((id) => id !== jobIdStr) : [...prev, jobIdStr]
    );
  };

  const buildApiUrl = () => {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.set("query", searchQuery);
    if (locationQuery) queryParams.set("location", locationQuery);
    if (jobType !== "all") queryParams.set("type", jobType);
    if (selectedFilters.length > 0) queryParams.set("accessibilityFilters", selectedFilters.join(","));
    const queryString = queryParams.toString();
    return queryString ? `/api/all-jobs?${queryString}` : "/api/all-jobs";
  };

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/all-jobs", searchQuery, locationQuery, jobType, selectedFilters.join(",")],
    queryFn: async () => {
      const response = await fetch(buildApiUrl());
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !locationQuery ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());

    const matchesType = jobType === "all" || job.type === jobType;

    const matchesAccessibility = selectedFilters.length === 0 || selectedFilters.every((filter) => {
      const features = job.accessibilityFeatures || [];
      const description = (job.description || "").toLowerCase();
      const accommodations = (job.accommodations || "").toLowerCase();
      const type = (job.type || "").toLowerCase();

      switch (filter) {
        case "remote":
          return type === "remote" || 
            features.some(f => f.toLowerCase().includes("remote")) ||
            description.includes("remote work") ||
            description.includes("work from home");
        case "flexible":
          return features.some(f => f.toLowerCase().includes("flexible")) ||
            description.includes("flexible hours") ||
            description.includes("flexible schedule") ||
            accommodations.includes("flexible");
        case "wheelchair":
          return features.some(f => f.toLowerCase().includes("wheelchair") || f.toLowerCase().includes("accessible")) ||
            description.includes("wheelchair accessible") ||
            accommodations.includes("wheelchair");
        case "screen-reader":
          return features.some(f => f.toLowerCase().includes("screen reader")) ||
            description.includes("screen reader") ||
            description.includes("assistive technology");
        case "mental-health":
          return features.some(f => f.toLowerCase().includes("mental health") || f.toLowerCase().includes("wellness")) ||
            description.includes("mental health") ||
            accommodations.includes("mental health");
        case "quiet-space":
          return features.some(f => f.toLowerCase().includes("quiet")) ||
            description.includes("quiet workspace") ||
            description.includes("quiet environment");
        default:
          return true;
      }
    });

    return matchesSearch && matchesLocation && matchesType && matchesAccessibility;
  });

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Search Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-center tracking-tight">
            Find Your <span className="text-primary">Dream Job</span>
          </h1>
          <p className="mt-4 text-center text-muted-foreground">
            Discover opportunities from inclusive employers
          </p>

          {/* Search Bar */}
          <div className="mt-8 mx-auto max-w-3xl">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search jobs, titles, keywords..."
                  className="w-full rounded-md border bg-background pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="md:w-auto">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Remote Only
              </Button>
              <Button variant="outline" size="sm">
                <Briefcase className="h-4 w-4 mr-2" />
                Full-time
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {isLoading ? "..." : filteredJobs?.length || 0} jobs
            </p>
            <Button variant="outline" size="sm">
              Sort by: Recent
            </Button>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : filteredJobs && filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const extendedJob: ExtendedJob = {
                  id: job.id,
                  title: job.title,
                  company: job.company,
                  location: job.location,
                  type: job.type,
                  description: job.description,
                  salary: job.salary,
                  postedDate: job.postedDate,
                  requirements: job.requirements,
                  externalSource: job.externalSource,
                  accessibilityFeatures: job.accessibilityFeatures ?? undefined,
                };
                return (
                  <JobCard
                    key={job.id}
                    job={extendedJob}
                    isSaved={savedJobs.includes(String(job.id))}
                    onToggleSave={toggleSave}
                    onApply={handleApplyClick}
                  />
                );
              })
            ) : (
              <Card className="overflow-visible">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="mb-4 h-12 w-12 text-muted-foreground/50" aria-hidden="true" />
                  <h3 className="text-lg font-semibold">No jobs found</h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filters to find more opportunities.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center gap-2">
            <Button variant="outline">Previous</Button>
            <Button variant="secondary">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </section>

      {applyJob && (
        <ApplyDialog 
          job={applyJob} 
          open={!!applyJob} 
          onOpenChange={(open) => !open && setApplyJob(null)} 
        />
      )}
    </div>
  );
}
