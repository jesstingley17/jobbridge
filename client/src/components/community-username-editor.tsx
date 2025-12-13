import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, Save } from "lucide-react";

export function CommunityUsernameEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user?.communityUsername || "");

  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string | null) => {
      const response = await apiRequest("PATCH", "/api/user/community-username", { username: newUsername });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setOpen(false);
      toast({
        title: "Community username updated",
        description: "Your community username has been saved.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to update username. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const trimmedUsername = username.trim() || null;
    updateUsernameMutation.mutate(trimmedUsername);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset to current username when opening
      setUsername(user?.communityUsername || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2" data-testid="button-edit-community-username">
          <Pencil className="h-4 w-4" />
          Edit Community Username
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Community Username</DialogTitle>
          <DialogDescription>
            Set a custom username for the community. This will be displayed instead of your name in community posts and comments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="community-username">Community Username</Label>
            <Input
              id="community-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., @johndoe, @dev_master"
              maxLength={30}
              data-testid="input-community-username"
            />
            <p className="text-xs text-muted-foreground">
              3-30 characters. Letters, numbers, underscores, and hyphens only. Leave empty to use your name.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-testid="button-cancel-username"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateUsernameMutation.isPending}
              data-testid="button-save-username"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateUsernameMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
