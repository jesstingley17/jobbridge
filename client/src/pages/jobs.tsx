import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import type { Job } from "@shared/schema";

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

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [jobType, setJobType] = useState("all");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/all-jobs"],
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

    return matchesSearch && matchesLocation && matchesType;
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
                    <Card key={job.id} className="overflow-visible hover-elevate" data-testid={`card-job-${job.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="hidden h-12 w-12 items-center justify-center rounded-md bg-primary/10 sm:flex">
                                {job.externalSource ? (
                                  <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
                                ) : (
                                  <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-lg font-semibold">
                                    <button className="text-left hover:text-primary transition-colors" data-testid={`link-job-title-${job.id}`}>
                                      {job.title}
                                    </button>
                                  </h3>
                                  {job.externalSource && (
                                    <Badge variant="outline" className="gap-1 text-xs" data-testid={`badge-source-${job.id}`}>
                                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                      {job.externalSource === "indeed" ? "Indeed" : job.externalSource}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">{job.company}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" aria-hidden="true" />
                                    {job.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                                    {job.type}
                                  </span>
                                  {job.salary && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" aria-hidden="true" />
                                      {job.salary}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" aria-hidden="true" />
                                    {job.postedDate}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                              {job.description}
                            </p>
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
                          </div>
                          <div className="flex gap-2 sm:flex-col">
                            {job.applyUrl ? (
                              <Button asChild data-testid={`button-apply-${job.id}`}>
                                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                                  Apply
                                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                              </Button>
                            ) : (
                              <Button data-testid={`button-apply-${job.id}`}>Apply Now</Button>
                            )}
                            <Button variant="ghost" size="icon" aria-label="Save job" data-testid={`button-save-${job.id}`}>
                              <Heart className="h-5 w-5" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
    </div>
  );
}
