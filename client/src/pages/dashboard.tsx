import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { AiJobRecommendations } from "@/components/dashboard/AiJobRecommendations";
import { AiSkillsGapAnalysis } from "@/components/dashboard/AiSkillsGapAnalysis";

export default function Dashboard() {
  // Mock data for stats - in real app, fetch from API
  const stats = {
    activeApplications: 8,
    interviewsScheduled: 3,
    resumes: 5,
    profileViews: 24,
  };

  return (
    <div className="flex flex-col min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight">
            Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s your job search overview
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader>
              <Briefcase className="h-8 w-8 text-primary" />
              <CardTitle>Active Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{stats.activeApplications}</p>
              <p className="text-xs text-muted-foreground">+2 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary" />
              <CardTitle>Interviews Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{stats.interviewsScheduled}</p>
              <p className="text-xs text-muted-foreground">Next: Tomorrow</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle>Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{stats.resumes}</p>
              <p className="text-xs text-muted-foreground">2 recently updated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary" />
              <CardTitle>Profile Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{stats.profileViews}</p>
              <p className="text-xs text-muted-foreground">+15% this week</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AiSkillsGapAnalysis />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your recent job applications will appear here
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <AiJobRecommendations />
          </div>
        </div>
      </div>
    </div>
  );
}
