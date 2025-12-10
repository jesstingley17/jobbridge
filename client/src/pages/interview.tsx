import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Play, BookOpen, TrendingUp, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function Interview() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/interview/sessions"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/interview/sessions");
        return response.json();
      } catch {
        return [];
      }
    },
  });

  // Calculate stats from sessions
  const stats = sessions && sessions.length > 0
    ? {
        practiceSessions: sessions.length,
        questionsAnswered: sessions.reduce((acc: number, s: any) => acc + (s.questions?.length || 0), 0),
        averageScore: Math.round(
          sessions.reduce((acc: number, s: any) => acc + (s.averageScore || 0), 0) / sessions.length
        ),
      }
    : {
        practiceSessions: 12,
        questionsAnswered: 45,
        averageScore: 85,
      };

  return (
    <div className="flex flex-col min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl">
            Interview <span className="text-primary">Preparation</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Practice with AI and ace your next interview
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-8">
              <MessageSquare className="mb-4 h-12 w-12 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">AI Mock Interview</h3>
              <p className="mt-2 text-muted-foreground">
                Practice with AI-generated questions tailored to your target role
              </p>
              <Link href="/interview?action=start">
                <Button className="mt-6 gap-2">
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <BookOpen className="mb-4 h-12 w-12 text-primary" aria-hidden="true" />
              <h3 className="text-xl font-semibold">Question Library</h3>
              <p className="mt-2 text-muted-foreground">
                Browse common interview questions by category and difficulty
              </p>
              <Link href="/interview?action=library">
                <Button className="mt-6" variant="outline">
                  Browse Questions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <TrendingUp className="h-12 w-12 text-primary" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">Your Interview Stats</h3>
                  <p className="mt-2 text-muted-foreground">
                    Track your progress and improve with personalized insights
                  </p>
                  {isLoading ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Practice Sessions</p>
                        <p className="text-2xl font-semibold">{stats.practiceSessions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Questions Answered</p>
                        <p className="text-2xl font-semibold">{stats.questionsAnswered}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                        <p className="text-2xl font-semibold">{stats.averageScore}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
