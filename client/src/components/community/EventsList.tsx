import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type CommunityEvent = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  eventType: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  locationUrl: string | null;
  isOnline: boolean | null;
  attendeeCount: number;
  maxAttendees: number | null;
  registrationRequired: boolean | null;
  registrationUrl: string | null;
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export function EventsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery<CommunityEvent[]>({
    queryKey: ["/api/community/events"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/community/events?upcoming=true");
      const data = await response.json();
      return data.events || [];
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest("POST", `/api/community/events/${eventId}/register`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/events"] });
      toast({ title: "Registered for event!" });
    },
    onError: () => {
      toast({ title: "Failed to register", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No upcoming events. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                {event.eventType && (
                  <Badge variant="outline" className="mt-2">
                    {event.eventType}
                  </Badge>
                )}
              </div>
            </div>
            {event.description && (
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.isOnline ? "Online" : event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.attendeeCount} attending
                  {event.maxAttendees && ` / ${event.maxAttendees} max`}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {event.registrationRequired && event.registrationUrl ? (
                <Button variant="outline" className="flex-1" asChild>
                  <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
                    Register
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => registerMutation.mutate(event.id)}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  Register
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


