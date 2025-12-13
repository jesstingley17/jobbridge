import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { User } from "@shared/schema";
import { getCommunityDisplayName, getInitials } from "@/utils/community-utils";

type CommunityPost = {
  id: string;
  authorId: string;
  content: string;
  mediaUrls?: string[] | null;
  postType?: string | null;
  tags?: string[] | null;
  likesCount: number | null;
  commentsCount: number | null;
  createdAt: Date | string;
  author: User;
};

type PostCardProps = {
  post: CommunityPost;
  currentUserId?: string;
  onDelete?: () => void;
};

export function PostCard({ post, currentUserId, onDelete }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  const { data: comments } = useQuery({
    queryKey: [`/api/community/posts/${post.id}/comments`],
    enabled: showComments,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/community/posts/${post.id}/comments`);
      const data = await response.json();
      return data.comments || [];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/community/posts/${post.id}/reactions`, {
        reactionType: "like",
      });
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: [`/api/community/posts`] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/community/posts/${post.id}/comments`, {
        content: commentContent,
      });
      return response.json();
    },
    onSuccess: () => {
      setCommentContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/community/posts/${post.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/posts`] });
      toast({ title: "Comment posted!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/community/posts/${post.id}`);
    },
    onSuccess: () => {
      toast({ title: "Post deleted" });
      queryClient.invalidateQueries({ queryKey: [`/api/community/posts`] });
      onDelete?.();
    },
  });

  const isAuthor = currentUserId === post.authorId;

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.author.profileImageUrl || undefined} />
              <AvatarFallback>
                {getInitials(post.author)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {getCommunityDisplayName(post.author)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => deleteMutation.mutate()}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
        
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.mediaUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Post media ${idx + 1}`}
                className="rounded-lg object-cover w-full h-48"
              />
            ))}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => likeMutation.mutate()}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
            {post.likesCount || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {post.commentsCount || 0}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && commentContent.trim()) {
                    e.preventDefault();
                    commentMutation.mutate();
                  }
                }}
              />
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!commentContent.trim() || commentMutation.isPending}
              >
                Post
              </Button>
            </div>
            <div className="space-y-3">
              {comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {getInitials(comment.author || null)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {getCommunityDisplayName(comment.author || null)}
                    </p>
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

