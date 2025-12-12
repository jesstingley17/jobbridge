import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, UserPlus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

type CommunityGroup = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  category: string | null;
  membersCount: number;
  postsCount: number;
  owner: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export function GroupsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery<CommunityGroup[]>({
    queryKey: ["/api/community/groups"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/community/groups");
      const data = await response.json();
      return data.groups || [];
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      const response = await apiRequest("POST", `/api/community/groups/${groupId}/join`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/groups"] });
      toast({ title: "Joined group!" });
    },
    onError: () => {
      toast({ title: "Failed to join group", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!groups || groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No groups yet. Create one to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <Card key={group.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.category && (
                  <Badge variant="outline" className="mt-2">
                    {group.category}
                  </Badge>
                )}
              </div>
            </div>
            {group.description && (
              <CardDescription className="line-clamp-2">
                {group.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {group.membersCount} members
              </div>
              <div>{group.postsCount} posts</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => joinGroupMutation.mutate(group.id)}
                disabled={joinGroupMutation.isPending}
              >
                {joinGroupMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Join
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/community/groups/${group.slug}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


