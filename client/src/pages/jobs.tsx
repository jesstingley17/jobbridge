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
import { JobCard } from "@/components/jobs/JobCard";

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

  const handleApplyClick = (job: Job) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to apply for jobs and track your applications.",
        variant: "destructive",
      });
      return;
    }
    setApplyJob(job);
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
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-accent/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Find Your <span className="text-primary">Perfect Job</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Search through disability-friendly employers and accessible workplaces.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-4xl">
            <Card className="overflow-visible">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <Label htmlFor="job-search" className="sr-only">
                      Search jobs
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="job-search"
                        type="search"
                        placeholder="Job title, company, or keywords"
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-job-search"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="location-search" className="sr-only">
                      Location
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                      <Input
                        id="location-search"
                        type="search"
                        placeholder="City, state, or remote"
                        className="pl-10"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        data-testid="input-location-search"
                      />
                    </div>
                  </div>
                  <Button className="gap-2" data-testid="button-search-jobs">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12" aria-labelledby="job-listings-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            <aside className="lg:w-72">
              <div className="sticky top-20">
                <div className="mb-4 flex items-center justify-between lg:hidden">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                    aria-expanded={showFilters}
                    data-testid="button-toggle-filters"
                  >
                    <Filter className="h-4 w-4" aria-hidden="true" />
                    Filters
                    {selectedFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedFilters.length}
                      </Badge>
                    )}
                  </Button>
                </div>

                <Card className={`overflow-visible ${showFilters ? "block" : "hidden lg:block"}`}>
                  <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
                    <h2 className="font-semibold">Filters</h2>
                    {selectedFilters.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFilters([])}
                        data-testid="button-clear-filters"
                      >
                        Clear all
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="job-type">Job Type</Label>
                      <Select value={jobType} onValueChange={setJobType}>
                        <SelectTrigger id="job-type" className="mt-2" data-testid="select-job-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-medium">Accessibility Features</h3>
                      <div className="space-y-3">
                        {accessibilityFilters.map((filter) => (
                          <div key={filter.id} className="flex items-center gap-3">
                            <Checkbox
                              id={filter.id}
                              checked={selectedFilters.includes(filter.id)}
                              onCheckedChange={() => toggleFilter(filter.id)}
                              data-testid={`checkbox-filter-${filter.id}`}
                            />
                            <Label
                              htmlFor={filter.id}
                              className="text-sm font-normal text-muted-foreground cursor-pointer"
                            >
                              {filter.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Job Listings */}
            <main className="flex-1" id="main-content">
              <h2 id="job-listings-heading" className="sr-only">Job Listings</h2>
              
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground" data-testid="text-job-count">
                  {isLoading ? "Loading..." : `${filteredJobs?.length || 0} jobs found`}
                </p>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-44" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="relevant">Most Relevant</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {selectedFilters.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {selectedFilters.map((filterId) => {
                    const filter = accessibilityFilters.find((f) => f.id === filterId);
                    return (
                      <Badge key={filterId} variant="secondary" className="gap-1">
                        {filter?.label}
                        <button
                          onClick={() => toggleFilter(filterId)}
                          className="ml-1"
                          aria-label={`Remove ${filter?.label} filter`}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              <div className="space-y-4">
                {isLoading ? (
                  <>
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                    <JobCardSkeleton />
                  </>
                ) : filteredJobs && filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} onApply={handleApplyClick} />
                  ))
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
            </main>
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
