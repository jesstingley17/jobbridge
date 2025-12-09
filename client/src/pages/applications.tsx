import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Briefcase,
  FileText,
  MessageSquare,
  ClipboardList,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Star,
  Plus,
  ArrowRight,
  Target,
  Trash2,
  Edit3,
  Eye,
  Save,
  Loader2,
  StickyNote,
} from "lucide-react";
import type { Application } from "@shared/schema";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  saved: { label: "Saved", icon: Clock, variant: "outline" },
  applied: { label: "Applied", icon: Send, variant: "secondary" },
  interviewing: { label: "Interviewing", icon: MessageSquare, variant: "default" },
  offered: { label: "Offered", icon: Star, variant: "default" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" },
};

function ApplicationCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <CardContent className="p-6">
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

function ApplicationDetailDialog({ application }: { application: Application }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(application.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      const response = await apiRequest("PATCH", `/api/applications/${application.id}`, { notes: newNotes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsEditingNotes(false);
      toast({
        title: "Notes Saved",
        description: "Your notes have been updated.",
      });
    },
  });

  const config = statusConfig[application.status] || statusConfig.applied;
  const StatusIcon = config.icon;

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          {application.jobTitle}
        </DialogTitle>
        <DialogDescription className="flex items-center gap-2">
          {application.company}
          <Badge variant={config.variant} className="gap-1 ml-2">
            <StatusIcon className="h-3 w-3" aria-hidden="true" />
            {config.label}
          </Badge>
        </DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="details" className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="details" className="flex-1 gap-2" data-testid="tab-details">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
            Details
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="flex-1 gap-2" data-testid="tab-cover-letter">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex-1 gap-2" data-testid="tab-notes">
            <StickyNote className="h-4 w-4" aria-hidden="true" />
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Applied Date</p>
              <p className="font-medium" data-testid="text-applied-date">{application.appliedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Job ID</p>
              <p className="font-medium text-muted-foreground text-sm" data-testid="text-job-id">{application.jobId}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cover-letter" className="mt-4">
          {application.coverLetter ? (
            <div className="rounded-lg border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap text-sm font-sans" data-testid="text-cover-letter">
                {application.coverLetter}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-4 h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-muted-foreground">No cover letter attached to this application.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <div className="space-y-4">
            {isEditingNotes ? (
              <>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="min-h-32"
                  data-testid="textarea-notes"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => updateNotesMutation.mutate(notes)}
                    disabled={updateNotesMutation.isPending}
                    className="gap-2"
                    data-testid="button-save-notes"
                  >
                    {updateNotesMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    Save Notes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingNotes(false)} data-testid="button-cancel-notes">
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {notes ? (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <pre className="whitespace-pre-wrap text-sm font-sans" data-testid="text-notes">
                      {notes}
                    </pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No notes yet.</p>
                )}
                <Button variant="outline" onClick={() => setIsEditingNotes(true)} className="gap-2" data-testid="button-edit-notes">
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  {notes ? "Edit Notes" : "Add Notes"}
                </Button>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}

export default function Applications() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Deleted",
        description: "The application has been removed.",
      });
    },
  });

  const stats = {
    total: applications?.length || 0,
    saved: applications?.filter((a) => a.status === "saved").length || 0,
    applied: applications?.filter((a) => a.status === "applied").length || 0,
    interviewing: applications?.filter((a) => a.status === "interviewing").length || 0,
    offered: applications?.filter((a) => a.status === "offered").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
  };

  const successRate = stats.total > 0
    ? Math.round(((stats.interviewing + stats.offered) / stats.total) * 100)
    : 0;

  const filteredApplications = applications?.filter((app) => 
    statusFilter === "all" || app.status === statusFilter
  ) || [];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-primary/5 via-accent/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                My <span className="text-primary">Applications</span>
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Track and manage all your job applications in one place.
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

      <section className="py-8" aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Application Statistics</h2>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {isLoading ? (
              <>
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </>
            ) : (
              <>
                <Card className="overflow-visible">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold" data-testid="text-stat-total">{stats.total}</p>
                  </CardContent>
                </Card>
                <Card className="overflow-visible">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Applied</p>
                    <p className="text-2xl font-bold" data-testid="text-stat-applied">{stats.applied}</p>
                  </CardContent>
                </Card>
                <Card className="overflow-visible">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Interviewing</p>
                    <p className="text-2xl font-bold" data-testid="text-stat-interviewing">{stats.interviewing}</p>
                  </CardContent>
                </Card>
                <Card className="overflow-visible">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Offers</p>
                    <p className="text-2xl font-bold" data-testid="text-stat-offered">{stats.offered}</p>
                  </CardContent>
                </Card>
                <Card className="overflow-visible">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold" data-testid="text-stat-success">{successRate}%</p>
                    <Progress value={successRate} className="mt-2 h-1" aria-label="Success rate" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="py-8" aria-labelledby="applications-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-visible">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle id="applications-heading">All Applications</CardTitle>
                <CardDescription>
                  {filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"} {statusFilter !== "all" && `with status "${statusConfig[statusFilter]?.label || statusFilter}"`}
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44" data-testid="select-filter-status">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
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
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <ApplicationCardSkeleton />
                  <ApplicationCardSkeleton />
                  <ApplicationCardSkeleton />
                </div>
              ) : filteredApplications.length > 0 ? (
                <div className="space-y-4">
                  {filteredApplications.map((application) => {
                    const config = statusConfig[application.status] || statusConfig.applied;
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={application.id}
                        className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                        data-testid={`card-application-${application.id}`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="hidden h-10 w-10 items-center justify-center rounded-md bg-muted sm:flex">
                            <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{application.jobTitle}</h3>
                            <p className="text-sm text-muted-foreground">{application.company}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" aria-hidden="true" />
                                {application.appliedDate}
                              </span>
                              {application.coverLetter && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <FileText className="h-3 w-3" aria-hidden="true" />
                                  Cover Letter
                                </Badge>
                              )}
                              {application.notes && (
                                <Badge variant="outline" className="gap-1 text-xs">
                                  <StickyNote className="h-3 w-3" aria-hidden="true" />
                                  Notes
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" aria-label="View details" data-testid={`button-view-${application.id}`}>
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </DialogTrigger>
                            <ApplicationDetailDialog application={application} />
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Delete application" data-testid={`button-delete-${application.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Application</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this application for {application.jobTitle} at {application.company}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(application.id)}
                                  className="bg-destructive text-destructive-foreground"
                                  data-testid={`button-confirm-delete-${application.id}`}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
      </section>
    </div>
  );
}
