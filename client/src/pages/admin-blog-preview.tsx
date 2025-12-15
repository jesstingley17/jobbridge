import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface PreviewData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  authorName: string;
  featuredImage?: string;
  featuredImageAltText?: string;
  tags?: string[];
  publishedAt: string;
}

export default function AdminBlogPreview() {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get data from URL params first
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('data');
    
    if (encoded) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
        setPreviewData(decoded);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Failed to decode preview data from URL:', e);
      }
    }

    // Fallback to sessionStorage
    const stored = sessionStorage.getItem('blogPreviewData');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPreviewData(data);
        // Clear after reading
        sessionStorage.removeItem('blogPreviewData');
      } catch (e) {
        console.error('Failed to parse preview data from sessionStorage:', e);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No preview data available.</p>
          <p className="text-sm text-muted-foreground">Please open the preview from the blog post editor.</p>
        </div>
      </div>
    );
  }

  const { title, excerpt, content, authorName, featuredImage, featuredImageAltText, tags, publishedAt } = previewData;

  return (
    <div className="min-h-screen bg-background">
      {/* Article Header */}
      <article>
        <header className="border-b bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl mb-6">
              {title || "Untitled Post"}
            </h1>

            {excerpt && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{authorName || "The JobBridge Team"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>{new Date(publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {featuredImage && (
          <div className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img
                  src={featuredImage}
                  alt={featuredImageAltText || ""}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {content ? (
              <div 
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-pre:bg-muted prose-table:border prose-th:border prose-td:border prose-th:bg-muted prose-th:p-2 prose-td:p-2 prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-muted-foreground italic">No content yet.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
