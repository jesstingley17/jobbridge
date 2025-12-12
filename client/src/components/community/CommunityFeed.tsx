import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PostCard } from "./PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useQuery as useAuthQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function CommunityFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: currentUser } = useAuthQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/community/posts");
      const data = await response.json();
      return data.posts || [];
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/community/posts", {
        content,
        postType: "post",
        isPublic: true,
      });
      return response.json();
    },
    onSuccess: () => {
      setPostContent("");
      setShowCreatePost(false);
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({ title: "Post created!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const posts = data || [];

  return (
    <div className="space-y-6">
      {currentUser && (
        <Card>
          <CardContent className="pt-6">
            {!showCreatePost ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCreatePost(true)}
              >
                What's on your mind?
              </Button>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts, ask questions, or celebrate wins..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreatePost(false);
                      setPostContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createPostMutation.mutate(postContent)}
                    disabled={!postContent.trim() || createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
          </CardContent>
        </Card>
      ) : (
        posts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser?.id}
          />
        ))
      )}
    </div>
  );
}


