import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plus, Sparkles, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Resume() {
  const { data: resumes, isLoading } = useQuery({
    queryKey: ["/api/resumes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/resumes");
      return response.json();
    },
  });

  return (
    <div className="flex flex-col min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-primary">AI-Powered</span> Resume Builder
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create professional, ATS-optimized resumes in minutes
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Resume Card */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Plus className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
              <h3 className="font-semibold">Create New Resume</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start from scratch with AI guidance
              </p>
              <Link href="/resume?action=create">
                <Button className="mt-4 gap-2">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Existing Resumes */}
          {isLoading ? (
            <>
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-6 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-6 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-9 w-20" />
                </CardContent>
              </Card>
            </>
          ) : resumes && resumes.length > 0 ? (
            resumes.slice(0, 5).map((resume: any) => (
              <Card key={resume.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">
                      {resume.updatedAt 
                        ? new Date(resume.updatedAt).toLocaleDateString()
                        : "Recently edited"}
                    </span>
                  </div>
                  <CardTitle>{resume.title || "Untitled Resume"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {resume.summary || "Professional resume tailored for your career"}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download
                    </Button>
                    <Link href={`/resume?edit=${resume.id}`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Placeholder cards when no resumes exist */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Last edited: Today</span>
                  </div>
                  <CardTitle>Software Engineer Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tailored for tech positions with emphasis on accessibility
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download
                    </Button>
                    <Button size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                    <span className="text-xs text-muted-foreground">Last edited: 2 days ago</span>
                  </div>
                  <CardTitle>UX Designer Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Highlighting design skills and portfolio work
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download
                    </Button>
                    <Button size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
