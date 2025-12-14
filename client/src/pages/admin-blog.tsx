import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  Save,
  X,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { useLocation } from "wouter";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  authorName?: string;
  featuredImage?: string;
  featuredImageAltText?: string;
  published: boolean;
  publishedAt: string;
  views: number;
  tags?: string[];
  contentfulId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlog() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const { data: postsData, isLoading } = useQuery<{ posts: BlogPost[] }>({
    queryKey: ["/api/admin/blog/posts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/blog/posts");
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setLocation("/admin/login");
          throw new Error("Admin access required");
        }
        throw new Error("Failed to fetch posts");
      }
      return response.json();
    },
    retry: false,
  });

  const posts = postsData?.posts || [];

  const createMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const response = await apiRequest("POST", "/api/admin/blog/posts", post);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogPost> & { id: string }) => {
      const response = await apiRequest("PUT", `/api/admin/blog/posts/${id}`, updates);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, syncToContentful }: { id: string; syncToContentful?: boolean }) => {
      // For DELETE requests with body, use fetch directly
      const { supabase } = await import("@/utils/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ syncToContentful }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Failed to delete post" }));
        throw new Error(error.error || "Failed to delete post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/contentful/sync");
      if (!response.ok) {
        throw new Error("Failed to sync posts");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog/posts"] });
      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced} posts from Contentful`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync posts from Contentful",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsDialogOpen(true);
  };

  const handleDelete = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteSyncToContentful(false);
    setIsDeleteDialogOpen(true);
  };

  const handleNewPost = () => {
    setEditingPost(null);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your blog posts and sync with Contentful
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
              Sync from Contentful
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewPost}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPost ? "Edit Blog Post" : "Create New Blog Post"}
                  </DialogTitle>
                </DialogHeader>
                <BlogPostForm
                  post={editingPost}
                  onSubmit={(data) => {
                    if (editingPost) {
                      updateMutation.mutate({ id: editingPost.id, ...data });
                    } else {
                      createMutation.mutate(data);
                    }
                  }}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingPost(null);
                  }}
                  isSubmitting={createMutation.isPending || updateMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No blog posts yet. Create your first post!
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        {post.published ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                        {post.contentfulId && (
                          <Badge variant="outline">From Contentful</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt || "No excerpt"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.publishedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views || 0} views
                      </div>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(post)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
          </p>
          
          {postToDelete?.contentfulId && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="deleteSyncToContentful"
                  checked={deleteSyncToContentful}
                  onCheckedChange={setDeleteSyncToContentful}
                />
                <Label htmlFor="deleteSyncToContentful" className="text-sm">
                  Also delete from Contentful
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                This post exists in Contentful. Check this to delete it there too.
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setPostToDelete(null);
                setDeleteSyncToContentful(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (postToDelete) {
                  deleteMutation.mutate({ id: postToDelete.id, syncToContentful: deleteSyncToContentful });
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlogPostForm({
  post,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  post: BlogPost | null;
  onSubmit: (data: Partial<BlogPost>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [authorName, setAuthorName] = useState(post?.authorName || "The JobBridge Team");
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage || "");
  const [published, setPublished] = useState(post?.published ?? true);
  const [tags, setTags] = useState(post?.tags?.join(", ") || "");
  const [syncToContentful, setSyncToContentful] = useState(false);
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ? new Date(post.publishedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      slug,
      excerpt,
      content,
      authorName,
      featuredImage,
      featuredImageAltText,
      published,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      publishedAt: new Date(publishedAt).toISOString(),
    });
  };

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!post) {
              setSlug(generateSlug(e.target.value));
            }
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          placeholder="url-friendly-slug"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          placeholder="Brief description of the post"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          required
          placeholder="Blog post content (markdown supported)"
          className="font-mono text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="authorName">Author Name</Label>
          <Input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishedAt">Published Date</Label>
          <Input
            id="publishedAt"
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="featuredImage">Featured Image URL</Label>
          <Input
            id="featuredImage"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL to an image, or upload an image file below
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="featuredImageFile">Upload Featured Image (Optional)</Label>
          <Input
            id="featuredImageFile"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // For now, we'll create a data URL for preview
                // In production, you'd upload to a service like Cloudinary, S3, etc.
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string;
                  setFeaturedImage(result);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Upload an image file. For production, configure an image hosting service (Cloudinary, S3, etc.)
          </p>
        </div>

        {featuredImage && (
          <div className="space-y-2">
            <Label>Image Preview</Label>
            <div className="border rounded-lg p-2 bg-muted/50">
              <img
                src={featuredImage}
                alt={featuredImageAltText || "Featured image preview"}
                className="max-w-full h-auto max-h-64 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="featuredImageAltText">
            Image Alt Text <span className="text-muted-foreground">(for accessibility)</span>
          </Label>
          <Input
            id="featuredImageAltText"
            value={featuredImageAltText}
            onChange={(e) => setFeaturedImageAltText(e.target.value)}
            placeholder="Describe the image for screen readers (e.g., 'Team members working together at a desk')"
          />
          <p className="text-xs text-muted-foreground">
            Alt text helps users with screen readers understand what the image shows. This is important for accessibility.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="career, tips, accessibility"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published">Published</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="syncToContentful"
            checked={syncToContentful}
            onCheckedChange={setSyncToContentful}
          />
          <Label htmlFor="syncToContentful" className="text-sm">
            Sync to Contentful {post?.contentfulId && "(will update existing)"}
          </Label>
        </div>
        {syncToContentful && (
          <p className="text-xs text-muted-foreground ml-6">
            This will create/update the post in Contentful. Requires CONTENTFUL_MANAGEMENT_TOKEN to be configured.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : post ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

