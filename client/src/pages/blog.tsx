import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, BookOpen, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BlogPost {
  id: string;
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string | null;
  tags?: string[];
  labels?: string[]; // For backward compatibility
  featuredImage?: string;
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const { data: postsData, isLoading } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/hubspot/blog/posts"],
    queryFn: async () => {
      const response = await fetch("/api/hubspot/blog/posts");
      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        throw new Error(text || "Failed to load blog posts");
      }
      return response.json();
    },
  });

  const posts = postsData?.posts || [];

  // Derive labels (tags) from tags or labels field
  const allLabels = Array.from(
    new Set(
      posts.flatMap((p) => {
        if (p.tags && Array.isArray(p.tags)) return p.tags;
        if (p.labels && Array.isArray(p.labels)) return p.labels;
        return [];
      })
    )
  );

  // Apply client-side search and label filtering
  const filteredPosts = posts.filter((post) => {
    const postTags = post.tags || post.labels || [];
    const matchesLabel =
      !selectedLabel || postTags.includes(selectedLabel);

    const plainText = post.content.replace(/<[^>]*>/g, "");
    const excerptText = post.excerpt ? post.excerpt.replace(/<[^>]*>/g, "") : "";
    const haystack = `${post.title} ${plainText} ${excerptText}`.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || haystack.includes(query);

    return matchesLabel && matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLabel(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasActiveFilters = searchQuery || selectedLabel !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 mb-6">
              <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-sm">Career Insights & Resources</span>
            </div>
            <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl mb-4">
              The JobBridge Blog
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Expert advice, success stories, and resources to help you navigate your career journey with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search articles"
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear Filters
                </Button>
              )}
            </div>

            {allLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedLabel === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLabel(null)}
                >
                  All Topics
                </Button>
                {allLabels.map((label) => (
                  <Button
                    key={label}
                    variant={selectedLabel === label ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLabel(label)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? "article" : "articles"}
              {selectedLabel && ` in "${selectedLabel}"`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4 mt-4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search or filter"
                  : "Check back soon for new content"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <a
                  key={post.id}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                    <CardHeader className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-muted-foreground line-clamp-3">
                          {/* Strip HTML tags for a simple text preview */}
                          {post.content.replace(/<[^>]*>/g, "").slice(0, 160)}...
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(post.tags || post.labels) && (post.tags || post.labels)!.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(post.tags || post.labels)!.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" aria-hidden="true" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


