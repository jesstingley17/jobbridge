import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Eye, Share2, BookOpen, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  authorName: string;
  featuredImage?: string;
  publishedAt: string;
  views: number;
  tags: string[];
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const { toast } = useToast();
  const slug = params?.slug;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/blog/posts", slug],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/blog/posts/${slug}`);
      if (!response.ok) throw new Error("Post not found");
      const data = await response.json();
      return data.post;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", "related", post?.tags],
    queryFn: async () => {
      if (!post?.tags || post.tags.length === 0) return [];
      const response = await apiRequest("GET", `/api/blog/posts?tag=${post.tags[0]}`);
      const data = await response.json();
      return (data.posts || [])
        .filter((p: BlogPost) => p.id !== post.id && p.publishedAt)
        .slice(0, 3);
    },
    enabled: !!post && post.tags && post.tags.length > 0,
  });

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Blog post link copied to clipboard.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateReadTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return minutes;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-semibold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Article Header */}
      <article>
        <header className="border-b bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <Link href="/blog">
              <Button variant="ghost" className="gap-2 mb-8">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Blog
              </Button>
            </Link>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl mb-6">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {post.authorName?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span>{post.authorName || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" aria-hidden="true" />
                <span>{calculateReadTime(post.content)} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span>{post.views || 0} views</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={post.featuredImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div 
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-muted prose-table:border prose-th:border prose-td:border prose-th:bg-muted prose-th:p-2 prose-td:p-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl tracking-tight md:text-4xl mb-8">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                  <div className="group cursor-pointer rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      <span>{formatDate(relatedPost.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

