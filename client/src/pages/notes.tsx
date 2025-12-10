import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Note {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export default function Notes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNoteTitle, setNewNoteTitle] = useState("");

  // Fetch notes
  const { data, isLoading } = useQuery<{ notes: Note[] }>({
    queryKey: ["/api/notes"],
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/notes", { title });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNewNoteTitle("");
      toast({
        title: "Note created",
        description: "Your note has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create note",
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteTitle.trim()) {
      createMutation.mutate(newNoteTitle.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h1 className="text-4xl tracking-tight sm:text-5xl md:text-6xl mb-4">
            Notes
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your notes from Supabase
          </p>
        </div>

        {/* Add Note Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="flex-1"
                disabled={createMutation.isPending}
              />
              <Button
                type="submit"
                disabled={createMutation.isPending || !newNoteTitle.trim()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notes List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.notes && data.notes.length > 0 ? (
          <div className="space-y-4">
            {data.notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                      {note.created_at && (
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(note.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(note.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No notes yet. Create your first note above!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Debug: Show raw data */}
        {process.env.NODE_ENV === "development" && data && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Debug: Raw Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-muted p-4 rounded-lg">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

