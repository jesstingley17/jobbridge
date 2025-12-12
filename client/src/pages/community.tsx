import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, UserPlus, MessageCircle, Star, Loader2, Briefcase, Code,
  Home, Users2, Calendar, MessageSquare, Bell
} from "lucide-react";
import { useState } from "react";
import type { User } from "@shared/schema";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { GroupsList } from "@/components/community/GroupsList";
import { EventsList } from "@/components/community/EventsList";

type MentorWithUser = {
  id: string;
  userId: string;
  expertise: string[] | null;
  bio: string | null;
  availability: string | null;
  isActive: boolean | null;
  user: User;
};

export default function Community() {
  const { toast } = useToast();
  const [connectMessage, setConnectMessage] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorWithUser | null>(null);

  // All hooks must be called before any conditional returns
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Add error handling to see what's happening
    onError: (error) => {
      console.error("Error fetching user in community page:", error);
    },
  });

  const { data: mentors, isLoading: mentorsLoading } = useQuery<MentorWithUser[]>({
    queryKey: ["/api/mentors"],
    retry: false,
    // Don't fail the whole page if mentors endpoint fails
    onError: (error) => {
      console.error("Failed to load mentors:", error);
    },
  });

  const connectMutation = useMutation({
    mutationFn: async ({ mentorId, message }: { mentorId: string; message: string }) => {
      const response = await apiRequest("POST", "/api/mentors/connect", { mentorId, message });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Connection request sent!", description: "The mentor will review your request." });
      setSelectedMentor(null);
      setConnectMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send connection request", variant: "destructive" });
    },
  });
  
  // Show loading state while checking auth
  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    );
  }

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "employer": return <Briefcase className="w-4 h-4" />;
      case "developer": return <Code className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Check if user is authenticated - if error is 500, it might be a backend issue, not auth
  if (!currentUser) {
    // If there was an error, show more helpful message
    if (userError) {
      console.error("Auth error in community:", userError);
    }
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to access the community</h1>
        <p className="text-muted-foreground mb-4">
          {userError ? "There was an error checking your authentication. Please try logging in again." : ""}
        </p>
        <Button asChild>
          <a href="/auth" data-testid="link-login-community">Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Connect with mentors, peers, and employers in our inclusive community
        </p>
      </div>

      <Tabs defaultValue="feed" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feed" data-testid="tab-feed">
            <Home className="w-4 h-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="groups" data-testid="tab-groups">
            <Users2 className="w-4 h-4 mr-2" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="mentors" data-testid="tab-mentors">
            <Star className="w-4 h-4 mr-2" />
            Mentors
          </TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-messages">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          <CommunityFeed />
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Community Groups</h2>
            <Button>Create Group</Button>
          </div>
          <GroupsList />
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Button>Create Event</Button>
          </div>
          <EventsList />
        </TabsContent>

        <TabsContent value="mentors" className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">Available Mentors</h2>
            <Badge variant="outline">{mentors?.length || 0} mentors available</Badge>
          </div>

          {mentorsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : mentors && mentors.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <Card key={mentor.id} data-testid={`card-mentor-${mentor.id}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={mentor.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {mentor.user.firstName?.[0]}{mentor.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">
                          {mentor.user.firstName} {mentor.user.lastName}
                        </CardTitle>
                        <CardDescription>{mentor.availability}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mentor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
                    )}
                    {mentor.expertise && mentor.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 4).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {mentor.expertise.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentor.expertise.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedMentor(mentor)}
                          data-testid={`button-connect-mentor-${mentor.id}`}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect with {mentor.user.firstName}</DialogTitle>
                          <DialogDescription>
                            Send a message introducing yourself and why you'd like to connect
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            placeholder="Hi! I'd love to learn from your experience..."
                            value={connectMessage}
                            onChange={(e) => setConnectMessage(e.target.value)}
                            className="min-h-[120px]"
                            data-testid="textarea-connect-message"
                          />
                          <Button 
                            className="w-full"
                            disabled={connectMutation.isPending}
                            onClick={() => {
                              if (selectedMentor) {
                                connectMutation.mutate({ 
                                  mentorId: selectedMentor.id, 
                                  message: connectMessage 
                                });
                              }
                            }}
                            data-testid="button-send-connection"
                          >
                            {connectMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <MessageCircle className="w-4 h-4 mr-2" />
                            )}
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No mentors available yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for mentorship opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Your conversations with mentors and connections
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No messages yet. Connect with a mentor to start a conversation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
